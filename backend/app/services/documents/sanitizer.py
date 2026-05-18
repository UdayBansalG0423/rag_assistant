import re


def clean_chunks(chunks):
    clean_chunks_list = []

    for chunk in chunks:
        if hasattr(chunk, "page_content"):
            chunk = chunk.page_content

        if not isinstance(chunk, str):
            continue

        chunk = re.sub(r'[\x00-\x1F\x7F-\x9F\uFFFE\uFFFF]', '', chunk)
        chunk = chunk.strip()

        if chunk:
            clean_chunks_list.append(chunk)

    return clean_chunks_list