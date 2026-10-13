export interface BehanceProfileProjectItem {
  id: string;
  title: string;
  url: string;
  coverUrl: string;
  publishedAt: string;
  summary: string;
  categories: string[];
  embeddedImages: string[];
}

export interface BehanceExtractedProject {
  titulo: string;
  cliente: string;
  categoria: string;
  resumo: string;
  desafio: string;
  estrategia: string;
  entregaveis: string[];
  tags: string[];
  imagem_capa: string;
  galeria: string[];
  link_projeto: string;
}

const BEHANCE_API_BASE = "https://cc-api-behance.adobe.io/v2";
const BEHANCE_API_KEY = "behance1";

export function extractBehanceProjectId(input: string): string {
  const trimmed = (input || "").trim();
  if (!trimmed) return "";

  // Direct numeric ID
  if (/^\d{6,15}$/.test(trimmed)) {
    return trimmed;
  }

  // Match /gallery/123456789 or /embed/project/123456789 or /projects/123456789
  const match = trimmed.match(/(?:gallery|embed\/project|projects)\/(\d{5,15})/i);
  if (match && match[1]) {
    return match[1];
  }

  return "";
}

export function extractBehanceUsername(input: string): string {
  const trimmed = (input || "").trim();
  if (!trimmed) return "";

  // If the user pasted a project gallery URL, it's not a username
  if (extractBehanceProjectId(trimmed)) {
    return "";
  }

  try {
    if (trimmed.includes("behance.net")) {
      const url = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
      const parts = url.pathname.split("/").filter(Boolean);
      if (
        parts[0] === "gallery" ||
        parts[0] === "search" ||
        parts[0] === "feeds" ||
        parts[0] === "embed"
      ) {
        return "";
      }
      return parts[0] || "";
    }
  } catch {
    // fallback to regex cleanup
  }

  const cleaned = trimmed
    .replace(/^https?:\/\/(www\.)?behance\.net\//i, "")
    .replace(/^@/, "")
    .split(/[/?#]/)[0]
    .trim();

  return cleaned;
}

export function isValidBehanceProjectUrl(input: string): boolean {
  return Boolean(extractBehanceProjectId(input));
}

function pickBestCoverUrl(covers: Record<string, any> | undefined): string {
  if (!covers || typeof covers !== "object") return "";
  const preferredKeys = [
    "max_808",
    "max_808_webp",
    "808",
    "808_webp",
    "original",
    "original_webp",
    "404",
    "404_webp",
    "202",
    "202_webp",
  ];

  for (const key of preferredKeys) {
    const val = covers[key];
    if (typeof val === "string" && val.startsWith("http")) return val;
    if (val && typeof val === "object" && typeof val.url === "string" && val.url.startsWith("http")) {
      return val.url;
    }
  }

  for (const val of Object.values(covers)) {
    if (typeof val === "string" && val.startsWith("http")) return val;
    if (val && typeof val === "object" && typeof val.url === "string" && val.url.startsWith("http")) {
      return val.url;
    }
  }

  return "";
}

function pickBestModuleImageUrl(mod: any): string {
  if (!mod || typeof mod !== "object") return "";
  const sizes = mod.sizes || {};
  const preferredOrder = [
    "max_1240",
    "max_1200",
    "original",
    "hd",
    "fs",
    "1400",
    "max_1240_webp",
    "max_1200_webp",
    "disp",
    "max_632",
  ];

  for (const key of preferredOrder) {
    if (typeof sizes[key] === "string" && sizes[key].startsWith("http")) {
      return sizes[key];
    }
  }

  if (typeof mod.src === "string" && mod.src.startsWith("http")) {
    return mod.src;
  }

  return "";
}

function deduplicateUrls(urls: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const raw of urls) {
    if (!raw || !raw.startsWith("http")) continue;
    if (
      raw.includes("/user/") ||
      raw.includes("/avatars/") ||
      raw.includes("blank.gif") ||
      raw.endsWith(".svg")
    ) {
      continue;
    }

    const filenameMatch = raw.match(/\/([a-zA-Z0-9_.-]+\.(?:jpg|jpeg|png|webp|gif))(?:\?|$)/i);
    const key = filenameMatch ? filenameMatch[1].toLowerCase() : raw;

    if (!seen.has(key)) {
      seen.add(key);
      result.push(raw);
    }
  }

  return result;
}

function inferServiceCategory(
  title: string,
  tags: string[],
  description: string
): {
  categoria: string;
  entregaveis: string[];
} {
  const corpus = `${title} ${tags.join(" ")} ${description}`.toLowerCase();

  if (
    corpus.includes("ui") ||
    corpus.includes("ux") ||
    corpus.includes("site") ||
    corpus.includes("web") ||
    corpus.includes("landing") ||
    corpus.includes("app") ||
    corpus.includes("interface") ||
    corpus.includes("figma")
  ) {
    return {
      categoria: "Sites e interfaces",
      entregaveis: ["Arquitetura da Informação", "UI/UX Design", "Design Responsivo"],
    };
  }

  if (
    corpus.includes("social") ||
    corpus.includes("instagram") ||
    corpus.includes("redes") ||
    corpus.includes("carrossel") ||
    corpus.includes("feed") ||
    corpus.includes("campanha") ||
    corpus.includes("post") ||
    corpus.includes("conteúdo") ||
    corpus.includes("conteudo")
  ) {
    return {
      categoria: "Design para redes sociais",
      entregaveis: ["Direção de Arte", "Peças para Redes Sociais", "Identidade de Campanha"],
    };
  }

  return {
    categoria: "Identidade visual",
    entregaveis: ["Logotipo & Símbolo", "Sistema de Identidade Visual", "Manual da Marca"],
  };
}

function stripHtmlTags(html: string): string {
  if (!html) return "";
  if (typeof DOMParser !== "undefined") {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return (doc.body.textContent || "").replace(/\s+/g, " ").trim();
  }
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

async function fetchBehanceJson(endpointUrl: string): Promise<any> {
  // 1. Direct fetch (cc-api-behance.adobe.io supports CORS directly)
  try {
    const res = await fetch(endpointUrl, {
      headers: { Accept: "application/json" },
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // fallback to proxy if browser extension or network blocks direct request
  }

  // 2. Fallback via CORS proxies
  const proxies = [
    `https://api.allorigins.win/raw?url=${encodeURIComponent(endpointUrl)}`,
    `https://corsproxy.io/?${encodeURIComponent(endpointUrl)}`,
  ];

  for (const proxyUrl of proxies) {
    try {
      const res = await fetch(proxyUrl);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // try next
    }
  }

  throw new Error("Não foi possível comunicar com a API do Behance.");
}

export async function fetchBehanceProfileProjects(
  usernameOrUrl: string
): Promise<BehanceProfileProjectItem[]> {
  let username = extractBehanceUsername(usernameOrUrl);

  // If the user pasted a project link into the profile field, resolve the owner's username from that project!
  if (!username) {
    const projectId = extractBehanceProjectId(usernameOrUrl);
    if (projectId) {
      const projData = await fetchBehanceJson(
        `${BEHANCE_API_BASE}/projects/${projectId}?api_key=${BEHANCE_API_KEY}`
      );
      username = projData?.project?.owners?.[0]?.username || "";
    }
  }

  if (!username) {
    throw new Error(
      "Informe seu nome de usuário do Behance (ex: lucasevangelista ou https://www.behance.net/seuusuario)."
    );
  }

  const endpoint = `${BEHANCE_API_BASE}/users/${encodeURIComponent(
    username
  )}/projects?api_key=${BEHANCE_API_KEY}&per_page=24`;

  const json = await fetchBehanceJson(endpoint);
  const rawProjects = Array.isArray(json?.projects) ? json.projects : [];

  if (rawProjects.length === 0) {
    throw new Error(
      `Nenhum projeto público encontrado para o perfil "@${username}" no Behance. Verifique se o nome de usuário está correto.`
    );
  }

  return rawProjects.map((proj: any) => {
    const coverUrl = pickBestCoverUrl(proj.covers);
    const fields = Array.isArray(proj.fields) ? proj.fields : [];
    const publishedAt = proj.published_on
      ? new Date(proj.published_on * 1000).toISOString()
      : new Date().toISOString();

    return {
      id: String(proj.id),
      title: (proj.name || "Projeto Behance").trim(),
      url: proj.url || `https://www.behance.net/gallery/${proj.id}/project`,
      coverUrl,
      publishedAt,
      summary:
        fields.length > 0
          ? `Frentes: ${fields.join(", ")}`
          : `Publicado no portfólio oficial de @${username} no Behance.`,
      categories: fields,
      embeddedImages: coverUrl ? [coverUrl] : [],
    };
  });
}

export async function fetchBehanceProjectDetails(
  projectUrlOrId: string,
  fallbackProfileItem?: BehanceProfileProjectItem
): Promise<BehanceExtractedProject> {
  const projectId =
    extractBehanceProjectId(projectUrlOrId) ||
    (fallbackProfileItem?.id && /^\d+$/.test(fallbackProfileItem.id)
      ? fallbackProfileItem.id
      : "");

  if (!projectId) {
    throw new Error(
      "Link inválido. Cole a URL de um projeto do Behance (ex: https://www.behance.net/gallery/123456789/Nome-do-Projeto)."
    );
  }

  const endpoint = `${BEHANCE_API_BASE}/projects/${projectId}?api_key=${BEHANCE_API_KEY}`;
  const json = await fetchBehanceJson(endpoint);
  const proj = json?.project;

  if (!proj) {
    throw new Error("Projeto não encontrado ou privado no Behance.");
  }

  const title = (proj.name || fallbackProfileItem?.title || "Novo Projeto Behance").trim();
  const coverImage = pickBestCoverUrl(proj.covers) || fallbackProfileItem?.coverUrl || "";
  const canonicalUrl =
    proj.url ||
    (projectUrlOrId.startsWith("http")
      ? projectUrlOrId
      : `https://www.behance.net/gallery/${projectId}/project`);

  const tagsSet = new Set<string>();
  if (Array.isArray(proj.fields)) {
    proj.fields.forEach((f: string) => f && tagsSet.add(f.trim()));
  }
  if (Array.isArray(proj.tags)) {
    proj.tags.forEach((t: string) => t && tagsSet.add(t.trim()));
  }
  if (Array.isArray(proj.tools)) {
    proj.tools.forEach((tool: any) => {
      if (tool?.title) tagsSet.add(String(tool.title).trim());
    });
  }

  // Extract all slides/images and text blocks from project.modules
  const rawGalleryUrls: string[] = [];
  const textBlocks: string[] = [];

  if (Array.isArray(proj.modules)) {
    for (const mod of proj.modules) {
      if (!mod || typeof mod !== "object") continue;

      if (mod.type === "image") {
        const bestImg = pickBestModuleImageUrl(mod);
        if (bestImg) rawGalleryUrls.push(bestImg);
      } else if (mod.type === "media_collection" && Array.isArray(mod.components)) {
        for (const comp of mod.components) {
          const bestCompImg = pickBestModuleImageUrl(comp);
          if (bestCompImg) rawGalleryUrls.push(bestCompImg);
        }
      } else if (mod.type === "text") {
        const plain = (mod.text_plain || stripHtmlTags(mod.text || "")).trim();
        if (plain && plain.length > 20) {
          textBlocks.push(plain);
        }
      }
    }
  }

  const deduplicatedGallery = deduplicateUrls([
    ...rawGalleryUrls,
    ...(coverImage ? [coverImage] : []),
  ]);

  const finalCover = coverImage || deduplicatedGallery[0] || "";
  const tagsList = Array.from(tagsSet).slice(0, 10);
  const rawDescription = (proj.description || "").trim();
  const combinedNarrative = [rawDescription, ...textBlocks].filter(Boolean).join(" ");

  const { categoria, entregaveis } = inferServiceCategory(
    title,
    tagsList,
    combinedNarrative
  );

  const clientGuess = title.split(/[—–|-]/)[0].trim() || title;

  const finalResumo =
    rawDescription ||
    textBlocks[0] ||
    `Projeto de ${categoria.toLowerCase()} desenvolvido para ${clientGuess}, com foco em direção visual, clareza e posicionamento.`;

  const finalDesafio =
    textBlocks[0] && textBlocks[0] !== finalResumo
      ? textBlocks[0]
      : `Construir uma presença visual forte e consistente para ${clientGuess}, alinhando estética, diferenciação e leitura imediata em todos os pontos de contato.`;

  const finalEstrategia =
    textBlocks[1]
      ? textBlocks.slice(1, 3).join("\n\n")
      : `Desenvolvimento completo de ${categoria.toLowerCase()}, integrando tipografia, paleta cromática e sistema de aplicação pensado para fortalecer a marca ${clientGuess}.`;

  return {
    titulo: title,
    cliente: clientGuess,
    categoria,
    resumo: finalResumo,
    desafio: finalDesafio,
    estrategia: finalEstrategia,
    entregaveis,
    tags: tagsList.length > 0 ? tagsList : entregaveis,
    imagem_capa: finalCover,
    galeria: deduplicatedGallery,
    link_projeto: canonicalUrl,
  };
}
