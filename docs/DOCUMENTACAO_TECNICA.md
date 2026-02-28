# Documentação Técnica — Frontend Aqui

## 1. Visão geral

O frontend do Aqui é uma **SPA** em **React 19** com **TypeScript** e **Vite 7**. Utiliza Context API para estado global, Tailwind CSS para estilos e Axios para comunicação com a API REST.

## 2. Arquitetura

### 2.1 Estrutura de pastas

```
src/
├── app/              # App.tsx, rotas (routes.tsx)
├── components/       # Componentes reutilizáveis
│   ├── Badge.tsx
│   ├── BottomNav.tsx
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Input.tsx
│   ├── Navbar.tsx
│   └── Tabs.tsx
├── context/          # Context API
│   ├── AuthContext.tsx
│   └── CondominiumContext.tsx
├── hooks/            # Hooks customizados
│   ├── useAuth.ts
│   └── useCondominium.ts
├── pages/            # Páginas/rotas
│   ├── AdDetail.tsx
│   ├── CondominiumGate.tsx
│   ├── CreateAd.tsx
│   ├── Feed.tsx
│   ├── Login.tsx
│   ├── MyAds.tsx
│   └── Register.tsx
├── services/         # Serviços de API
│   ├── api.ts        # Cliente Axios + interceptor
│   ├── ads.service.ts
│   ├── auth.service.ts
│   ├── condominium.service.ts
│   ├── contracts.ts  # Tipos TS espelhando backend
│   └── metrics.service.ts
├── utils/            # Utilitários
│   ├── format.ts
│   ├── imageUrl.ts   # resolveImageUrl (URLs de imagens em homolog/prod)
│   ├── share.ts
│   └── whatsapp.ts
├── styles/
│   └── tokens.css    # Variáveis CSS (cores, tema)
├── style.css         # Estilos globais
└── main.tsx          # Entry point
```

### 2.2 Fluxo de dados

```
Página
  → Hook (useAuth, useCondominium)
  → Context (AuthContext, CondominiumContext)
  → Service (auth.service, ads.service, etc.)
  → api.ts (Axios + interceptor de token)
  → Backend REST
```

## 3. Rotas e guards

### 3.1 Mapa de rotas

| Rota | Componente | Proteção |
|------|------------|----------|
| `/` | IndexRedirect | Redireciona conforme estado |
| `/login` | Login | Público |
| `/register` | Register | Público |
| `/gate` | CondominiumGate | RequireAuth (aceita `?code=` para pré-preencher o código) |
| `/feed` | Feed | RequireAuth + RequireCommunity |
| `/ads/new` | CreateAd | RequireAuth + RequireCommunity |
| `/ads/:id` | AdDetail | RequireAuth + RequireCommunity |
| `/my-ads` | MyAds | RequireAuth + RequireCommunity |
| `/communities` | MyCommunities | RequireAuth + RequireCommunity |
| `*` | Navigate to `/` | Fallback |

### 3.2 Guards

- **RequireAuth:** redireciona para `/login` se não houver token
- **RequireCommunity:** redireciona para `/gate` se não houver comunidades ou condomínio ativo
- **IndexRedirect:** encaminha para `/login`, `/gate` ou `/feed` conforme o estado

## 4. Estado global

### 4.1 AuthContext

- **Estado:** `token`, `user` (id, email, name)
- **Ações:** `login`, `register`, `logout`
- **Persistência:** `localStorage` (`aquidolado.token`, `aquidolado.authState`)

### 4.2 CondominiumContext

- **Estado:** `communities`, `activeCommunityId`, `isLoading`
- **Ações:** `refresh`, `setActiveCommunityId`, `clear`
- **Persistência:** `localStorage` (`aquidolado.activeCommunityId`)

## 5. Serviços e API

### 5.1 api.ts

- Cliente **Axios** com `baseURL` de `src/config/env.ts` (`apiPrefix`):
  - **Dev:** `"/api"` (proxy Vite; nenhuma `VITE_API_URL_*` definida)
  - **Homolog/Produção (Vercel):** `${VITE_API_URL_PRODUCTION}` ou `${VITE_API_URL_PREVIEW}` + `/api`, conforme o ambiente do deploy
- **Interceptor:** adiciona `Authorization: Bearer <token>` em todas as requisições
- Funções: `getStoredToken`, `setStoredToken`

### 5.2 Proxy Vite

Em dev, requisições para `/api` são enviadas para `http://localhost:8080`:

```ts
server: {
  proxy: {
    "/api": { target: "http://localhost:8080", changeOrigin: true }
  }
}
```

### 5.3 Contratos (contracts.ts)

Tipos TypeScript alinhados ao backend:

- `AuthResponse`, `RegisterRequest`, `LoginRequest`
- `CommunityResponse`, `CreateCommunityRequest`, `JoinCommunityRequest`
- `AdResponse`, `CreateAdRequest`, `AdType`, `AdStatus`
- `Page<T>`, `EventLogRequest`, `ContactClickRequest`, `ReportRequest`
- `AdTypeLabels` — labels em português

## 6. Design system

### 6.1 Tokens (tokens.css)

