import { Link, useLocation } from "react-router-dom";
import logoNameDark from "../assets/logo-name-dark.png";
import { Button } from "../components/Button";

export function Landing() {
  const location = useLocation();
  /** Preserva state.from (ex.: /gate?code=...) ao ir para login/registro, para redirecionar depois do auth */
  const authState = location.state && typeof location.state === "object" && "from" in location.state ? location.state : undefined;

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      {/* Header — mesmo padrão visual da Navbar do app */}
      <header className="border-b border-white/10 bg-[#382D20] dark:bg-[#1c1612]">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link
            to="/"
            className="flex shrink-0 items-center rounded overflow-hidden bg-[#382D20] dark:bg-[#1c1612]"
            aria-label="Aqui - Início"
          >
            <img
              src={logoNameDark}
              alt="Aqui"
              className="h-14 w-auto bg-transparent sm:h-16 mix-blend-lighten"
            />
          </Link>
          <nav className="flex flex-shrink-0 items-center gap-1 sm:gap-2">
            <Link
              to="/login"
              state={authState}
              className="rounded-lg px-3 py-2 text-sm font-medium text-white/95 transition hover:bg-white/10 hover:text-white"
            >
              Entrar
            </Link>
            <Link to="/register" state={authState}>
              <Button
                variant="ghost"
                size="sm"
                className="!border-white/30 !text-white hover:!bg-white/10"
              >
                Criar conta
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:py-20 md:py-24">
          <h1 className="text-3xl font-bold tracking-tight text-text sm:text-4xl md:text-5xl">
            Anúncios entre membros da sua comunidade
          </h1>
          <p className="mt-5 max-w-xl mx-auto text-lg text-muted sm:text-xl">
            Compre, venda, doe e troque com quem mora perto. Entre com o código da sua comunidade e comece a usar em segundos.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
            <Link to="/register" state={authState}>
              <Button variant="accent" size="md" className="w-full min-w-[10rem] sm:w-auto">
                Criar conta grátis
              </Button>
            </Link>
            <Link to="/login" state={authState}>
              <Button variant="ghost" size="md" className="w-full min-w-[10rem] sm:w-auto">
                Já tenho conta · Entrar
              </Button>
            </Link>
          </div>
        </section>

        {/* Como funciona */}
        <section className="border-t border-border bg-surface/20 py-16 sm:py-20">
          <div className="mx-auto max-w-4xl px-4">
            <h2 className="text-center text-2xl font-bold text-text sm:text-3xl">
              Como funciona
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-muted">
              O Aqui conecta pessoas da mesma comunidade. Tudo acontece por convite, para manter a confiança e a proximidade.
            </p>
            <ul className="mt-12 grid gap-8 sm:grid-cols-3 sm:gap-6">
              <li className="flex flex-col items-center text-center">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent-strong">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </span>
                <h3 className="mt-4 font-semibold text-text">Crie ou entre na comunidade</h3>
                <p className="mt-2 text-sm text-muted">
                  Crie uma comunidade para seu condomínio ou bairro, ou peça o código de acesso a quem já administra uma.
                </p>
              </li>
              <li className="flex flex-col items-center text-center">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent-strong">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </span>
                <h3 className="mt-4 font-semibold text-text">Publique e navegue</h3>
                <p className="mt-2 text-sm text-muted">
                  Anuncie itens à venda, aluguel, doação ou serviços. Veja o que os vizinhos estão oferecendo e entre em contato direto.
                </p>
              </li>
              <li className="flex flex-col items-center text-center">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent-strong">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </span>
                <h3 className="mt-4 font-semibold text-text">Entre em contato e combine</h3>
                <p className="mt-2 text-sm text-muted">
                  O contato é feito por WhatsApp. Você combina com o outro membro da forma que preferir — seguro e simples.
                </p>
              </li>
            </ul>
          </div>
        </section>

        {/* Por que o Aqui */}
        <section className="border-t border-border py-16 sm:py-20">
          <div className="mx-auto max-w-4xl px-4">
            <h2 className="text-center text-2xl font-bold text-text sm:text-3xl">
              Por que usar o Aqui
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-muted">
              Um espaço só para sua comunidade, sem anúncios de fora e com foco em confiança e praticidade.
            </p>
            <div className="mt-12 grid gap-6 sm:grid-cols-2">
              <div className="rounded-2xl border border-border bg-card/50 p-6">
                <h3 className="font-semibold text-text">Só quem você conhece (ou quase)</h3>
                <p className="mt-2 text-sm text-muted">
                  Apenas membros da sua comunidade veem e publicam anúncios. Menos ruído, mais relevância e mais segurança para combinar encontros e negócios.
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-card/50 p-6">
                <h3 className="font-semibold text-text">Venda, doação, aluguel e indicações</h3>
                <p className="mt-2 text-sm text-muted">
                  Dê um novo uso ao que não precisa mais, alugue itens, peça indicações de serviços ou indique profissionais. Tudo no mesmo lugar.
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-card/50 p-6">
                <h3 className="font-semibold text-text">Contato direto por WhatsApp</h3>
                <p className="mt-2 text-sm text-muted">
                  Sem intermediários. Você vê o anúncio, clica em contato e abre a conversa no WhatsApp para combinar os detalhes.
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-card/50 p-6">
                <h3 className="font-semibold text-text">Grátis para usar</h3>
                <p className="mt-2 text-sm text-muted">
                  Criar conta, entrar na comunidade e publicar anúncios não têm custo. O Aqui existe para aproximar vizinhos, não para cobrar por isso.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA final */}
        <section className="border-t border-border bg-surface/20 py-16 sm:py-20">
          <div className="mx-auto max-w-2xl px-4 text-center">
            <h2 className="text-2xl font-bold text-text sm:text-3xl">
              Pronto para começar?
            </h2>
            <p className="mt-3 text-muted">
              Crie sua conta, entre na sua comunidade com o código de acesso e comece a publicar ou a procurar anúncios.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
              <Link to="/register" state={authState}>
                <Button variant="accent" size="md" className="w-full sm:w-auto sm:min-w-[10rem]">
                  Criar conta grátis
                </Button>
              </Link>
              <Link to="/login" state={authState}>
                <Button variant="ghost" size="md" className="w-full sm:w-auto sm:min-w-[10rem]">
                  Entrar na minha conta
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Rodapé */}
      <footer className="border-t border-border bg-surface/30 py-8">
        <div className="mx-auto max-w-5xl px-4">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-8">
            <Link to="/termos-de-uso" className="text-sm text-muted hover:text-text hover:underline">
              Termos de Uso
            </Link>
            <Link to="/politica-de-privacidade" className="text-sm text-muted hover:text-text hover:underline">
              Política de Privacidade
            </Link>
            <a
              href="mailto:contato@aquiapp.com.br"
              className="text-sm font-medium text-accent-strong hover:underline"
            >
              Fale conosco
            </a>
          </div>
          <p className="mt-4 text-center text-xs text-muted">
            © Aqui · Anúncios entre membros da sua comunidade
          </p>
        </div>
      </footer>
    </div>
  );
}
