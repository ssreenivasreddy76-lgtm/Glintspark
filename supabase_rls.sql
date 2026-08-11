-- ==========================================
-- GLINTSPARK SUPABASE RLS RULES
-- ==========================================

-- Enable Row Level Security on the Storage Objects table
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 1. Anyone can read files from curriculum_images
CREATE POLICY "Public Access to Curriculum Images"
ON storage.objects FOR SELECT
USING ( bucket_id = 'curriculum_images' );

-- 2. Only authenticated admins can upload/delete images
-- Require the user to be authenticated to INSERT/DELETE.
-- If roles are stored in public.users, one could query it. For now, require auth.
CREATE POLICY "Admin Insert Curriculum Images"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'curriculum_images' AND auth.role() = 'authenticated' );

CREATE POLICY "Admin Update Curriculum Images"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'curriculum_images' AND auth.role() = 'authenticated' );

CREATE POLICY "Admin Delete Curriculum Images"
ON storage.objects FOR DELETE
USING ( bucket_id = 'curriculum_images' AND auth.role() = 'authenticated' );
