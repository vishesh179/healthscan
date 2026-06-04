from pathlib import Path

import pdfplumber
import fitz
import pytesseract
from PIL import Image


def extract_text_from_pdf(file_path: str) -> str:
    """Extract text from PDF using pdfplumber, falling back to PyMuPDF."""
    text_parts: list[str] = []

    try:
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text_parts.append(page_text)
    except Exception:
        text_parts = []

    if text_parts and len("".join(text_parts).strip()) > 50:
        return "\n\n".join(text_parts)

    try:
        doc = fitz.open(file_path)
        for page in doc:
            page_text = page.get_text()
            if page_text:
                text_parts.append(page_text)
        doc.close()
    except Exception:
        pass

    return "\n\n".join(text_parts).strip()


def extract_text_from_image(file_path: str) -> str:
    """Extract text from image using Tesseract OCR."""
    image = Image.open(file_path)
    if image.mode not in ("RGB", "L"):
        image = image.convert("RGB")
    return pytesseract.image_to_string(image).strip()


def extract_text(file_path: str, file_type: str) -> str:
    path = Path(file_path)
    if file_type == "pdf":
        return extract_text_from_pdf(str(path))
    return extract_text_from_image(str(path))
