-- Add expires_at column to files_metadata table
ALTER TABLE public.files_metadata 
ADD COLUMN expires_at timestamp with time zone DEFAULT NULL;

-- Create index for efficient filtering of expired files
CREATE INDEX idx_files_metadata_expires_at ON public.files_metadata(expires_at);
