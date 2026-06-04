import uuid
from datetime import datetime, timezone
from typing import Any

from pymongo import MongoClient
from pymongo.collection import Collection

from app.config import settings

_client: MongoClient | None = None
ANALYSIS_VERSION = 3


def get_client() -> MongoClient:
    global _client
    if _client is None:
        _client = MongoClient(settings.mongodb_uri)
    return _client


def get_reports_collection() -> Collection:
    return get_client()[settings.mongodb_db]["reports"]


def get_trends_collection() -> Collection:
    """Future multi-report trend storage."""
    return get_client()[settings.mongodb_db]["parameter_trends"]


def create_report(
    filename: str,
    file_path: str,
    file_type: str,
    extracted_text: str,
    user_id: str | None = None,
) -> dict[str, Any]:
    report_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    document = {
        "_id": report_id,
        "filename": filename,
        "file_path": file_path,
        "file_type": file_type,
        "extracted_text": extracted_text,
        "user_id": user_id,
        "parameters": {},
        "analysis": None,
        "analysis_version": None,
        "health_score": None,
        "priority_rankings": [],
        "insights": [],
        "recommended_actions": {},
        "doctor_questions": [],
        "deep_context": None,
        "parameter_snapshots": [],
        "health_score_history": [],
        "chat_history": [],
        "created_at": now,
        "updated_at": now,
    }
    get_reports_collection().insert_one(document)
    return document


def get_report(report_id: str) -> dict[str, Any] | None:
    return get_reports_collection().find_one({"_id": report_id})


def update_report(report_id: str, updates: dict[str, Any]) -> dict[str, Any] | None:
    updates["updated_at"] = datetime.now(timezone.utc).isoformat()
    get_reports_collection().update_one({"_id": report_id}, {"$set": updates})
    return get_report(report_id)


def save_analysis(
    report_id: str,
    parameters: dict[str, Any],
    analysis: dict[str, Any],
) -> dict[str, Any] | None:
    """Persist V3 analysis with top-level fields for API and future trends."""
    health_score = analysis.get("health_score", {})
    updates: dict[str, Any] = {
        "parameters": parameters,
        "analysis": analysis,
        "analysis_version": analysis.get("version", ANALYSIS_VERSION),
        "health_score": health_score,
        "priority_rankings": analysis.get("priority_rankings", []),
        "insights": analysis.get("insights", []),
        "recommended_actions": analysis.get("recommended_actions", {}),
        "doctor_questions": analysis.get("doctor_questions", []),
        "deep_context": analysis.get("deep_context"),
        "parameter_snapshots": analysis.get("parameter_snapshots", []),
    }

    updated = update_report(report_id, updates)

    if health_score and updated:
        _append_score_history(report_id, health_score, updated.get("created_at"))

    _store_trend_snapshots(
        report_id,
        analysis.get("parameter_snapshots", []),
        updated,
    )
    return updated


def _append_score_history(
    report_id: str,
    health_score: dict[str, Any],
    recorded_at: str | None,
) -> None:
    """Foundation for tracking score changes over time."""
    entry = {
        "score": health_score.get("score"),
        "status": health_score.get("status") or health_score.get("category"),
        "recorded_at": recorded_at,
    }
    get_reports_collection().update_one(
        {"_id": report_id},
        {"$push": {"health_score_history": entry}},
    )


def _store_trend_snapshots(
    report_id: str,
    snapshots: list[dict[str, Any]],
    report: dict[str, Any] | None,
) -> None:
    if not snapshots or not report:
        return

    user_id = report.get("user_id")
    for snap in snapshots:
        doc = {
            **snap,
            "report_id": report_id,
            "user_id": user_id,
            "recorded_at": report.get("created_at"),
        }
        get_trends_collection().update_one(
            {"trend_key": snap["trend_key"], "report_id": report_id},
            {"$set": doc},
            upsert=True,
        )


def append_chat_message(report_id: str, role: str, content: str) -> None:
    get_reports_collection().update_one(
        {"_id": report_id},
        {
            "$push": {"chat_history": {"role": role, "content": content}},
            "$set": {"updated_at": datetime.now(timezone.utc).isoformat()},
        },
    )


# Backward compatibility alias
save_v2_analysis = save_analysis