| Variável | Uso |
|----------|-----|
| `--c-bg` | Fundo geral |
| `--c-surface` | Cards, superfícies |
| `--c-text` | Texto principal |
| `--c-muted` | Texto secundário |
| `--c-border` | Bordas |
| `--c-primary` | Cor de destaque (botões; #d7a64b) |
| `--c-primary-strong` | Hover dos botões de destaque |
| `--c-info` | Informações relevantes (ex.: valor dos anúncios; #705034 no tema claro) |
| `--c-danger` | Vermelho (erros, ações perigosas) |

### 6.2 Tema

- Suporte a **dark mode** via `prefers-color-scheme: dark`
- **Tema claro:** fundo #ffffff; botões de destaque #d7a64b; informações relevantes #705034
- **Tema escuro:** fundo em degradé radial (centro #795537, bordas #593f28); botões de destaque #d7a64b
- Cantos arredondados (12–16px), sombras suaves
- Tipografia: Inter ou system-ui
- Logo no topo: variantes por tema (logo-name-light.png / logo-name-dark.png)

## 7. Componentes principais

| Componente | Descrição |
|------------|-----------|
| `AdPlaceholder` | Placeholder com logo quando anúncio não tem imagem |
| `Badge` | Badge para tipo/status de anúncio |
| `BottomNav` | Barra de navegação inferior (Início, Meus Anúncios, Adicionar anúncio, Comunidades, Minha Conta) |
| `Button` | Botão com variantes (primary, ghost, danger) |
| `Card` | Card para anúncios e layouts |
| `Input` | Input com label e erro |
| `Navbar` | Barra superior com logo e Sair |
| `ShareCommunityModal` | Modal para compartilhar código (QR code, copiar, WhatsApp) |
| `Tabs` | Abas para filtros (ex.: Feed) |

## 8. Páginas

| Página | Função |
|--------|--------|
| **Login** | Formulário de login |
| **Register** | Formulário de cadastro |
| **CondominiumGate** | Criar condomínio ou entrar por código |
| **Feed** | Lista de anúncios com filtros (tipo, busca) |
| **CreateAd** | Formulário de novo anúncio |
| **AdDetail** | Detalhes do anúncio + botão contato |
| **MyAds** | Meus anúncios + encerrar |
| **MyCommunities** | Lista de comunidades + compartilhar código (QR code, copiar, WhatsApp) |

## 9. Build e deploy

### 9.1 Comandos

- `npm run dev` — desenvolvimento
- `npm run build` — `tsc && vite build`
- `npm run preview` — preview do build

### 9.2 Deploy (homologação)

O frontend usa **Vercel** com custo zero. Em homologação, frontend e backend estão em domínios diferentes.

**Variáveis de ambiente (Vercel):**

No Vercel, uma mesma variável tem um único valor; se você marcar Production e Preview, os dois ambientes usam o mesmo valor. Para ter URL diferente em cada ambiente, use **duas variáveis** e atribua **cada uma a um único ambiente**:

| Variável | Atribuir apenas a | Valor (exemplo) |
|----------|--------------------|-----------------|
| `VITE_API_URL_PRODUCTION` | **Production** | `https://condo-backend-production.up.railway.app` |
| `VITE_API_URL_PREVIEW` | **Preview** | `https://condo-backend-homolog.up.railway.app` |
| `VITE_APP_ENV` (opcional) | Production → `production`, Preview → `homolog` | `production` ou `homolog` |

Assim, ao editar uma variável no painel, a outra não é alterada. O build usa a URL correspondente ao ambiente do deploy (Production ou Preview).

O perfil `VITE_APP_ENV` pode ser usado no código (`src/config/env.ts`: `appEnv`, `isHomolog`) para exibir um aviso “Ambiente de homologação” ou alterar comportamento.

**Arquivos de exemplo:**

- `.env.example` — documenta `VITE_API_URL_PRODUCTION`, `VITE_API_URL_PREVIEW` e `VITE_APP_ENV`

**URLs de imagens:**

- O backend retorna paths relativos (`/uploads/ads/xxx.jpg`). Em homolog/prod usamos `resolveImageUrl()` em `utils/imageUrl.ts`, que usa a URL da API de `src/config/env.ts` (`VITE_API_URL_PRODUCTION` ou `VITE_API_URL_PREVIEW`).
- Usado em: Feed, AdDetail, MyAds, EditAd.

**CORS:**

- O backend deve ter `CORS_ALLOWED_ORIGINS` com a URL do frontend Vercel.

### 9.3 Produção e homologação

- No Vercel, usar **duas variáveis** e atribuir cada uma a **um único ambiente** (assim ao mudar uma, a outra não altera):
  - **VITE_API_URL_PRODUCTION** → marcar só **Production** → URL do backend de produção
  - **VITE_API_URL_PREVIEW** → marcar só **Preview** → URL do backend de homolog
  - **VITE_APP_ENV** (opcional) → um valor por ambiente
- Garantir que cada backend tenha CORS configurado para a origem do front correspondente

## 10. Dependências principais

| Pacote | Versão | Uso |
|--------|--------|-----|
| react | 19.2.x | UI |
| react-dom | 19.2.x | Renderização |
| react-router-dom | 7.x | Rotas |
| axios | 1.13.x | Requisições HTTP |
| vite | 7.x | Build e dev server |
| tailwindcss | 3.4.x | Estilos |
| typescript | 5.9.x | Tipagem |
