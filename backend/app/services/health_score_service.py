from typing import Any

SEVERITY_PENALTIES = {
    "Normal": 0,
    "Borderline": 3,
    "Mild": 8,
    "Moderate": 15,
    "Severe": 25,
}

CATEGORY_RANGES = [
    (90, 100, "Excellent"),
    (75, 89, "Good"),
    (60, 74, "Fair"),
    (0, 59, "Needs Attention"),
]


def get_score_category(score: int) -> str:
    for low, high, label in CATEGORY_RANGES:
        if low <= score <= high:
            return label
    return "Needs Attention"


def calculate_health_score(
    parameters: dict[str, dict[str, Any]],
) -> dict[str, Any]:
    score = 100
    reasons: list[str] = []

    abnormal = [
        (name, data)
        for name, data in parameters.items()
        if data.get("status") != "Normal"
    ]

    weighted: list[tuple[str, dict[str, Any], int]] = []
    for name, data in abnormal:
        severity = data.get("severity", "Mild")
        penalty = SEVERITY_PENALTIES.get(severity, 8)
        if data.get("is_critical"):
            penalty = int(penalty * 1.4)
        score -= penalty
        weighted.append((name, data, penalty))

    if len(abnormal) > 5:
        score -= (len(abnormal) - 5) * 2

    score = max(0, min(100, round(score)))
    status = get_score_category(score)

    weighted.sort(key=lambda x: x[2], reverse=True)
    for name, data, _ in weighted[:4]:
        label = data.get("status", "")
        reasons.append(f"{name} {label}")

    return {
        "score": score,
        "status": status,
        "category": status,
        "reasons": reasons,
        "score_reducers": [r.split(" ")[0] for r in reasons],
        "explanation": "",
    }
