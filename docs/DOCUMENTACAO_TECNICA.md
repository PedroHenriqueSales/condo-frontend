# Documentação Técnica — Frontend ComuMinha

## 1. Visão geral

O frontend do ComuMinha é uma **SPA** em **React 19** com **TypeScript** e **Vite 7**. Utiliza Context API para estado global, Tailwind CSS para estilos e Axios para comunicação com a API REST.

## 2. Arquitetura

### 2.1 Estrutura de pastas

```
src/
├── app/              # App.tsx, rotas (routes.tsx)
├── components/       # Componentes reutilizáveis
│   ├── Badge.tsx
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
| `/gate` | CondominiumGate | RequireAuth |
| `/feed` | Feed | RequireAuth + RequireCommunity |
| `/ads/new` | CreateAd | RequireAuth + RequireCommunity |
| `/ads/:id` | AdDetail | RequireAuth + RequireCommunity |
| `/my-ads` | MyAds | RequireAuth + RequireCommunity |
| `*` | Navigate to `/` | Fallback |

### 3.2 Guards

- **RequireAuth:** redireciona para `/login` se não houver token
- **RequireCommunity:** redireciona para `/gate` se não houver comunidades ou condomínio ativo
- **IndexRedirect:** encaminha para `/login`, `/gate` ou `/feed` conforme o estado

## 4. Estado global

### 4.1 AuthContext

- **Estado:** `token`, `user` (id, email, name)
- **Ações:** `login`, `register`, `logout`
- **Persistência:** `localStorage` (`comuminha.token`, `comuminha.authState`)

### 4.2 CondominiumContext

- **Estado:** `communities`, `activeCommunityId`, `isLoading`
- **Ações:** `refresh`, `setActiveCommunityId`, `clear`
- **Persistência:** `localStorage` (`comuminha.activeCommunityId`)

## 5. Serviços e API

### 5.1 api.ts

- Cliente **Axios** com `baseURL: "/api"`
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
| `--c-primary` | Cor primária (verde) |
| `--c-primary-strong` | Verde mais forte |
| `--c-danger` | Vermelho (erros, ações perigosas) |

### 6.2 Tema

- Suporte a **dark mode** via `prefers-color-scheme: dark`
- Paleta clara (off-white/cinza) com verde suave como primária
- Cantos arredondados (12–16px), sombras suaves
- Tipografia: Inter ou system-ui

## 7. Componentes principais

| Componente | Descrição |
|------------|-----------|
| `Badge` | Badge para tipo/status de anúncio |
| `Button` | Botão com variantes (primary, secondary, danger) |
| `Card` | Card para anúncios e layouts |
| `Input` | Input com label e erro |
| `Navbar` | Barra de navegação com usuário e condomínio |
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

## 9. Build e deploy

### 9.1 Comandos

- `npm run dev` — desenvolvimento
- `npm run build` — `tsc && vite build`
- `npm run preview` — preview do build

### 9.2 Produção

- Configurar `baseURL` da API se o backend estiver em domínio diferente
- Garantir que o backend tenha CORS configurado para o domínio do frontend

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
