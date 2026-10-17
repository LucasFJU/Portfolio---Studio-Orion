import { describe, expect, it } from 'vitest';
import { parseProposalProcessData, SERVICE_TEMPLATES } from '@/lib/proposal';

describe('shared proposal process parser', () => {
  it('preserves legacy step arrays and their service defaults', () => {
    const steps = [{ etapa: '01', titulo: 'Briefing', descricao: 'Escopo cadastrado', prazo: 'Semana 1' }];
    expect(parseProposalProcessData(steps, 'Landing page')).toEqual({ steps, deliverables: SERVICE_TEMPLATES.web.entregaveis });
  });
  it('preserves explicitly saved deliverables without importing the editor', () => {
    const saved = { steps: [], entregaveis: ['Entrega cadastrada'] };
    expect(parseProposalProcessData(saved)).toEqual({ steps: [], deliverables: saved.entregaveis });
  });
});
