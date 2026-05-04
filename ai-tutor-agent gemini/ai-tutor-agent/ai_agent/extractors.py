import os

import fitz
from PIL import Image
import pytesseract

DEFAULT_TESSERACT_PATH = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
TESSERACT_PATH = os.getenv("TESSERACT_CMD", DEFAULT_TESSERACT_PATH)
pytesseract.pytesseract.tesseract_cmd = TESSERACT_PATH


def extract_text_from_pdf(path: str) -> str:
    parts: list[str] = []
    with fitz.open(path) as pdf:
        for page in pdf:
            page_text = (page.get_text() or "").strip()
            if page_text:
                parts.append(page_text)
                continue

            # OCR fallback for scanned or image-only PDF pages.
            pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
            mode = "RGBA" if pix.alpha else "RGB"
            image = Image.frombytes(mode, [pix.width, pix.height], pix.samples).convert("L")
            ocr_text = (pytesseract.image_to_string(image) or "").strip()
            if ocr_text:
                parts.append(ocr_text)

    return "\n".join(parts)


def extract_text_from_image(path: str) -> str:
    img = Image.open(path).convert("L")
    return pytesseract.image_to_string(img)
