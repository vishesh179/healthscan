import json
import re
from typing import Any

import google.generativeai as genai

from app.config import settings
from app.services.health_score_service import calculate_health_score
from app.services.insights_service import generate_calculated_insights
from app.services.priority_engine import (
    build_am_i_okay_summary,
    rank_priorities,
)
from app.services.severity_service import (
    build_parameter_snapshots,
    detect_abnormal_values,
    enrich_parameters,
)

DISCLAIMER = (
    "This analysis is for educational purposes only and should not be considered "
    "medical advice. Please consult a qualified healthcare professional."
)

MODEL_NAME = "gemini-flash-latest"
ANALYSIS_VERSION = 3


def _configure_gemini() -> None:
    if not settings.gemini_api_key:
        raise ValueError("GEMINI_API_KEY is not configured")
    genai.configure(api_key=settings.gemini_api_key)


def _extract_json(text: str) -> Any:
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
        cleaned = re.sub(r"\s*```$", "", cleaned)
    return json.loads(cleaned)


def _get_model() -> genai.GenerativeModel:
    _configure_gemini()
    return genai.GenerativeModel(MODEL_NAME)


def extract_parameters(extracted_text: str) -> dict[str, dict[str, str]]:
    if not extracted_text.strip():
        return {}

    prompt = f"""Extract medical test parameters from this report. Return ONLY JSON:
{{"Parameter Name": {{"value": "", "unit": "", "range": ""}}}}

Report:
{extracted_text}
"""
    model = _get_model()
    response = model.generate_content(prompt)
    result = _extract_json(response.text)
    return result if isinstance(result, dict) else {}


def _generate_dashboard_content(
    parameters: dict[str, dict[str, Any]],
    priorities: list[dict[str, Any]],
    health_score: dict[str, Any],
    extracted_text: str,
) -> dict[str, Any]:
    """Concise dashboard copy only — no long essays."""
    priority_names = [p["parameter"] for p in priorities]

    prompt = f"""You are HealthScan's prioritization engine. Generate CONCISE dashboard content only.

RULES:
- Never diagnose or prescribe medications
- Max 1 sentence per priority explanation
- Max 5 doctor questions, each one sentence
- Max 3 items per action list
- No paragraphs, no textbook definitions

Patient score: {health_score['score']}/100 ({health_score['status']})
Top priorities: {json.dumps(priority_names)}

Parameters:
{json.dumps({k: parameters[k] for k in priority_names if k in parameters}, indent=2)}

Return ONLY JSON:
{{
  "priority_one_liners": {{
    "Parameter Name": "One sentence why this matters for THIS patient"
  }},
  "doctor_questions": ["question1", "question2"],
  "recommended_actions": {{
    "this_week": ["short action"],
    "this_month": ["short action"]
  }}
}}

Report excerpt:
{extracted_text[:2500]}
"""
    model = _get_model()
    response = model.generate_content(prompt)
    return _extract_json(response.text)


def _generate_deep_context(
    parameters: dict[str, dict[str, Any]],
    priorities: list[dict[str, Any]],
    extracted_text: str,
) -> dict[str, Any]:
    """Full detail for chat only — not shown on dashboard."""
    abnormal = {k: v for k, v in parameters.items() if v.get("status") != "Normal"}

    prompt = f"""Generate detailed health coach context for chat (NOT for dashboard display).

RULES: No diagnosis, no medication prescriptions. Educational only.

Return ONLY JSON:
{{
  "personalized_explanations": [
    {{
      "parameter": "name",
      "what_it_measures": "brief",
      "patient_value": "value unit",
      "normal_range": "range",
      "severity": "Mild",
      "what_it_means": "patient-specific meaning",
      "common_causes": ["a","b"],
      "possible_symptoms": ["a"],
      "recommendations": ["lifestyle only"],
      "when_to_see_doctor": "brief"
    }}
  ],
  "related_groups": [
    {{"name": "e.g. Cholesterol panel", "parameters": ["LDL","HDL"], "note": "brief"}}
  ]
}}

Include explanations for abnormal parameters only.
Priorities: {json.dumps(priorities, indent=2)}

All parameters:
{json.dumps(parameters, indent=2)}

Report:
{extracted_text[:4000]}
"""
    model = _get_model()
    response = model.generate_content(prompt)
    return _extract_json(response.text)


