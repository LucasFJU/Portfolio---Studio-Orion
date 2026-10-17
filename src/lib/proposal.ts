export interface ProcessStep {
  etapa: string;
  titulo: string;
  descricao: string;
  prazo: string;
}

export interface PaymentMethod {
  titulo: string;
  detalhe: string;
  destaque: boolean;
  escolhido_pelo_cliente?: boolean;
}

export const SERVICE_TEMPLATES: Record<
  string,
  {
    label: string;
    categoryFilter: string;
    titulo: string;
    prazo: string;
    introducao: string;
    entregaveis: string[];
    processo: ProcessStep[];
  }
> = {
  brand: {
    label: "Identidade visual",
    categoryFilter: "Identidade visual",
    titulo: "Identidade Visual & Sistema de Marca",
    prazo: "25 a 35 dias corridos",
    introducao:
      "Proposta desenvolvida para construir uma identidade visual consistente, clara e preparada para posicionar sua marca em todos os pontos de contato.",
    entregaveis: [
      "Logotipo principal, versões secundárias e símbolo / monograma",
      "Paleta cromática institucional (CMYK, RGB, HEX e Pantone)",
      "Sistema tipográfico completo (títulos, apoio e leitura)",
      "Elementos gráficos de suporte, grafismos e padrões da marca",
      "Guia de uso e manual de identidade visual em PDF de alta resolução",
      "Pacote completo de arquivos finais abertos e vetoriais (AI, EPS, SVG, PDF e PNG)",
    ],
    processo: [
      {
        etapa: "01",
        titulo: "Diagnóstico",
        descricao: "Entendo o momento da marca, objetivos comerciais, público e referências do setor.",
        prazo: "Semana 1",
      },
      {
        etapa: "02",
        titulo: "Direção visual",
        descricao: "Defino conceito, paleta cromática, tipografia e o caminho visual do projeto.",
        prazo: "Semana 2",
      },
      {
        etapa: "03",
        titulo: "Criação e ajustes",
        descricao: "Desenvolvo logotipo, sistema visual, aplicações e refinamentos alinhados ao escopo.",
        prazo: "Semanas 3 e 4",
      },
      {
        etapa: "04",
        titulo: "Entrega",
        descricao: "Organizo o guia de uso da marca e os arquivos finais abertos e prontos para aplicação.",
        prazo: "Semana 5",
      },
    ],
  },
  social: {
    label: "Design para redes sociais",
    categoryFilter: "Design para redes sociais",
    titulo: "Direção Visual & Design para Redes Sociais",
    prazo: "Ciclo mensal / 15 dias setup",
    introducao:
      "Proposta de direção visual e criação de peças para redes sociais, mantendo sua comunicação reconhecível e bem estruturada em cada publicação.",
    entregaveis: [
      "Direção de arte e linha editorial visual para feed, carrosséis e stories",
      "Pacote de peças estratégicas finalizadas em alta resolução prontas para publicação",
      "Sistema de capas de destaque e padronização visual do perfil",
      "Matrizes e templates editáveis organizados (Figma / Canva Pro) para autonomia da equipe",
      "Guia rápido de boas práticas tipográficas e cromáticas para postagens",
      "Até 2 rodadas de ajustes inclusas por lote de criativos",
    ],
    processo: [
      {
        etapa: "01",
        titulo: "Diagnóstico",
        descricao: "Análise do perfil atual, objetivos de comunicação e temas prioritários da marca.",
        prazo: "Dias 1 a 4",
      },
      {
        etapa: "02",
        titulo: "Direção visual",
        descricao: "Definição do sistema visual para feed, stories, carrosséis e matrizes editáveis.",
        prazo: "Dias 5 a 10",
      },
      {
        etapa: "03",
        titulo: "Criação e ajustes",
        descricao: "Desenvolvimento das peças, campanhas e rodadas de revisão previstas no ciclo.",
        prazo: "Contínuo / Semanal",
      },
      {
        etapa: "04",
        titulo: "Entrega",
        descricao: "Envio das artes exportadas em alta resolução e templates organizados.",
        prazo: "Final do ciclo",
      },
    ],
  },
  web: {
    label: "Sites e interfaces",
    categoryFilter: "Sites e interfaces",
    titulo: "Design de Site & Interface Digital",
    prazo: "20 a 30 dias corridos",
    introducao:
      "Desenvolvimento de página digital clara, responsiva e bem estruturada para apresentar sua marca e facilitar novos contatos comerciais.",
    entregaveis: [
      "Arquitetura da informação, estrutura narrativa e wireframe das seções",
      "Design de interface (UI) exclusivo para Desktop e Mobile no Figma",
      "Sistema de componentes visuais, botões, tipografia e estados interativos",
      "Desenvolvimento / implementação responsiva com performance e SEO técnico básico",
      "Integração de formulários de orçamento e botões diretos para WhatsApp",
      "Handoff técnico organizado e treinamento rápido para atualização de conteúdo",
    ],
    processo: [
      {
        etapa: "01",
        titulo: "Diagnóstico",
        descricao: "Mapeamento da estrutura de conteúdo, páginas e objetivos de navegação.",
        prazo: "Semana 1",
      },
      {
        etapa: "02",
        titulo: "Direção visual",
        descricao: "Arquitetura da informação, wireframes e definição da linguagem da interface.",
        prazo: "Semana 2",
      },
      {
        etapa: "03",
        titulo: "Criação e ajustes",
        descricao: "Design completo desktop e mobile no Figma e implementação responsiva.",
        prazo: "Semanas 3 e 4",
      },
      {
        etapa: "04",
        titulo: "Entrega",
        descricao: "Publicação da página ou handoff técnico organizado para a equipe.",
        prazo: "Entrega final",
      },
    ],
  },
  full: {
    label: "Escopo completo (Marca + Redes + Site)",
    categoryFilter: "Todos",
    titulo: "Reposicionamento Visual: Identidade, Redes Sociais & Site",
    prazo: "35 a 45 dias corridos",
    introducao:
      "Projeto integrado unindo identidade visual, direção para redes sociais e presença digital para marcas em fase de lançamento ou reposicionamento.",
    entregaveis: [
      "Sistema completo de Identidade Visual (Logotipo, Símbolo, Cores, Tipografia e Manual PDF)",
      "Pacote de arquivos vetoriais abertos e prontos para impressão e digital",
      "Direção visual para Redes Sociais + Kit de peças e templates editáveis",
      "Design e implementação de Site Institucional ou Landing Page de alta conversão",
      "Padronização de todos os pontos de contato físicos e digitais da marca",
      "Acompanhamento direto durante toda a transição e lançamento da nova marca",
    ],
    processo: [
      {
        etapa: "01",
        titulo: "Diagnóstico",
        descricao: "Alinhamento estratégico sobre posicionamento, público e metas do projeto.",
        prazo: "Semana 1",
      },
      {
        etapa: "02",
        titulo: "Direção visual",
        descricao: "Construção do sistema de identidade visual, tipografia, cores e guia da marca.",
        prazo: "Semanas 2 e 3",
      },
      {
        etapa: "03",
        titulo: "Criação e ajustes",
        descricao: "Desdobramento para peças de redes sociais e design da página digital.",
        prazo: "Semanas 4 e 5",
      },
      {
        etapa: "04",
        titulo: "Entrega",
        descricao: "Entrega completa dos arquivos da marca, templates e publicação do site.",
        prazo: "Semana 6",
      },
    ],
  },
};

