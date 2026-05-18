import re
import logging
from typing import Iterable, List

logger = logging.getLogger(__name__)


# remove surrogate pair codepoints and control characters
SURROGATE_RE = re.compile(r"[\ud800-\udfff]")
CONTROL_RE = re.compile(r'[\x00-\x1F\x7F-\x9F\uFFFE\uFFFF]')


def _strip_control_chars(s: str) -> str:
    s = CONTROL_RE.sub('', s)
    s = SURROGATE_RE.sub('', s)
    return s


def clean_chunks(chunks: Iterable) -> List[str]:
    """
    Strong sanitizer for extracted chunks.

    - Coerce non-string inputs to strings
    - Remove control chars and surrogate codepoints
    - Trim and discard too-short content
    - Log stats for monitoring
    """
    clean_chunks_list: List[str] = []
    total = 0
    invalid = 0

    for chunk in chunks:
        total += 1
        try:
            if hasattr(chunk, "page_content"):
                chunk = chunk.page_content

            if chunk is None:
                invalid += 1
                continue

            if not isinstance(chunk, str):
                chunk = str(chunk)

            chunk = _strip_control_chars(chunk)
            chunk = chunk.strip()

            if not chunk or len(chunk) < 20:
                invalid += 1
                continue

            clean_chunks_list.append(chunk)
        except Exception as exc:
            logger.warning("Failed to sanitize chunk #%d: %s", total - 1, exc)
            invalid += 1
            continue

    logger.info("Sanitized chunks: total=%d valid=%d invalid=%d", total, len(clean_chunks_list), invalid)
    return clean_chunks_list