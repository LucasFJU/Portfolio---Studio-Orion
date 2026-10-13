# Painel Avançado de Personalização da Hero (Camadas, Mídia Total & Overrides Responsivos)

Evolução do editor visual da Hero para oferecer total flexibilidade criativa: árvore de camadas com adição, remoção e reordenação de elementos; substituição completa da atmosfera da Hero por Vídeo em loop ou Imagem de fundo; e controle responsivo refinado com ajustes e ocultações exclusivas para Mobile versus Desktop, tudo sincronizado no código-fonte.

---

> [!IMPORTANT]
> **Decisões Confirmadas na Fase de Clarificação:**
> - **Gerenciamento de Elementos**: Lista de camadas interativa com reordenação (subir/descer), alternador de visibilidade (olho), exclusão e catálogo modal para adicionar novos elementos (botões extras, blocos de texto, imagens PNG adicionais, badges e logos).
> - **Substituição do Fundo da Hero**: Seletor tripartite entre **Shader WebGL Simplex-Noise**, **Imagem Estática** (JPG/PNG com controle de scrim escuro) e **Vídeo em Loop** (MP4/WebM com reprodução contínua e máscara de contraste).
> - **Edição Responsiva (Desktop vs. Mobile)**: Alternador de modo na barra superior (`Desktop` e `Mobile`), permitindo definir overrides específicos para celular (escala de texto mobile, alinhamento, visibilidade seletiva de elementos e foto dedicada).

---

## 1. Overview & Core Concept

- **O que faz**: Transforma o painel `/admin/editor-hero` em um construtor visual de blocos completo (Page Builder de Hero), permitindo ao Lucas desmontar, remontar e customizar cada milímetro da primeira dobra do site. Permite trocar todo o fundo do site por um showreel em vídeo de alta definição, criar variações limpas para celular sem poluição visual, e adicionar elementos livres com visualização instantânea no canvas.
- **Público-Alvo**: Lucas Evangelista (diretor de arte e designer) para criar lançamentos temáticos, alterar campanhas comerciais e testar composições visuais livremente.
- **Valor Principal**: Liberdade criativa irrestrita de um construtor profissional de páginas, mantendo a performance e o salvamento direto no repositório de código (`heroConfig.json`).

---

## 2. User Experience & Visual Design

