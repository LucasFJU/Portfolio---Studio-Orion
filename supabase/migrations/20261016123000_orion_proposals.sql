-- Proposal content used by the public proposal link and authenticated admin.
CREATE TABLE IF NOT EXISTS public.proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  cliente_nome text NOT NULL,
  cliente_empresa text,
  cliente_email text,
  titulo text NOT NULL,
  introducao text,
  status text NOT NULL DEFAULT 'Rascunho',
  projeto_ids text[] NOT NULL DEFAULT '{}',
  processo jsonb NOT NULL DEFAULT '{}'::jsonb,
  formas_pagamento jsonb NOT NULL DEFAULT '[]'::jsonb,
  prazo_entrega text,
  validade_dias integer NOT NULL DEFAULT 10,
  valor_total numeric,
  observacoes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS proposals_status_created_at_idx
  ON public.proposals (status, created_at DESC);
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view sent proposals" ON public.proposals
  FOR SELECT TO anon
  USING (status IN ('Enviada', 'Em análise', 'Aprovada'));
CREATE POLICY "Admins can view all proposals" ON public.proposals
  FOR SELECT TO authenticated
  USING (private.has_role('admin'::public.app_role));
CREATE POLICY "Admins can insert proposals" ON public.proposals
  FOR INSERT TO authenticated
  WITH CHECK (private.has_role('admin'::public.app_role));
CREATE POLICY "Admins can update proposals" ON public.proposals
  FOR UPDATE TO authenticated
  USING (private.has_role('admin'::public.app_role))
  WITH CHECK (private.has_role('admin'::public.app_role));
CREATE POLICY "Admins can delete proposals" ON public.proposals
  FOR DELETE TO authenticated
  USING (private.has_role('admin'::public.app_role));
CREATE POLICY "Clients can approve sent proposals" ON public.proposals
  FOR UPDATE TO anon
  USING (status IN ('Enviada', 'Em análise'))
  WITH CHECK (status = 'Aprovada');

GRANT SELECT, INSERT, UPDATE, DELETE ON public.proposals TO authenticated;
GRANT SELECT (
  id, slug, cliente_nome, cliente_empresa, titulo, introducao, status,
  projeto_ids, processo, formas_pagamento, prazo_entrega, validade_dias,
  valor_total, observacoes, created_at
) ON public.proposals TO anon;
GRANT UPDATE (status, formas_pagamento) ON public.proposals TO anon;

DROP TRIGGER IF EXISTS update_proposals_updated_at ON public.proposals;
CREATE TRIGGER update_proposals_updated_at
  BEFORE UPDATE ON public.proposals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
