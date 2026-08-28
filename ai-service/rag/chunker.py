def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 150) -> list[str]:
    """
    Splits text into chunks of `chunk_size` characters with `overlap` characters.
    Prefers splitting at paragraphs or sentences.
    """
    if not text:
        return []

    chunks = []
    start = 0
    text_length = len(text)

    while start < text_length:
        # End index for this chunk
        end = start + chunk_size

        # If we're not at the end of the text, try to find a clean break (like a newline or period)
        if end < text_length:
            # Look for a paragraph break
            clean_break = text.rfind('\n\n', start, end)
            if clean_break == -1:
                # Fallback to sentence break
                clean_break = text.rfind('. ', start, end)

            # If we found a good break, cut it there. Otherwise, hard cut at chunk_size
            if clean_break != -1 and clean_break > start + (chunk_size // 2):
                end = clean_break + 1

        # Extract the chunk and clean whitespace
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)

        # Move start forward, minus the overlap to keep context
        start = end - overlap

    return chunks
