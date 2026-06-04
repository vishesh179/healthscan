import re
from typing import Any

CRITICAL_MARKERS = {
    "hemoglobin", "hb", "hgb",
    "glucose", "fasting glucose", "blood sugar", "hba1c", "a1c",
    "ldl", "ldl cholesterol", "cholesterol",
    "vitamin d", "25-oh vitamin d",
    "creatinine", "egfr",
    "potassium", "sodium",
    "wbc", "white blood cell",
    "platelet", "platelets",
}

TREND_KEY_MAP = {
    "hemoglobin": "hemoglobin",
    "hb": "hemoglobin",
    "hgb": "hemoglobin",
    "vitamin d": "vitamin_d",
    "25-oh vitamin d": "vitamin_d",
    "ldl": "ldl_cholesterol",
    "ldl cholesterol": "ldl_cholesterol",
    "glucose": "glucose",
    "fasting glucose": "glucose",
    "blood sugar": "glucose",
    "hba1c": "hba1c",
    "a1c": "hba1c",
    "hdl": "hdl_cholesterol",
    "total cholesterol": "total_cholesterol",
    "triglycerides": "triglycerides",
    "creatinine": "creatinine",
    "tsh": "tsh",
    "ferritin": "ferritin",
    "iron": "iron",
}


def _parse_numeric(value: str) -> float | None:
    if not value:
        return None
    match = re.search(r"[\d.]+", str(value).replace(",", ""))
    if match:
        try:
            return float(match.group())
        except ValueError:
            return None
    return None


def _parse_range(range_str: str) -> tuple[float | None, float | None]:
    if not range_str:
        return None, None
    range_str = range_str.strip()
    less_than = re.match(r"^<\s*([\d.]+)", range_str)
    if less_than:
        return None, float(less_than.group(1))
    greater_than = re.match(r"^>\s*([\d.]+)", range_str)
    if greater_than:
        return float(greater_than.group(1)), None
    range_match = re.search(r"([\d.]+)\s*[-–—]\s*([\d.]+)", range_str)
    if range_match:
        return float(range_match.group(1)), float(range_match.group(2))
    return None, None


def normalize_trend_key(parameter_name: str) -> str:
    key = parameter_name.lower().strip()
    return TREND_KEY_MAP.get(key, re.sub(r"[^a-z0-9]+", "_", key).strip("_"))


def is_critical_marker(parameter_name: str) -> bool:
    key = parameter_name.lower().strip()
    return any(marker in key or key in marker for marker in CRITICAL_MARKERS)


def compute_deviation_percent(
    value: float,
    low: float | None,
    high: float | None,
    status: str,
) -> float | None:
    if status == "Normal":
        return 0.0
    if status == "High" and high is not None and high > 0:
        return round(((value - high) / high) * 100, 1)
    if status == "Low" and low is not None and low > 0:
        return round(((low - value) / low) * 100, 1)
    if low is not None and high is not None:
        mid = (low + high) / 2
        if mid > 0:
            return round(abs(value - mid) / mid * 100, 1)
    return None


def classify_severity(
    value: float,
    low: float | None,
    high: float | None,
    status: str,
) -> str:
    if status == "Normal":
        return "Normal"

    deviation = compute_deviation_percent(value, low, high, status)
    if deviation is None:
        return "Borderline" if status != "Normal" else "Normal"

    if deviation <= 5:
        return "Borderline"
    if deviation <= 15:
        return "Mild"
    if deviation <= 35:
        return "Moderate"
    return "Severe"


def detect_abnormal_values(
    parameters: dict[str, dict[str, str]],
) -> dict[str, dict[str, str]]:
    results: dict[str, dict[str, str]] = {}

    for name, data in parameters.items():
        value_str = data.get("value", "")
        range_str = data.get("range", "")
        unit = data.get("unit", "")

        numeric_value = _parse_numeric(value_str)
        low, high = _parse_range(range_str)

        status = "Normal"
        if numeric_value is not None:
            if high is not None and numeric_value > high:
                status = "High"
            elif low is not None and numeric_value < low:
                status = "Low"
            elif low is not None and high is not None:
                if numeric_value > high:
                    status = "High"
                elif numeric_value < low:
                    status = "Low"

        results[name] = {
            "value": value_str,
            "unit": unit,
            "range": range_str,
            "status": status,
        }

    return results


def enrich_parameters(
    parameters: dict[str, dict[str, str]],
) -> dict[str, dict[str, Any]]:
    enriched: dict[str, dict[str, Any]] = {}

    for name, data in parameters.items():
        value_str = data.get("value", "")
        range_str = data.get("range", "")
        unit = data.get("unit", "")
        status = data.get("status", "Normal")

        numeric_value = _parse_numeric(value_str)
        low, high = _parse_range(range_str)

        severity = "Normal"
        deviation_percent = None

        if numeric_value is not None and status != "Normal":
            severity = classify_severity(numeric_value, low, high, status)
            deviation_percent = compute_deviation_percent(
                numeric_value, low, high, status
            )

        enriched[name] = {
            "value": value_str,
            "unit": unit,
            "range": range_str,
            "status": status,
            "severity": severity,
            "deviation_percent": deviation_percent,
            "is_critical": is_critical_marker(name),
            "trend_key": normalize_trend_key(name),
            "numeric_value": numeric_value,
        }

    return enriched


def build_parameter_snapshots(
    parameters: dict[str, dict[str, Any]],
    report_id: str,
    created_at: str,
) -> list[dict[str, Any]]:
    """Snapshots for future multi-report trend analysis."""
    snapshots = []
    for name, data in parameters.items():
        if data.get("numeric_value") is None:
            continue
        snapshots.append({
            "trend_key": data["trend_key"],
            "parameter_name": name,
            "value": data["numeric_value"],
            "unit": data.get("unit", ""),
            "status": data.get("status", "Normal"),
            "severity": data.get("severity", "Normal"),
            "report_id": report_id,
            "recorded_at": created_at,
        })
    return snapshots
