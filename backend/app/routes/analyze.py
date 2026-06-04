from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services import db_service
from app.services.gemini_service import (
    detect_abnormal_values,
    extract_parameters,
    generate_analysis,
)
from app.services.severity_service import enrich_parameters

router = APIRouter()


class AnalyzeRequest(BaseModel):
    report_id: str


@router.post("/analyze")
async def analyze_report(request: AnalyzeRequest):
    report = db_service.get_report(request.report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    try:
        raw_parameters = extract_parameters(report["extracted_text"])
        base_parameters = detect_abnormal_values(raw_parameters)
        parameters = enrich_parameters(base_parameters)

        analysis = generate_analysis(
            base_parameters,
            report["extracted_text"],
            report_id=request.report_id,
            created_at=report.get("created_at", ""),
        )

        updated = db_service.save_analysis(
            request.report_id,
            parameters,
            analysis,
        )
    except ValueError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Analysis failed: {exc}",
        ) from exc

    return {
        "report_id": request.report_id,
        "parameters": parameters,
        "analysis": analysis,
        "health_score": analysis.get("health_score"),
        "priority_rankings": analysis.get("priority_rankings"),
        "insights": analysis.get("insights"),
        "recommended_actions": analysis.get("recommended_actions"),
        "doctor_questions": analysis.get("doctor_questions"),
        "am_i_okay": analysis.get("am_i_okay"),
        "filename": updated["filename"] if updated else report["filename"],
    }
