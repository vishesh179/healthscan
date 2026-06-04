from fastapi import APIRouter, HTTPException

from app.services import db_service
from app.services.gemini_service import DISCLAIMER

router = APIRouter()


def _normalize_legacy_report(report: dict) -> dict:
    """Map V1/V2 reports to V3 dashboard shape."""
    analysis = report.get("analysis") or {}
    version = analysis.get("version", report.get("analysis_version", 1))

    if version >= 3:
        return report

    hs = report.get("health_score") or analysis.get("health_score") or {}
    if hs and "reasons" not in hs:
        reducers = hs.get("score_reducers", [])
        hs["reasons"] = [
            f"{name} (see report)" for name in reducers
        ] if reducers else []
        hs["status"] = hs.get("status") or hs.get("category", "Fair")

    priorities = report.get("priority_rankings") or analysis.get("priority_rankings")
    if not priorities:
        explanations = analysis.get("personalized_explanations", [])
        abnormal_params = [
            (n, d) for n, d in (report.get("parameters") or {}).items()
            if d.get("status") != "Normal"
        ]
        priorities = []
        for i, (name, data) in enumerate(abnormal_params[:3], 1):
            unit = data.get("unit", "")
            priorities.append({
                "rank": i,
                "parameter": name,
                "current_value": f"{data.get('value', '')} {unit}".strip(),
                "target_value": data.get("range", "See report"),
                "impact": "Medium",
                "explanation": next(
                    (e.get("what_it_means", "") for e in explanations if e.get("parameter") == name),
                    f"{name} is outside the normal range.",
                ),
            })
        report["priority_rankings"] = priorities

    report.setdefault("insights", analysis.get("insights", [])[:5])
    report.setdefault("doctor_questions", analysis.get("doctor_questions", []))
    report.setdefault("recommended_actions", analysis.get("recommended_actions", {}))
    report.setdefault("health_score", hs)
    report.setdefault("am_i_okay", analysis.get("summary", ""))

    return report


@router.get("/report/{report_id}")
async def get_report(report_id: str):
    report = db_service.get_report(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    report = _normalize_legacy_report(report)
    analysis = report.get("analysis") or {}

    return {
        "report_id": report["_id"],
        "filename": report["filename"],
        "file_type": report["file_type"],
        "parameters": report.get("parameters", {}),
        "analysis": analysis,
        "analysis_version": report.get("analysis_version", analysis.get("version", 1)),
        "health_score": report.get("health_score") or analysis.get("health_score"),
        "priority_rankings": report.get("priority_rankings") or analysis.get("priority_rankings", []),
        "insights": (report.get("insights") or analysis.get("insights", []))[:5],
        "recommended_actions": report.get("recommended_actions") or analysis.get("recommended_actions", {}),
        "doctor_questions": (report.get("doctor_questions") or analysis.get("doctor_questions", []))[:5],
        "am_i_okay": report.get("am_i_okay") or analysis.get("am_i_okay") or analysis.get("summary", ""),
        "chat_history": report.get("chat_history", []),
        "created_at": report.get("created_at"),
        "disclaimer": DISCLAIMER,
    }
