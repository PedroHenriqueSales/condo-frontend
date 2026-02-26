import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Card } from "../components/Card";

const LEGAL_SLUGS = ["termos-de-uso", "politica-de-privacidade"] as const;
const TITLES: Record<string, string> = {
  "termos-de-uso": "Termos de Uso",
  "politica-de-privacidade": "Política de Privacidade",
};

type LegalSlug = (typeof LEGAL_SLUGS)[number];

/** Separa células de uma linha de tabela markdown (| a | b |). */
function parseTableRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

/** Converte markdown simples (##, ###, **, [text](url), tabelas) em nós React. */
function renderMarkdown(text: string) {
  const lines = text.split(/\r?\n/);
  const nodes: React.ReactNode[] = [];
  let key = 0;
  let lastWasBlank = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed) {
      if (!lastWasBlank) nodes.push(<div key={key++} className="h-2" aria-hidden />);
      lastWasBlank = true;
      continue;
    }
    lastWasBlank = false;

    // Tabela markdown: linhas consecutivas que começam com |
    if (trimmed.startsWith("|")) {
      const tableLines: string[] = [];
      let j = i;
      while (j < lines.length && lines[j].trim().startsWith("|")) {
        tableLines.push(lines[j].trim());
        j++;
      }
      i = j - 1;
      const rows = tableLines.map(parseTableRow).filter((row) => row.some((cell) => cell.length > 0));
      const isSeparator = (row: string[]) => row.every((cell) => /^[-:]+$/.test(cell));
      const headerRow = rows[0];
      const bodyRows = rows.slice(1).filter((row) => !isSeparator(row));
      if (headerRow && bodyRows.length > 0) {
        nodes.push(
          <div key={key++} className="my-4 overflow-x-auto rounded-xl border border-border">
            <table className="w-full min-w-[280px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-surface/80">
                  {headerRow.map((cell, c) => (
                    <th
                      key={c}
                      className="px-4 py-3 text-left font-semibold text-text"
                    >
                      {cell}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bodyRows.map((row, r) => (
                  <tr
                    key={r}
                    className="border-b border-border/70 last:border-b-0 even:bg-surface/40"
                  >
                    {row.map((cell, c) => (
                      <td key={c} className="px-4 py-3 text-text leading-relaxed">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      continue;
    }

    if (trimmed.startsWith("### ")) {
      nodes.push(
        <h3 key={key++} className="mt-6 text-lg font-semibold text-text">
          {trimmed.slice(4)}
        </h3>
      );
      continue;
    }
    if (trimmed.startsWith("## ")) {
      nodes.push(
        <h2 key={key++} className="mt-8 text-xl font-semibold text-text first:mt-0">
          {trimmed.slice(3)}
        </h2>
      );
      continue;
    }
    if (trimmed.startsWith("# ")) {
      nodes.push(
        <h1 key={key++} className="text-2xl font-semibold text-text">
          {trimmed.slice(2)}
        </h1>
      );
      continue;
    }
    // Parágrafo: suporte a **negrito** e [texto](url)
    const parts: React.ReactNode[] = [];
    let rest = trimmed;
    let partKey = 0;
    while (rest.length > 0) {
      const boldMatch = rest.match(/\*\*([^*]+)\*\*/);
      const linkMatch = rest.match(/\[([^\]]+)\]\(([^)]+)\)/);
      let match: RegExpMatchArray | null = null;
      let type: "bold" | "link" | null = null;
      let index = rest.length;
      if (boldMatch && boldMatch.index !== undefined && (linkMatch === null || boldMatch.index < linkMatch.index!)) {
        match = boldMatch;
        type = "bold";
        index = boldMatch.index;
      } else if (linkMatch && linkMatch.index !== undefined) {
        match = linkMatch;
        type = "link";
        index = linkMatch.index;
      }
      if (index > 0) {
        parts.push(<span key={partKey++}>{rest.slice(0, index)}</span>);
      }
      if (match && type === "bold") {
        parts.push(<strong key={partKey++}>{match[1]}</strong>);
        rest = rest.slice(match.index! + match[0].length);
      } else if (match && type === "link") {
        const href = match[2].startsWith("/") ? match[2] : match[2];
        parts.push(
          <Link key={partKey++} to={href} className="font-medium text-accent-strong hover:underline">
            {match[1]}
          </Link>
        );
        rest = rest.slice(match.index! + match[0].length);
      } else {
        break;
      }
    }
    nodes.push(
      <p key={key++} className="mt-2 text-text leading-relaxed">
        {parts}
      </p>
    );
  }

  return nodes;
}

type Props = { slug?: LegalSlug };

export function LegalPage({ slug: slugProp }: Props = {}) {
  const navigate = useNavigate();
  const { slug: slugParam } = useParams<{ slug: string }>();
  const slug = slugProp ?? (slugParam as LegalSlug | undefined);
  const [content, setContent] = useState<string | null>(null);
  const [error, setError] = useState(false);

  const validSlug = slug && LEGAL_SLUGS.includes(slug);

  useEffect(() => {
    if (!validSlug) return;
    setError(false);
    fetch(`/legal/${slug}.md`)
      .then((r) => (r.ok ? r.text() : Promise.reject(new Error("Not found"))))
      .then(setContent)
      .catch(() => setError(true));
  }, [slug, validSlug]);

  const backButton = (
    <button
      type="button"
      onClick={() => navigate(-1)}
      className="mb-6 inline-block text-sm font-medium text-accent-strong hover:underline"
    >
      ← Voltar
    </button>
  );

  if (!validSlug) {
    return (
      <div className="min-h-screen bg-bg px-4 py-10">
        <div className="mx-auto max-w-2xl">
          <p className="text-muted">Documento não encontrado.</p>
          {backButton}
        </div>
      </div>
    );
  }

  if (error || content === null) {
    return (
      <div className="min-h-screen bg-bg px-4 py-10">
        <div className="mx-auto max-w-2xl">
          {error ? (
            <p className="text-muted">Não foi possível carregar o documento.</p>
          ) : (
            <p className="text-muted">Carregando...</p>
          )}
          <div className="mt-4">{backButton}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg px-4 py-10">
      <div className="mx-auto max-w-2xl">
        {backButton}
        <Card className="p-6">
          <div className="max-w-none">
            {renderMarkdown(content)}
          </div>
        </Card>
        <p className="mt-4 text-center text-sm text-muted">
          <Link to="/termos-de-uso" className="hover:underline">
            Termos de Uso
          </Link>
          {" · "}
          <Link to="/politica-de-privacidade" className="hover:underline">
            Política de Privacidade
          </Link>
        </p>
      </div>
    </div>
  );
}
