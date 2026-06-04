from typing import Any


def generate_calculated_insights(
    parameters: dict[str, dict[str, Any]],
    max_insights: int = 5,
) -> list[str]:
    """Concise, calculation-based insights for dashboard (max 5)."""
    insights: list[str] = []

    abnormal = [
        (name, data)
        for name, data in parameters.items()
        if data.get("status") != "Normal"
    ]
    abnormal.sort(
        key=lambda x: x[1].get("deviation_percent") or 0,
        reverse=True,
    )

    for name, data in abnormal:
        deviation = data.get("deviation_percent")
        status = data.get("status", "")
        if deviation and deviation > 0:
            direction = "above" if status == "High" else "below"
            short_name = name.split("(")[0].strip()
            insights.append(
                f"{short_name} is {deviation}% {direction} target."
            )
        else:
            value = f"{data.get('value', '')} {data.get('unit', '')}".strip()
            insights.append(f"{name} ({value}) is {status.lower()}.")

    normal_count = sum(1 for d in parameters.values() if d.get("status") == "Normal")
    total = len(parameters)
    if total > 0 and len(insights) < max_insights:
        if normal_count == total:
            insights.insert(0, "All measured parameters are within normal range.")
        elif normal_count > 0 and len(abnormal) <= 2:
            insights.append(f"{normal_count} of {total} markers are in healthy range.")

    return insights[:max_insights]
