# Remix of Remix of Bloom Studio  03

PORTFÓLIO PROFISSIONAL DE DESIGN COM CMS INTERNO

ETAPA 1 - Estrutura do Site e Hero

Visão do Produto:

Criar um site de portfólio moderno para um designer que oferece serviços de Social Media Design, Brand Design e Web Design. O site deve apresentar projetos, serviços e permitir gerenciamento interno de novos projetos através de um painel admin.

Implemente:

1. Hero Section

- Headline grande: "Designer criando marcas e experiências digitais memoráveis"

- Subtexto apresentando os serviços

- CTA principal: "Ver Projetos"

- CTA secundário: "Entrar em contato"

2. Navbar

- Logo

- Links: Home, Projetos, Serviços, Sobre, Contato

- Botão destaque "Iniciar Projeto"

3. Seção de destaque de projetos

- Grid visual com cards grandes

- Mostrar imagem do projeto

- Nome do projeto

- Categoria (Social Media / Brand / Web)

4. Footer

- Links principais

- Redes sociais

- Email de contato

Especificações:

- Stack: React + Tailwind

- Banco: Supabase

- Tabela projetos:

  id

  titulo

  descricao

  categoria

  imagem_capa

  galeria

  tags

  link_projeto

  data_publicacao

  destaque

UI/Design:

- Layout dark premium

- Gradientes laranja/vermelho

- Cards grandes com hover suave

- Tipografia bold para títulos

- Grid responsivo

NÃO implemente:

- Sistema de pagamento

- Login público de usuários

- Marketplace

ETAPA 2 - Página de Projetos

Implemente:

1. Página /projetos

- Grid responsivo de projetos

- Filtros por categoria:

  Social Media

  Brand Design

  Web Design

2. Card de Projeto

- Imagem grande

- Nome

- Categoria

- Hover com animação

3. Página individual de projeto

- Hero com imagem

- Descrição detalhada

- Galeria de imagens

- Tags do projeto

4. Navegação entre projetos

- "Projeto anterior"

- "Próximo projeto"

Especificações:

- Carregar dados da tabela projetos

- Filtro dinâmico

- Lazy loading de imagens

ETAPA 3 - Página de Serviços

Implemente:

1. Seção serviços principais

- Social Media Design

- Brand Design

- Web Design

2. Cada serviço deve conter

- descrição

- benefícios

- exemplos de entregáveis

3. Seção processo de trabalho

- Briefing

- Estratégia

- Design

- Entrega

4. CTA final

- "Solicitar orçamento"

ETAPA 4 - Página Sobre

Implemente:

1. Apresentação do designer

- Foto profissional

- Texto contando experiência

2. Filosofia de design

- Estratégia

- Criatividade

- Resultados

3. Lista de ferramentas usadas

- Figma

- Adobe

- Webflow

- Framer

4. CTA para contato

ETAPA 5 - Página de Contato

Implemente:

1. Formulário

- Nome

- Email

- Tipo de projeto

- Mensagem

2. Integração com Supabase

- salvar leads

3. Informações de contato

- email

- redes sociais

4. CTA forte

ETAPA 6 - Painel Admin (Gerenciador de Projetos)

Criar área administrativa protegida.

Implemente:

1. Login admin

- autenticação Supabase

2. Dashboard

- lista de projetos

- botão "Novo Projeto"

3. Criar projeto

Campos:

- título

- descrição

- categoria

- upload imagem capa

- upload galeria

- tags

- link externo

- destacar projeto

4. Editar projeto

- atualizar informações

- excluir projeto

Especificações:

- CRUD completo conectado ao Supabase

- Upload de imagens via storage

- Atualização em tempo real

UI/Design:

- Interface minimalista estilo dashboard

- Cards para projetos

- Botões claros de ação

NÃO alterar:

- estrutura do banco

- design principal do site

REGRAS DE DESIGN:

- UI bonita, harmônica e moderna

- inspirada em portfólios premiados Awwwards

- animações suaves

- alto contraste visual

- responsividade total (mobile, tablet, desktop)

- tipografia elegante

- layout visual focado em imagens de projetos

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://olucasevan.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/8413b28c-add6-48d5-a9bd-f17bf267511e).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
