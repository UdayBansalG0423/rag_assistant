from pypdf import PdfReader


def extract_pdf_text(path: str) -> str:
    reader = PdfReader(path)
    text = ""

    for page in reader.pages:
        page_text = page.extract_text() or ""
        text += page_text

    return text