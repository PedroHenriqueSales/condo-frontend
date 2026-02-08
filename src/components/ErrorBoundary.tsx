import React, { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { hasError: boolean; error?: Error };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-4">
          <div className="max-w-md text-center">
            <div className="mb-4 text-2xl font-semibold text-fg">
              Algo deu errado
            </div>
            <div className="mb-6 text-sm text-muted">
              Tente recarregar a página. Se o problema continuar, verifique se
              está na mesma rede Wi‑Fi do computador.
            </div>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-xl bg-primary px-6 py-3 font-medium text-white transition hover:opacity-90"
            >
              Recarregar
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
