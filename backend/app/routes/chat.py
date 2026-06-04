from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services import db_service
from app.services.gemini_service import chat_with_report

router = APIRouter()


class ChatRequest(BaseModel):
    report_id: str
    message: str


@router.post("/chat")
async def chat_about_report(request: ChatRequest):
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    report = db_service.get_report(request.report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    if not report.get("analysis"):
        raise HTTPException(
            status_code=400,
            detail="Report has not been analyzed yet. Please run analysis first.",
        )

    db_service.append_chat_message(request.report_id, "user", request.message)

    try:
        analysis = report.get("analysis", {})
        reply = chat_with_report(
            report_context={
                "parameters": report.get("parameters", {}),
                "analysis": analysis,
                "health_score": report.get("health_score") or analysis.get("health_score"),
                "priority_rankings": report.get("priority_rankings") or analysis.get("priority_rankings", []),
                "deep_context": report.get("deep_context") or analysis.get("deep_context"),
                "extracted_text": report.get("extracted_text", ""),
            },
            user_message=request.message,
            chat_history=report.get("chat_history", []),
        )
    except ValueError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Chat failed: {exc}",
        ) from exc

    db_service.append_chat_message(request.report_id, "assistant", reply)

    updated = db_service.get_report(request.report_id)

    return {
        "report_id": request.report_id,
        "reply": reply,
        "chat_history": updated.get("chat_history", []),
    }
