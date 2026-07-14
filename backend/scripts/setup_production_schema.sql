-- ==========================================
-- NeuralDoc AI Production Schema & Policies
-- ==========================================

-- 1. Documents Table
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    file_hash TEXT,
    status TEXT NOT NULL DEFAULT 'queued',
    progress INT NOT NULL DEFAULT 0,
    error TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on Documents
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Document Policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'documents_owner_select') THEN
    CREATE POLICY documents_owner_select ON public.documents FOR SELECT USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'documents_owner_insert') THEN
    CREATE POLICY documents_owner_insert ON public.documents FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'documents_owner_update') THEN
    CREATE POLICY documents_owner_update ON public.documents FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'documents_owner_delete') THEN
    CREATE POLICY documents_owner_delete ON public.documents FOR DELETE USING (auth.uid() = user_id);
  END IF;
END
$$;

-- 2. Storage Bucket Policies
-- Assuming a bucket named 'documents' exists. Run this in Supabase SQL editor:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false) ON CONFLICT DO NOTHING;

DO $$
BEGIN
  -- Allow users to upload files only if they are authenticated and it goes into their user_id folder
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'storage_upload_policy') THEN
    CREATE POLICY storage_upload_policy ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;

  -- Allow users to read their own files
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'storage_select_policy') THEN
    CREATE POLICY storage_select_policy ON storage.objects FOR SELECT TO authenticated
    USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;

  -- Allow users to delete their own files
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'storage_delete_policy') THEN
    CREATE POLICY storage_delete_policy ON storage.objects FOR DELETE TO authenticated
    USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;
END
$$;
