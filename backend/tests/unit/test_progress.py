from app.core.progress import mark_processing, update_document_status

def test_update_document_status(mock_supabase_client):
    user_id = "test_user"
    doc_id = "test_doc"
    
    # Test update
    update_document_status(user_id, doc_id, "processing", 50)
    
    mock_supabase_client.table.assert_called_with("documents")
    
def test_mark_processing(mock_supabase_client):
    user_id = "test_user"
    doc_id = "test_doc"
    
    mark_processing(user_id, doc_id, 10)
    mock_supabase_client.table.assert_called_with("documents")
