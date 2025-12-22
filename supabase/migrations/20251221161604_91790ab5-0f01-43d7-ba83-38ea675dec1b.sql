-- Create the files_metadata table for storing uploaded file information
CREATE TABLE public.files_metadata (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  size BIGINT NOT NULL,
  type TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on the table
ALTER TABLE public.files_metadata ENABLE ROW LEVEL SECURITY;

-- Create policy for public SELECT (anyone can view files)
CREATE POLICY "Anyone can view files" 
ON public.files_metadata 
FOR SELECT 
USING (true);

-- Create policy for public INSERT (anyone can upload files)
CREATE POLICY "Anyone can upload files" 
ON public.files_metadata 
FOR INSERT 
WITH CHECK (true);

-- Create policy for public DELETE (anyone can delete files)
CREATE POLICY "Anyone can delete files" 
ON public.files_metadata 
FOR DELETE 
USING (true);

-- Enable realtime for the table
ALTER PUBLICATION supabase_realtime ADD TABLE public.files_metadata;

-- Create the public-files storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('public-files', 'public-files', true);

-- Create storage policy for public file access
CREATE POLICY "Public file access"
ON storage.objects
FOR SELECT
USING (bucket_id = 'public-files');

-- Create storage policy for public file upload
CREATE POLICY "Public file upload"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'public-files');

-- Create storage policy for public file delete
CREATE POLICY "Public file delete"
ON storage.objects
FOR DELETE
USING (bucket_id = 'public-files');