export function parseProposalProcessData(rawProcesso: any, fallbackTitle = ""): {
  steps: ProcessStep[];
  deliverables: string[];
} {
  const detectDefaultDeliverables = (title: string) => {
    const lower = (title || "").toLowerCase();
    if (lower.includes("rede") || lower.includes("social")) {
      return SERVICE_TEMPLATES.social.entregaveis;
    }
    if (lower.includes("site") || lower.includes("interface") || lower.includes("landing")) {
      return SERVICE_TEMPLATES.web.entregaveis;
    }
    if (lower.includes("reposicionamento") || lower.includes("completo")) {
      return SERVICE_TEMPLATES.full.entregaveis;
    }
    return SERVICE_TEMPLATES.brand.entregaveis;
  };

  if (Array.isArray(rawProcesso)) {
    return {
      steps: rawProcesso,
      deliverables: detectDefaultDeliverables(fallbackTitle),
    };
  }

  if (rawProcesso && typeof rawProcesso === "object") {
    const steps = Array.isArray(rawProcesso.steps)
      ? rawProcesso.steps
      : SERVICE_TEMPLATES.brand.processo;
    const deliverables =
      Array.isArray(rawProcesso.entregaveis) && rawProcesso.entregaveis.length > 0
        ? rawProcesso.entregaveis
        : detectDefaultDeliverables(fallbackTitle);
    return { steps, deliverables };
  }

  return {
    steps: SERVICE_TEMPLATES.brand.processo,
    deliverables: detectDefaultDeliverables(fallbackTitle),
  };
}

