import os

import fitz
from PIL import Image
import pytesseract

DEFAULT_TESSERACT_PATH = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
TESSERACT_PATH = os.getenv("TESSERACT_CMD", DEFAULT_TESSERACT_PATH)
pytesseract.pytesseract.tesseract_cmd = TESSERACT_PATH


def extract_text_from_pdf(path: str) -> str:
    parts: list[str] = []
    try:
        with fitz.open(path) as pdf:
            if pdf.is_encrypted:
                if not pdf.authenticate(""):
                    print("PDF is encrypted and requires a password to read.")
                    return ""
            
            ocr_pages_done = 0
            for page in pdf:
                page_text = (page.get_text() or "").strip()
                if page_text:
                    parts.append(page_text)
                    continue

                # OCR fallback for scanned or image-only PDF pages.
                if ocr_pages_done >= 5:
                    print("Reached OCR page limit (5 pages) to prevent hanging, skipping remaining scanned pages.")
                    break
                
                print(f"Running OCR on scanned page {page.number}...")
                pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
                mode = "RGBA" if pix.alpha else "RGB"
                image = Image.frombytes(mode, [pix.width, pix.height], pix.samples).convert("L")
                ocr_text = (pytesseract.image_to_string(image) or "").strip()
                if ocr_text:
                    parts.append(ocr_text)
                ocr_pages_done += 1
    except Exception as e:
        print(f"Failed to read PDF: {e}")

    return "\n".join(parts)


def extract_text_from_image(path: str) -> str:
    img = Image.open(path).convert("L")
    return pytesseract.image_to_string(img)
