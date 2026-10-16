-- Public visitors see active testimonials; only admins can manage records.
CREATE TABLE IF NOT EXISTS public.testimonials (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  autor text NOT NULL,
  cargo text NOT NULL,
  empresa text NOT NULL,
  depoimento text NOT NULL,
  destaque_frase text,
  nota integer NOT NULL DEFAULT 5 CHECK (nota BETWEEN 1 AND 5),
  avatar_url text,
  categoria text,
  fileira text DEFAULT 'top' CHECK (fileira IN ('top', 'bottom')),
  ativo boolean NOT NULL DEFAULT true,
  ordem integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS testimonials_public_order_idx
  ON public.testimonials (ativo, ordem);
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active testimonials" ON public.testimonials
  FOR SELECT TO anon
  USING (ativo = true);
CREATE POLICY "Admins can view all testimonials" ON public.testimonials
  FOR SELECT TO authenticated
  USING (private.has_role('admin'::public.app_role));
CREATE POLICY "Admins can insert testimonials" ON public.testimonials
  FOR INSERT TO authenticated
  WITH CHECK (private.has_role('admin'::public.app_role));
CREATE POLICY "Admins can update testimonials" ON public.testimonials
  FOR UPDATE TO authenticated
  USING (private.has_role('admin'::public.app_role))
  WITH CHECK (private.has_role('admin'::public.app_role));
CREATE POLICY "Admins can delete testimonials" ON public.testimonials
  FOR DELETE TO authenticated
  USING (private.has_role('admin'::public.app_role));

GRANT SELECT ON public.testimonials TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.testimonials TO authenticated;

DROP TRIGGER IF EXISTS update_testimonials_updated_at ON public.testimonials;
CREATE TRIGGER update_testimonials_updated_at
  BEFORE UPDATE ON public.testimonials
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
