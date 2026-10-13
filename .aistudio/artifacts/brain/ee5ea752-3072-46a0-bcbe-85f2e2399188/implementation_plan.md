# Padronização de UI/UX, Correção da Hero & Alinhamento de Propostas

Este plano detalha a correção definitiva do enquadramento e escala da sua foto na Hero da página inicial, a padronização completa de UI/UX entre todas as páginas públicas e o painel administrativo, e o alinhamento visual das Propostas Comerciais ao novo sistema editorial do site.

## User Review & Critical Decisions

> [!IMPORTANT]
> As decisões abaixo refletem suas escolhas confirmadas e diagnósticos visuais identificados na aplicação atual.

- **Correção da Foto na Hero (Confirmado)**: A imagem de retrato atual possui um canvas widescreen (`1920×1071`) com margens transparentes laterais que, combinadas ao limite de largura da coluna e aos cards flutuantes sobrepostos, reduziam a escala da foto e cobriam parte do rosto/tronco. Vamos corrigir o recorte e o dimensionamento para que sua foto ocupe a altura correta (`85vh` no desktop), ancorada na base direita e sem elementos cobrindo sua imagem.
- **Alinhamento da Proposta Comercial ao Novo Site (Confirmado)**: A página pública de propostas (`/proposta/:slug`) será atualizada para o mesmo padrão editorial escuro da Home e de Projetos, substituindo marcações antigas (`[ 01 ]`, `[ CLIENTE ]`, `//`) e pílulas sobrepostas nas capas por metadados limpos e tipografia unificada.
- **Padronização Global de UI/UX (Confirmado)**: Unificação de espaçamentos, cabeçalhos de seção, filtros de categoria, estados de botões, formulários e navegação entre o site público e todas as telas do painel administrativo.

---

## 1. Overview & Core Concept

- **O Que Será Feito**:
  1. **Hero com Retrato em Destaque Real**: Ajuste de proporção, posicionamento e camadas na seção principal da Home para valorizar sua foto com presença visual limpa, iluminação equilibrada e leitura desobstruída.
  2. **Sistema de UI/UX Unificado no Site Público**: Consistência rigorosa de tipografia, respiro entre seções, filtros interativos, cards de projetos e formulários nas páginas Início, Sobre, Projetos, Detalhe do Projeto, Serviços e Contato.
  3. **Proposta Comercial Editorial**: Redesenho da visualização de propostas para espelhar exatamente a estética refinada do portfólio, fortalecendo a percepção de valor no momento do fechamento comercial.
  4. **Painel Administrativo Coeso**: Padronização visual e estrutural do Admin (barra de navegação unificada, remoção de prefixos mecânicos, categorias alinhadas ao portfólio e indicador de visualizações nas propostas).
- **Público-Alvo**: Clientes e empresas avaliando seu portfólio ou analisando uma proposta comercial, e você na gestão diária de cases, propostas e configurações.
- **Valor Principal**: Eliminar ruídos visuais e inconsistências entre páginas, garantindo que a primeira impressão na Hero e a experiência até a aprovação da proposta transmitam direção de arte de alto nível.

---

## 2. User Experience & Visual Design

- **Fluxos Principais Revisados**:
  1. **Impacto Inicial na Home**: O visitante chega à Home e vê imediatamente o título de posicionamento à esquerda e sua foto em tamanho real e nítido à direita, ancorada à base da seção, sem cards flutuantes obstruindo o retrato.
  2. **Navegação e Filtragem Consistentes**: Ao navegar entre Home, Sobre, Projetos, Serviços e Contato, os cabeçalhos editoriais seguem a mesma escala tipográfica, altura de linha e alinhamento de container (`1200px`), com transições suaves de 200–250ms.
  3. **Leitura e Aprovação de Proposta Comercial**: Ao abrir um link `/proposta/:slug`, o cliente encontra a mesma linguagem visual do site: cabeçalho flutuante limpo, metadados executivos sem colchetes mecânicos, cases selecionados em Bento Grid com modal de leitura rápida e seção de investimento clara com aprovação em 1 clique.
  4. **Gestão Fluida no Admin**: Navegação direta no topo entre Cases, Propostas, Página Sobre e Configurações, com formulários padronizados e visualização imediata de quantas vezes cada proposta foi aberta pelo cliente.