def generate_analysis(
    parameters: dict[str, dict[str, str]],
    extracted_text: str,
    report_id: str = "",
    created_at: str = "",
) -> dict[str, Any]:
    """V3: Priority-first, concise dashboard + deep context for chat."""
    enriched = enrich_parameters(parameters)
    health_score = calculate_health_score(enriched)

    preliminary_priorities = rank_priorities(enriched, limit=3)
    dashboard_ai = _generate_dashboard_content(
        enriched, preliminary_priorities, health_score, extracted_text
    )

    one_liners = dashboard_ai.get("priority_one_liners", {})
    priority_rankings = rank_priorities(enriched, ai_one_liners=one_liners, limit=3)

    insights = generate_calculated_insights(enriched, max_insights=5)
    deep_context = _generate_deep_context(enriched, priority_rankings, extracted_text)

    actions = dashboard_ai.get("recommended_actions", {})
    recommended_actions = {
        "this_week": (actions.get("this_week") or [])[:3],
        "this_month": (actions.get("this_month") or [])[:3],
    }

    doctor_questions = (dashboard_ai.get("doctor_questions") or [])[:5]
    abnormal_count = sum(1 for v in enriched.values() if v.get("status") != "Normal")

    analysis: dict[str, Any] = {
        "version": ANALYSIS_VERSION,
        "health_score": health_score,
        "priority_rankings": priority_rankings,
        "insights": insights,
        "recommended_actions": recommended_actions,
        "doctor_questions": doctor_questions,
        "am_i_okay": build_am_i_okay_summary(health_score, priority_rankings),
        "deep_context": deep_context,
        "disclaimer": DISCLAIMER,
        "abnormal_count": abnormal_count,
        "total_parameters": len(enriched),
        "parameter_snapshots": build_parameter_snapshots(enriched, report_id, created_at),
        "summary": build_am_i_okay_summary(health_score, priority_rankings),
        "personalized_explanations": deep_context.get("personalized_explanations", []),
    }

    return analysis


def chat_with_report(
    report_context: dict[str, Any],
    user_message: str,
    chat_history: list[dict[str, str]],
) -> str:
    history_text = "\n".join(
        f"{msg['role'].upper()}: {msg['content']}" for msg in chat_history[-10:]
    )

    parameters = report_context.get("parameters", {})
    analysis = report_context.get("analysis", {})
    deep = analysis.get("deep_context", report_context.get("deep_context", {}))
    priorities = analysis.get("priority_rankings", report_context.get("priority_rankings", []))
    health_score = analysis.get("health_score", report_context.get("health_score", {}))

    msg_lower = user_message.lower()
    wants_detail = any(
        phrase in msg_lower
        for phrase in (
            "explain my report",
            "in detail",
            "full analysis",
            "tell me more",
            "everything",
            "detailed",
        )
    )
    wants_priority = any(
        phrase in msg_lower
        for phrase in (
            "focus first",
            "priority",
            "most concerning",
            "what matters",
            "am i okay",
        )
    )

    mode_instruction = ""
    if wants_detail:
        mode_instruction = (
            "MODE: Detailed health coach. Provide thorough explanation with sections. "
            "Use personalized_explanations data. Can be longer."
        )
    elif wants_priority:
        mode_instruction = (
            "MODE: Priority ranking. List Priority 1, 2, 3 with impact and one-line why. "
            "Be direct and actionable."
        )
    else:
        mode_instruction = (
            "MODE: Concise health coach. 2-4 short paragraphs max unless user asked for detail. "
            "Lead with patient-specific numbers."
        )

    prompt = f"""You are HealthScan's AI Health Coach — a prioritization assistant, NOT a generic chatbot.

{mode_instruction}

RULES:
- Never diagnose diseases or prescribe medications
- Use this patient's actual values
- Rank by importance when relevant
- Answer "why is my X high/low" with patient value, range, causes, lifestyle tips
- If not in report, say you can only discuss this report

Health Score: {json.dumps(health_score)}
Priorities: {json.dumps(priorities, indent=2)}
Key Insights: {json.dumps(analysis.get('insights', []))}
Doctor Questions: {json.dumps(analysis.get('doctor_questions', []))}
Actions: {json.dumps(analysis.get('recommended_actions', {}))}

Parameters: {json.dumps(parameters, indent=2)}

Deep Context (for detailed answers):
{json.dumps(deep, indent=2)}

History:
{history_text}

Question: {user_message}
"""

    model = _get_model()
    response = model.generate_content(prompt)
    return response.text.strip()