### Fluxo de Uso e Ferramentas

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ TOP BAR: [← Painel] [Modo: Desktop / Mobile] [Visualizar JSON] [Restaurar] [Salvar no Código] │
├──────────────────────────────────────────┬─────────────────────────────────────────────┤
│ PAINEL LATERAL (380px)                   │ CANVAS DE PREVIEW INTERATIVO                │
│                                          │                                             │
│ ┌──────────────────────────────────────┐ │ ┌─────────────────────────────────────────┐ │
│ │ ABAS PRINCIPAIS:                     │ │ │ Moldura Responsiva (sincronizada com     │ │
│ │ • Camadas & Blocos (Adicionar/Remover│ │ │ modo Desktop ou Mobile selecionado)     │ │
│ │ • Fundo & Atmosfera (Shader/Img/Vídeo│ │ │                                         │ │
│ │ • Foto & Mídias PNG                  │ │ │ ┌─────────────────────────────────────┐ │ │
│ │ • Tipografia & Textos                │ │ │ │ HERO RENDER:                        │ │ │
│ │ • CTAs & Ações                       │ │ │ │ [Fundo: WebGL / Vídeo / Imagem]     │ │ │
│ │ • Configurações Mobile (Overrides)   │ │ │ │ [Camadas ativas renderizadas        │ │ │
│ └──────────────────────────────────────┘ │ │ │  na ordem customizada]              │ │ │
│                                          │ │ └─────────────────────────────────────┘ │ │
│ ┌──────────────────────────────────────┐ │ └─────────────────────────────────────────┘ │
│ │ ÁRVORE DE CAMADAS:                   │ │                                             │
│ │ [👁] [▲▼] Kicker de Status    [🗑]   │ │                                             │
│ │ [👁] [▲▼] Título Principal    [🗑]   │ │                                             │
│ │ [👁] [▲▼] Subtítulo           [🗑]   │ │                                             │
│ │ [👁] [▲▼] Botões de Ação      [🗑]   │ │                                             │
│ │ [👁] [▲▼] Faixa de Métricas   [🗑]   │ │                                             │
│ │ [👁] [▲▼] Bloco de Mídia/Foto [🗑]   │ │                                             │
│ │ [👁] [▲▼] Elemento Adicional  [🗑]   │ │                                             │
│ │                                      │ │                                             │
│ │ [+ Adicionar Novo Elemento]          │ │                                             │
│ └──────────────────────────────────────┘ │                                             │
└──────────────────────────────────────────┴─────────────────────────────────────────────┘
```

### Principais Painéis e Controles

1. **Atmosfera & Fundo Total da Hero**:
   - **Modo de Fundo**:
     - `Shader WebGL`: Cores personalizadas dos nós do ruído e fundo.
     - `Imagem Estática`: Upload ou URL de imagem (PNG/JPG), preenchimento (cover, contain), alinhamento (centro, topo), e slider de overlay escuro (0% a 95%) para garantir contraste tipográfico WCAG AA.
     - `Vídeo em Loop`: Upload ou URL de vídeo MP4/WebM, reprodução automática sem som, loop infinito e camada de gradiente protetor.
2. **Gerenciador de Camadas (Layer Tree)**:
   - Lista visual de todos os elementos ativos com badges discretos.
   - Ícone de olho para ocultar/exibir instantaneamente qualquer elemento (inclusive no modo mobile seletivo).
   - Botões de reordenação vertical (Subir / Descer) para inverter a ordem visual dos blocos.
   - Botão de lixeira para remover elementos desnecessários.
   - Botão **"+ Adicionar Elemento"** que abre modal com:
     - *Bloco de Texto Livre*: Parágrafo auxiliar, citação ou aviso de agenda.
     - *Imagem PNG Transparente*: Selo comemorativo, assinatura do estúdio, mockup flutuante.
     - *Botão Extra*: Link para WhatsApp direto, download de apresentação ou agendamento.
     - *Faixa de Logos / Marcas*: Linha de parceiros ou selos de certificação.
3. **Modo Responsivo com Overrides Exclusivos**:
   - Alternância de abas na barra superior entre **Desktop** e **Mobile**.
   - No modo Mobile, o painel exibe indicador âmbar ativo:
     - Tamanho da fonte do título no celular (`compact`, `normal`, `large`).
     - Alinhamento de texto exclusivo para celular (ex: centralizado).
     - Visibilidade seletiva (ex: ocultar métricas ou redes sociais no celular para encurtar a rolagem).
     - Proporção da imagem dedicada ao mobile (`1:1` quadrado ou `4:5` vertical).

---

## 3. Principais Decisões & Trade-Offs

- **Decisão 1: Modelo de Dados Extensível para Elementos Livres**
  - *Abordagem*: Adicionar um array tipado `customElements` e um mapa de visibilidade/ordem `layerOrder` no `HeroConfig`.
  - *Motivo*: Permite adicionar novos blocos arbitrariamente sem quebrar a estrutura existente da Hero nem exigir refatorações estruturais do banco de dados.
- **Decisão 2: Mídia de Fundo Flexível com Proteção de Legibilidade**
  - *Abordagem*: Implementar componente `HeroBackgroundStage` que renderiza condicionalmente o canvas WebGL existente, tag `<video>` otimizada ou `<img>` em alta resolução, sempre protegido por uma camada de escurecimento ajustável (`scrimOpacity`).
  - *Motivo*: Garante que vídeos e fotos de fundo não comprometam a leitura dos textos e títulos do estúdio.
- **Decisão 3: Overrides Responsivos Limpos**
  - *Abordagem*: Objeto `mobileOverrides` dentro de `HeroConfig` com fallback automático para as propriedades desktop caso não sejam especificadas.
  - *Motivo*: Não obriga o usuário a configurar tudo duas vezes; ele altera apenas o que deseja que seja diferente no celular.

---

## 4. Arquitetura Técnica & Estratégia de Dados

### Modelo de Dados Atualizado (`HeroConfig`)

```typescript
export interface CustomHeroElement {
  id: string;
  type: "text" | "image" | "button" | "divider";
  title: string;
  content: string; // Texto, URL da imagem ou rótulo do botão
  linkUrl?: string; // Para tipo button
  style?: {
    alignment?: "left" | "center" | "right";
    color?: "default" | "primary" | "muted";
    size?: "sm" | "base" | "lg";
  };
  visibleDesktop: boolean;
  visibleMobile: boolean;
}

export interface HeroConfig {
  background: {
    type: "shader" | "image" | "video";
    imageUrl?: string;
    videoUrl?: string;
    overlayOpacity: number; // 0 a 100%
  };
  layout: {
    columnDistribution: "7-5" | "6-6" | "centered" | "inverted";
    textAlignment: "left" | "center";
    paddingY: "compact" | "normal" | "spacious";
    order: "text-first" | "image-first";
  };
  layers: {
    id: string;
    visibleDesktop: boolean;
    visibleMobile: boolean;
  }[];
  customElements: CustomHeroElement[];
  mobileOverrides: {
    enabled: boolean;
    textAlignment?: "left" | "center";
    headlineFontSize?: "compact" | "normal" | "large";
    imageAspectRatio?: "16/10" | "1/1" | "4/5" | "3/4";
    hideMetrics?: boolean;
    hideSocial?: boolean;
    hideKicker?: boolean;
  };
  // Propriedades fundamentais preservadas: kicker, typography, media, actions, metrics, social
  ...
}
```

### Arquivos Envolvidos
1. `src/config/heroConfig.ts` & `src/config/heroConfig.json`: Expansão dos tipos para camadas, fundo em vídeo/imagem e overrides mobile.
2. `src/components/hero/HeroBackgroundStage.tsx`: Componente de fundo que orquestra Shader WebGL, Vídeo em loop contínuo e Imagem de fundo com gradiente de contraste.
3. `src/components/hero/HeroSplitEditorial.tsx`: Atualização para ler camadas reordenáveis, renderizar elementos customizados adicionados e aplicar overrides mobile condicionalmente.
4. `src/pages/AdminHeroEditor.tsx`: Adição da aba de Camadas & Elementos, modal de Adicionar Elemento, aba de Fundo (Vídeo/Imagem/Shader), e alternador Desktop/Mobile na barra superior.
