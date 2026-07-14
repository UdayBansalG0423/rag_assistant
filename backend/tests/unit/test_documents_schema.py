from app.schemas.document import DocumentRecord

def test_document_record_default_status():
    doc = DocumentRecord(
        id="doc_123",
        user_id="user_abc",
        file_name="test.pdf",
        storage_path="user_abc/doc_123.pdf",
        file_hash="hash123"
    )
    assert doc.status == "processing"
    assert doc.progress == 0
    assert doc.id == "doc_123"
