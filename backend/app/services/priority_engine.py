"""Health Priority Engine — ranks what matters most in a report."""

from typing import Any

SEVERITY_WEIGHT = {
    "Severe": 100,
    "Moderate": 75,
    "Mild": 50,
    "Borderline": 30,
    "Normal": 0,
}

IMPACT_FROM_SCORE = [
    (80, "High"),
    (50, "Medium"),
    (0, "Low"),
]


def _impact_label(score: float) -> str:
    for threshold, label in IMPACT_FROM_SCORE:
        if score >= threshold:
            return label
    return "Low"


def _priority_score(name: str, data: dict[str, Any]) -> float:
    if data.get("status") == "Normal":
        return 0.0

    score = SEVERITY_WEIGHT.get(data.get("severity", "Mild"), 50)
    deviation = data.get("deviation_percent") or 0
    score += min(deviation, 60) * 0.5

    if data.get("is_critical"):
        score *= 1.35

    status = data.get("status", "")
    if status in ("High", "Low"):
        score += 10

    return round(score, 2)


def _format_target(range_str: str, status: str, unit: str) -> str:
    if not range_str:
        return "See reference range"
    range_str = range_str.strip()
    unit_suffix = f" {unit}".strip() if unit else ""

    if status == "High":
        if range_str.startswith("<"):
            return f"{range_str}{unit_suffix}"
        parts = range_str.replace("–", "-").split("-")
        if len(parts) == 2:
            return f"<{parts[1].strip()}{unit_suffix}"
        return f"Within {range_str}{unit_suffix}"

    if status == "Low":
        if range_str.startswith(">"):
            return f"{range_str}{unit_suffix}"
        parts = range_str.replace("–", "-").split("-")
        if len(parts) == 2:
            return f">{parts[0].strip()}{unit_suffix}"
        return f"Within {range_str}{unit_suffix}"

    return range_str + unit_suffix


def _default_explanation(name: str, data: dict[str, Any]) -> str:
    status = data.get("status", "")
    severity = data.get("severity", "")
    deviation = data.get("deviation_percent")

    if deviation and deviation > 0:
        direction = "above" if status == "High" else "below"
        return f"Your {name} is {deviation}% {direction} the healthy range — worth addressing soon."

    return f"{severity} {status.lower()} result for {name} compared to your reference range."


def rank_priorities(
    parameters: dict[str, dict[str, Any]],
    ai_one_liners: dict[str, str] | None = None,
    limit: int = 3,
) -> list[dict[str, Any]]:
    """Return top N health priorities ranked by clinical impact score."""
    ai_one_liners = ai_one_liners or {}

    scored: list[tuple[str, dict[str, Any], float]] = []
    for name, data in parameters.items():
        ps = _priority_score(name, data)
        if ps > 0:
            scored.append((name, data, ps))

    scored.sort(key=lambda x: x[2], reverse=True)

    priorities: list[dict[str, Any]] = []
    for rank, (name, data, ps) in enumerate(scored[:limit], start=1):
        unit = data.get("unit", "")
        value_str = data.get("value", "")
        current = f"{value_str} {unit}".strip()
        target = _format_target(data.get("range", ""), data.get("status", ""), unit)

        priorities.append({
            "rank": rank,
            "parameter": name,
            "current_value": current,
            "target_value": target,
            "impact": _impact_label(ps),
            "impact_score": ps,
            "status": data.get("status"),
            "severity": data.get("severity"),
            "trend_key": data.get("trend_key"),
            "explanation": ai_one_liners.get(name) or _default_explanation(name, data),
        })

    return priorities


def build_am_i_okay_summary(
    health_score: dict[str, Any],
    priorities: list[dict[str, Any]],
) -> str:
    score = health_score.get("score", 0)
    category = health_score.get("status") or health_score.get("category", "")

    if score >= 90:
        return "Overall, your results look healthy. Keep up your current habits."
    if score >= 75:
        return "You're mostly in good shape with a few areas to watch."
    if not priorities:
        return f"Your health score is {score}/100 ({category}). Review details with your doctor."
    top = priorities[0]["parameter"]
    return f"Your score is {score}/100 ({category}). Focus first on {top}."
