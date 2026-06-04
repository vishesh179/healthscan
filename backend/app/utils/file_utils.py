import re
from pathlib import Path

ALLOWED_EXTENSIONS = {".pdf", ".png", ".jpg", ".jpeg"}
IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg"}


def get_file_extension(filename: str) -> str:
    return Path(filename).suffix.lower()


def is_allowed_file(filename: str) -> bool:
    return get_file_extension(filename) in ALLOWED_EXTENSIONS


def is_image_file(filename: str) -> bool:
    return get_file_extension(filename) in IMAGE_EXTENSIONS


def is_pdf_file(filename: str) -> bool:
    return get_file_extension(filename) == ".pdf"


def sanitize_filename(filename: str) -> str:
    name = Path(filename).name
    return re.sub(r"[^\w.\-]", "_", name)
