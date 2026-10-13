
INSERT INTO storage.buckets (id, name, public) VALUES ('projects', 'projects', true) ON CONFLICT (id) DO NOTHING;

DO $$ BEGIN
  CREATE POLICY "Anyone can view project files" ON storage.objects FOR SELECT USING (bucket_id = 'projects');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Auth users can upload project files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'projects');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Auth users can update project files" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'projects');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Auth users can delete project files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'projects');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
