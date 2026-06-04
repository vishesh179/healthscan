import uuid
from fastapi import APIRouter, File, HTTPException, UploadFile

from app.config import settings
from app.services import db_service
from app.services.text_extraction import extract_text
from app.utils.file_utils import (
    get_file_extension,
    is_allowed_file,
    is_pdf_file,
    sanitize_filename,
)

router = APIRouter()


@router.post("/upload")
async def upload_report(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    if not is_allowed_file(file.filename):
        raise HTTPException(
            status_code=400,
            detail="Invalid file type. Allowed: PDF, PNG, JPG, JPEG",
        )

    safe_name = sanitize_filename(file.filename)
    file_type = "pdf" if is_pdf_file(file.filename) else "image"
    ext = get_file_extension(safe_name)

    report_id = str(uuid.uuid4())
    save_path = settings.upload_path / f"{report_id}{ext}"

    content = await file.read()
    save_path.write_bytes(content)

    try:
        extracted_text = extract_text(str(save_path), file_type)
    except Exception as exc:
        save_path.unlink(missing_ok=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to extract text from file: {exc}",
        ) from exc

    if not extracted_text.strip():
        save_path.unlink(missing_ok=True)
        raise HTTPException(
            status_code=422,
            detail="Could not extract text from the uploaded file. Please upload a clearer report.",
        )

    report = db_service.create_report(
        filename=safe_name,
        file_path=str(save_path),
        file_type=file_type,
        extracted_text=extracted_text,
    )

    return {
        "report_id": report["_id"],
        "filename": report["filename"],
        "file_type": report["file_type"],
        "extracted_text": report["extracted_text"],
        "message": "Report uploaded successfully",
    }
