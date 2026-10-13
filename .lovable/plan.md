
# Auditoria Completa: UX/UI, Funcionalidade e Product Design

Naveguei por todas as telas (Home, Projetos, Sobre, Servicos, Contato, Admin Dashboard, Admin Form, Admin Settings, Admin Usuarios, Admin Login, 404) em desktop e mobile. Segue a análise organizada por prioridade.

---

## BUGS E PROBLEMAS FUNCIONAIS (Prioridade Alta)

### 1. Login redireciona mesmo se o usuário NÃO for admin
O `AdminLogin.tsx` redireciona para `/admin` ao detectar qualquer sessão autenticada — sem verificar se o usuário tem role `admin`. Um usuário comum seria redirecionado para o dashboard e ficaria preso numa tela quebrada.
**Fix:** Verificar role admin antes de redirecionar. Se não for admin, mostrar mensagem "Acesso não autorizado" e fazer sign out.

### 2. Listener de auth vazando (memory leak)
No `AdminLogin.tsx`, `onAuthStateChange` é chamado sem cleanup no `useEffect` — o listener nunca é removido.
**Fix:** Retornar `subscription.unsubscribe()` no cleanup do `useEffect`.

### 3. Página de detalhe do projeto permite acessar rascunhos via URL direta
`ProjectDetail.tsx` busca o projeto por ID sem filtrar `status != Rascunho`. Qualquer pessoa com o link pode ver um rascunho.
**Fix:** Adicionar `.neq("status", "Rascunho")` na query ou redirecionar para 404.

---

## UX/UI DO SITE PUBLICO (Prioridade Media)

### 4. Navbar mobile sem menu hamburguer visivel
No mobile (375px), a navbar mostra só o logo — sem links de navegacao nem menu hamburguer. O usuario nao consegue navegar pelo site no celular.
**Fix:** Adicionar menu hamburguer mobile com slide-in ou sheet.

### 5. Pagina 404 generica e sem identidade
A 404 e muito basica ("Oops! Page not found" em ingles). Nao tem navbar, footer, nem segue o design system.
**Fix:** Redesenhar com Layout, ilustracao, texto em PT-BR, e CTA para voltar.

### 6. Espacamento excessivo entre hero e filtros na pagina Projetos
Ha um gap vazio grande entre o titulo "Projetos" e os filtros, prejudicando a sensacao de continuidade.
**Fix:** Reduzir padding/margin nessa zona.

### 7. Contato — select nativo feio no campo "Servico"
O `<select>` nativo destoa do design refinado. Usar um Select custom do shadcn.

### 8. Footer — links sociais sem destino real
Os links de Dribbble, LinkedIn, Behance e Instagram provavelmente apontam para "#" ou URLs placeholder. Confirmar e corrigir para os perfis reais do designer (ou remover se nao houver).

### 9. WhatsApp button — sem numero configurado
O botao verde de WhatsApp pode nao ter numero real configurado.

---

## ADMIN — UX/UI (Prioridade Media)

### 10. Settings muito espartana
A pagina de Configuracoes so tem 2 campos (nome do site + email). Poderia incluir:
- Links de redes sociais (que alimentam o footer)
- Numero do WhatsApp
- Texto do hero / subtitulo
- Logo upload

### 11. Formulario de projeto — upload de galeria sem feedback visual
Nao vi preview das imagens ao fazer upload, nem indicador de progresso. Isso pode frustrar ao subir varias imagens.

### 12. Admin Dashboard — tabela nao responsiva
Em telas menores a tabela de projetos pode quebrar. Idealmente usar cards em mobile.

### 13. Admin Users — pagina funciona mas e muito simples
A busca lista todos os usuarios, o que pode ser lento com muitos cadastrados. Adicionar paginacao ou limit.

---

## PRODUCT DESIGN — MELHORIAS ESTRATEGICAS (Prioridade Baixa)

### 14. SEO basico ausente
- Nenhuma pagina tem `<title>` ou `<meta description>` dinamicos
- Sem JSON-LD (Person/Organization)
- Sem Open Graph tags para compartilhamento
**Fix:** Adicionar react-helmet-async com meta tags por pagina.

### 15. Loading states sem skeleton
Todas as paginas mostram "Carregando..." em texto puro. Skeletons dariam uma percepcao de velocidade muito melhor.

### 16. Animacoes da home podem ser otimizadas
Framer Motion esta sendo usado em muitos componentes. Considerar `LazyMotion` para reduzir bundle.

### 17. Falta "scroll to top" na navegacao entre paginas
Ao clicar em links do footer ou navegar, a pagina nao volta ao topo.

### 18. Depoimentos sao hardcoded
Os testimonials sao estaticos no codigo. Idealmente viriam de uma tabela no banco para o admin gerenciar.

---

## PLANO DE IMPLEMENTACAO SUGERIDO

**Fase 1 — Bugs criticos (itens 1-3):** ~30 min
**Fase 2 — UX mobile + 404 (itens 4-6):** ~1h
**Fase 3 — Polimento UI (itens 7-9, 11-12):** ~1h
**Fase 4 — SEO + skeletons (itens 14-15, 17):** ~1h
**Fase 5 — Settings expandido + depoimentos dinamicos (itens 10, 18):** ~2h

Me diga quais itens (ou fases) voce quer que eu implemente primeiro.