- **Identidade Visual & Tema**:
  - *Direção Estética*: Editorial contemporâneo de alto contraste (superfícies escuras profundas combinadas com seções estratégicas em superfície clara na área de Serviços para leitura confortável).
  - *Paleta de Cores (60-30-10)*:
    - **60% Canvas Dominante**: Fundo escuro profundo (`--background: 220 18% 5%`) e superfície clara editorial (`#F4F3EE`) em Serviços.
    - **30% Superfícies Estruturais**: Containers sutis (`--card: 220 15% 8%`), divisórias finas (`--border: 220 14% 16%`) e texto secundário equilibrado (`--muted-foreground`).
    - **10% Acento Focal**: Laranja vibrante (`--primary: 15 100% 50%`) reservado para ações primárias, destaques tipográficos, indicadores ativos e numeração editorial.
  - *Tipografia & Hierarquia*:
    - Display: `Figtree` com tracking ajustado (`-0.025em`) e `text-wrap: balance` para evitar palavras órfãs.
    - Corpo: `Plus Jakarta Sans` para leitura fluida em descrições de cases, serviços e propostas.
    - Dados & Índices: `JetBrains Mono` com `tabular-nums` em métricas (`2.500+`, `500+`, `13+ anos`), anos, valores monetários e numeração de seções (`01.`, `02.`, `03.`).

---

## 3. Key Product Decisions & Trade-Offs

- **Decisão 1: Enquadramento e Camadas da Foto na Hero**
  - *Abordagem Escolhida*: Remover os dois cards flutuantes que ficavam sobrepostos à direita da tela cobrindo a foto, ajustar a proporção das colunas para `48% / 52%` e aplicar dimensionamento sem restrição artificial de largura horizontal (`max-w-none` / recorte otimizado do retrato) ancorado à base direita. As credenciais de autoridade (`2.500+ projetos · 500+ clientes · 13+ anos`) passam a integrar uma barra editorial limpa e legível na própria composição da Hero.
  - *Por Quê*: A restrição padrão de `max-width: 100%` em uma imagem de proporção horizontal (`1920×1071`) dentro de uma coluna estreita achatava a altura real do retrato na tela, enquanto os cards flutuantes competiam diretamente com o seu rosto.
  - *Alternativas Consideradas*: Manter cards flutuantes menores sobre a foto foi descartado porque qualquer sobreposição no retrato principal reduz o impacto autoral da Hero.

- **Decisão 2: Unificação de Metadados e Numeração Editorial nas Propostas e no Admin**
  - *Abordagem Escolhida*: Substituir todos os rótulos antigos entre colchetes (`[ 01 ]`, `[ CLIENTE ]`, `// GERADOR COMERCIAL`) por numeração editorial limpa (`01.`, `02.`, `03.`) e metadados separados por ponto médio (`·`), igualando o padrão de `ProposalView` e do Painel Admin ao restante do site.
  - *Por Quê*: Cria uma experiência coesa de ponta a ponta — desde o primeiro acesso ao portfólio até a proposta comercial enviada ao cliente.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

- **Arquitetura & Hierarquia de Componentes**:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    SISTEMA DE DESIGN & LAYOUT GLOBAL                    │
│     Tipografia (Figtree / Plus Jakarta / Mono) · Tokens · Transições    │
└───────────────────┬─────────────────────────────────┬───────────────────┘
                    │                                 │
                    ▼                                 ▼
┌───────────────────────────────────────┐ ┌───────────────────────────────┐
│        EXPERIÊNCIA PÚBLICA            │ │   COMERCIAL & ADMINISTRATIVO  │
├───────────────────────────────────────┤ ├───────────────────────────────┤
│ • Hero (Retrato em escala real +      │ │ • ProposalView (/proposta/:s) │
│   credenciais desobstruídas)          │ │   ├─ Header Editorial Limpo   │
│ • Home Sections (Sobre, Serviços,     │ │   ├─ Escopo & Cronograma 01.  │
│   Destaques Bento, Processo, FAQ)     │ │   ├─ Bento Grid Cases 02.     │
│ • Páginas Internas (/sobre, /projetos,│ │   └─ Investimento & Aprovação │
│   /projetos/:id, /servicos, /contato) │ │ • Admin Layout Unificado      │
│ • ContactDrawer & ContactForm         │ │   ├─ Cases & Categorias       │
│   (Validação e envio compartilhados)  │ │   ├─ Propostas + Views Count  │
└───────────────────────────────────────┘ │   └─ Sobre & Configurações    │
                                          └───────────────────────────────┘
```

- **Mapeamento de Interações e Estados**:
  - **Hero Portrait & Layout**: Renderização imediata (`eager` + `fetchpriority="high"`), alinhada na base direita do container sem achatamento de proporção, respeitando `prefers-reduced-motion`.
  - **Filtros de Categoria Sincronizados**: As categorias (`Brand Design`, `Social Media`, `Web Design`, `UI/UX Design`) estarão disponíveis de forma idêntica nos filtros da página `/projetos`, no seletor de cases do gerador de propostas e no formulário de criação/edição de projetos no Admin.
  - **Proposta Comercial Interativa**: Leitura de cases selecionados via modal interno sem sair da proposta, botão de impressão/PDF formatado, cópia rápida de link e aprovação direta com atualização de status em tempo real e redirecionamento opcional para WhatsApp.
  - **Indicador de Aberturas no Admin**: Consulta agregada à tabela `proposal_views` para exibir no painel `/admin/propostas` quantas visualizações cada proposta recebeu.
