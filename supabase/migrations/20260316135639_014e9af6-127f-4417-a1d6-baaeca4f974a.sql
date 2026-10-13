
-- Create projects table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT,
  categoria TEXT NOT NULL CHECK (categoria IN ('Social Media', 'Brand Design', 'Web Design')),
  imagem_capa TEXT,
  galeria TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  link_projeto TEXT,
  data_publicacao TIMESTAMP WITH TIME ZONE DEFAULT now(),
  destaque BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Projects are viewable by everyone" ON public.projects FOR SELECT USING (true);

-- Admin write access (authenticated users only)
CREATE POLICY "Authenticated users can insert projects" ON public.projects FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update projects" ON public.projects FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete projects" ON public.projects FOR DELETE TO authenticated USING (true);

-- Create leads table for contact form
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  tipo_projeto TEXT,
  mensagem TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Anyone can insert leads (contact form)
CREATE POLICY "Anyone can submit leads" ON public.leads FOR INSERT WITH CHECK (true);

-- Only authenticated can read leads
CREATE POLICY "Authenticated users can read leads" ON public.leads FOR SELECT TO authenticated USING (true);

-- Update timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for project images
INSERT INTO storage.buckets (id, name, public) VALUES ('projects', 'projects', true);

CREATE POLICY "Project images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'projects');
CREATE POLICY "Authenticated users can upload project images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'projects');
CREATE POLICY "Authenticated users can update project images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'projects');
CREATE POLICY "Authenticated users can delete project images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'projects');
