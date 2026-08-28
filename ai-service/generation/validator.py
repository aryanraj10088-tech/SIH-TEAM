def validate_citations(generated_output, valid_chunks: list[dict]) -> dict:
    """
    Validates whether all cited chunk_ids actually exist in the retrieved context set.
    Returns a validity report and groundedness ratio.
    """
    valid_chunk_ids = {str(c["chunk_id"]) for c in valid_chunks}
    citations = getattr(generated_output, "citations", [])

    if not citations:
        return {"status": "warning", "groundedness_score": 0.0, "invalid_citations": []}

    invalid_citations = []
    valid_count = 0

    for cit in citations:
        if cit.chunk_id in valid_chunk_ids:
            valid_count += 1
        else:
            invalid_citations.append(cit.chunk_id)

    groundedness_score = round(valid_count / len(citations), 2)

    return {
        "status": "passed" if not invalid_citations else "flagged",
        "groundedness_score": groundedness_score,
        "total_citations": len(citations),
        "invalid_chunk_ids": invalid_citations
    }
