# ComuMinha Frontend

Interface web para anúncios entre moradores de condomínio. MVP minimalista com foco em usabilidade e responsividade.

## Stack

- React 19
- TypeScript 5.9
- Vite 7
- React Router 7
- Tailwind CSS 3
- Axios

## Pré-requisitos

- Node.js 18+
- npm 9+

## Rodando localmente

1. **Backend e banco**: Certifique-se de que o backend está rodando em `http://localhost:8080` (use o script `dev-up.ps1` na raiz do projeto ou suba manualmente).

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

4. Acesse: `http://localhost:5173`

O Vite faz proxy das requisições `/api` para o backend em `http://localhost:8080`.

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento (Vite) |
| `npm run build` | Build de produção (TypeScript + Vite) |
| `npm run preview` | Preview do build de produção |

## Estrutura do projeto

```
src/
├── app/           # App.tsx, rotas
├── components/    # Componentes reutilizáveis (Button, Card, Input, etc.)
├── context/       # AuthContext, CondominiumContext
├── hooks/         # useAuth, useCondominium
├── pages/         # Páginas (Login, Feed, CreateAd, etc.)
├── services/      # API (api.ts, auth.service, ads.service, etc.)
├── styles/       # tokens.css (variáveis de design)
└── style.css     # Estilos globais
```

## Variáveis de ambiente

Em desenvolvimento, o proxy do Vite redireciona `/api` para `http://localhost:8080`. Para produção, configure a URL base da API conforme o ambiente de deploy.

## Documentação

Consulte `docs/DOCUMENTACAO_TECNICA.md` para detalhamento técnico completo.
