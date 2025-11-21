-- Add PDF and document attachment support to announcements and ideas
-- Run this in Supabase SQL Editor

-- Add attachment columns to announcements table
ALTER TABLE announcements 
ADD COLUMN IF NOT EXISTS attachment_url TEXT,
ADD COLUMN IF NOT EXISTS attachment_type TEXT;

-- Add attachment columns to ideas table
ALTER TABLE ideas 
ADD COLUMN IF NOT EXISTS attachment_url TEXT,
ADD COLUMN IF NOT EXISTS attachment_type TEXT;

-- Add comments for documentation
COMMENT ON COLUMN announcements.attachment_url IS 'URL of uploaded attachment (PDF, Word, Excel, etc.)';
COMMENT ON COLUMN announcements.attachment_type IS 'Type of attachment: image, video, pdf, document';

COMMENT ON COLUMN ideas.attachment_url IS 'URL of uploaded attachment (PDF, Word, Excel, etc.)';
COMMENT ON COLUMN ideas.attachment_type IS 'Type of attachment: image, video, pdf, document';
