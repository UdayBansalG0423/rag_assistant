from pypdf import PdfReader


def extract_pdf_pages(path: str) -> list[dict]:
    reader = PdfReader(path)
    pages = []

    for page_number, page in enumerate(reader.pages, start=1):
        page_text = page.extract_text() or ""
        pages.append({
            "page_number": page_number,
            "text": page_text,
        })

    return pages


def extract_pdf_text(path: str) -> str:
    return "\n\n".join(page["text"] for page in extract_pdf_pages(path))