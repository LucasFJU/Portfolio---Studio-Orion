export interface CaseStudyData {
  resumo: string;
  cliente: string;
  setor: string;
  ano: string;
  metrica: string;
  desafio: string;
  estrategia: string;
  solucao: string;
  resultados: string;
  resultado: string;
  entregaveis: string[];
}

const META_DELIMITER = "\n\n<!--CASE_DATA:";
const META_END = "-->";

export const UNIFIED_CATEGORIES = [
  "Identidade visual",
  "Design para redes sociais",
  "Sites e interfaces",
] as const;

export const UNIFIED_SERVICE_CATEGORIES = UNIFIED_CATEGORIES;

export function formatCategoryLabel(rawCategory?: string | null): string {
  if (!rawCategory) return "Identidade visual";
  const normalized = rawCategory.toLowerCase().trim();
  if (
    normalized.includes("brand") ||
    normalized.includes("identidade") ||
    normalized.includes("packaging") ||
    normalized.includes("embalage")
  ) {
    return "Identidade visual";
  }
  if (normalized.includes("social") || normalized.includes("rede") || normalized.includes("conteúdo")) {
    return "Design para redes sociais";
  }
  if (
    normalized.includes("web") ||
    normalized.includes("ui") ||
    normalized.includes("ux") ||
    normalized.includes("site") ||
    normalized.includes("interface")
  ) {
    return "Sites e interfaces";
  }
  return rawCategory;
}

export const normalizeServiceCategory = formatCategoryLabel;

export function normalizeCategoryFilter(
  rawCategory?: string | null
): "todos" | "identidade-visual" | "redes-sociais" | "sites-interfaces" {
  if (!rawCategory) return "todos";
  const normalized = rawCategory.toLowerCase().trim();
  if (normalized === "todos") return "todos";
  if (
    normalized.includes("brand") ||
    normalized.includes("identidade") ||
    normalized.includes("packaging") ||
    normalized.includes("embalage")
  ) {
    return "identidade-visual";
  }
  if (
    normalized.includes("social") ||
    normalized.includes("rede") ||
    normalized.includes("conteúdo") ||
    normalized.includes("conteudo")
  ) {
    return "redes-sociais";
  }
  if (
    normalized.includes("web") ||
    normalized.includes("ui") ||
    normalized.includes("ux") ||
    normalized.includes("site") ||
    normalized.includes("interface")
  ) {
    return "sites-interfaces";
  }
  return "todos";
}

export function matchesUnifiedCategory(rawCategory: string | null | undefined, filterLabel: string): boolean {
  if (!filterLabel || filterLabel === "Todos") return true;
  if (rawCategory === filterLabel) return true;
  return formatCategoryLabel(rawCategory) === formatCategoryLabel(filterLabel);
}

export function isValidWhatsappNumber(rawNumber?: string | null): boolean {
  if (!rawNumber) return false;
  const digits = rawNumber.replace(/\D/g, "");
  if (digits.length < 10) return false;
  if (digits === "5511999990000" || digits.endsWith("999990000") || /^(\d)\1+$/.test(digits)) {
    return false;
  }
  return true;
}

export function isValidSocialUrl(rawUrl?: string | null): boolean {
  if (!rawUrl) return false;
  const trimmed = rawUrl.trim();
  if (!trimmed) return false;
  try {
    const parsed = new URL(trimmed);
    const path = parsed.pathname.replace(/\/+$/, "");
    return path.length > 1;
  } catch {
    return false;
  }
}

export function serializeCaseStudy(data: Partial<CaseStudyData> & { resumo: string }): string {
  const cleanResumo = (data.resumo || "").trim();
  const hasStructured =
    data.cliente?.trim() ||
    data.metrica?.trim() ||
    data.desafio?.trim() ||
    data.estrategia?.trim() ||
    data.resultados?.trim() ||
    (data.entregaveis && data.entregaveis.length > 0);

  if (!hasStructured) {
    return cleanResumo;
  }

  const payload = JSON.stringify({
    cliente: data.cliente?.trim() || "",
    metrica: data.metrica?.trim() || "",
    desafio: data.desafio?.trim() || "",
    estrategia: data.estrategia?.trim() || "",
    resultados: data.resultados?.trim() || "",
    entregaveis: data.entregaveis || [],
  });

  return `${cleanResumo}${META_DELIMITER}${payload}${META_END}`;
}

export function parseCaseStudy(project: {
  titulo?: string | null;
  descricao?: string | null;
  categoria?: string | null;
  tags?: string[] | null;
  data_publicacao?: string | null;
  cliente?: string;
  metrica?: string;
  desafio?: string;
  estrategia?: string;
  resultados?: string;
  entregaveis?: string[];
}): CaseStudyData {
  const rawDesc = project?.descricao || "";
  const defaultClient = project?.titulo?.split("—")[0]?.trim() || project?.titulo || "Cliente";
  const defaultYear = project?.data_publicacao
    ? new Date(project.data_publicacao).getFullYear().toString()
    : "2025";
  const defaultSector = formatCategoryLabel(project?.categoria);
  const defaultDesafio =
    "A marca precisava estruturar seu posicionamento visual para transmitir maior valor percebido, diferenciar-se no mercado e criar uma comunicação clara em todos os pontos de contato.";
  const defaultSolucao =
    "Desenvolvemos um sistema visual coeso, tipografia com forte presença editorial e aplicações pensadas para o dia a dia digital e institucional da empresa.";
  const defaultResultado =
    "O novo posicionamento elevou a percepção de autoridade da marca e trouxe consistência imediata para apresentações comerciais, redes sociais e canais digitais.";

  if (rawDesc.includes(META_DELIMITER)) {
    const [resumoPart, rest] = rawDesc.split(META_DELIMITER);
    const jsonStr = rest?.endsWith(META_END) ? rest.slice(0, -META_END.length) : rest;
    try {
      const parsed = JSON.parse(jsonStr || "{}");
      const estrategiaVal = parsed.estrategia || project.estrategia || defaultSolucao;
      const resultadosVal = parsed.resultados || project.resultados || defaultResultado;
      return {
        resumo: resumoPart.trim(),
        cliente: parsed.cliente || project.cliente || defaultClient,
        setor: parsed.setor || defaultSector,
        ano: parsed.ano || defaultYear,
        metrica: parsed.metrica || project.metrica || "",
        desafio: parsed.desafio || project.desafio || defaultDesafio,
        estrategia: estrategiaVal,
        solucao: estrategiaVal,
        resultados: resultadosVal,
        resultado: resultadosVal,
        entregaveis:
          Array.isArray(parsed.entregaveis) && parsed.entregaveis.length > 0
            ? parsed.entregaveis
            : project.tags && project.tags.length > 0
              ? project.tags
              : [defaultSector],
      };
    } catch {
      // Fallback if JSON parsing fails
    }
  }

  const estrategiaFallback = project.estrategia || defaultSolucao;
  const resultadosFallback = project.resultados || defaultResultado;

  return {
    resumo: rawDesc.trim(),
    cliente: project.cliente || defaultClient,
    setor: defaultSector,
    ano: defaultYear,
    metrica: project.metrica || "",
    desafio: project.desafio || defaultDesafio,
    estrategia: estrategiaFallback,
    solucao: estrategiaFallback,
    resultados: resultadosFallback,
    resultado: resultadosFallback,
    entregaveis:
      project.entregaveis && project.entregaveis.length > 0
        ? project.entregaveis
        : project.tags && project.tags.length > 0
          ? project.tags
          : [defaultSector],
  };
}
