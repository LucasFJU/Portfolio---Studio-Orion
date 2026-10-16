-- Minimal, append-only public view tracking; only admins can read the log.
CREATE TABLE IF NOT EXISTS public.proposal_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id uuid NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now(),
  viewed_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS proposal_views_proposal_created_at_idx
  ON public.proposal_views (proposal_id, created_at DESC);
ALTER TABLE public.proposal_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can record proposal views" ON public.proposal_views
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.proposals p
      WHERE p.id = proposal_id
        AND p.status IN ('Enviada', 'Em análise', 'Aprovada')
    )
  );
CREATE POLICY "Admins can read proposal views" ON public.proposal_views
  FOR SELECT TO authenticated
  USING (private.has_role('admin'::public.app_role));
CREATE POLICY "Admins can delete proposal views" ON public.proposal_views
  FOR DELETE TO authenticated
  USING (private.has_role('admin'::public.app_role));

GRANT INSERT ON public.proposal_views TO anon, authenticated;
GRANT SELECT, DELETE ON public.proposal_views TO authenticated;
