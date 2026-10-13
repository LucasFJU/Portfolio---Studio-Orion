
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'user');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  categoria TEXT NOT NULL,
  imagem_capa TEXT,
  galeria TEXT[],
  tags TEXT[],
  link_projeto TEXT,
  data_publicacao TIMESTAMP WITH TIME ZONE DEFAULT now(),
  destaque BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'Concluído',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Anyone can view projects" ON public.projects FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Admins can insert projects" ON public.projects FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin')); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Admins can update projects" ON public.projects FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Admins can delete projects" ON public.projects FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin')); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  assunto TEXT,
  tipo_projeto TEXT,
  mensagem TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Anyone can insert leads" ON public.leads FOR INSERT WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Admins can view leads" ON public.leads FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin')); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Anyone can view site settings" ON public.site_settings FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Admins can insert site settings" ON public.site_settings FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin')); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Admins can update site settings" ON public.site_settings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Admins can delete site settings" ON public.site_settings FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin')); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS update_projects_updated_at ON public.projects;
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS update_site_settings_updated_at ON public.site_settings;
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
