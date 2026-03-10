import { useEffect, useState } from "react";
import * as AdminService from "../../services/admin.service";

export function AdminSettings() {
  const [settings, setSettings] = useState<AdminService.AdminSettings | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    AdminService.getAdminSettings()
      .then(setSettings)
      .catch(() => setError("Falha ao carregar configurações."));
  }, []);

  const handleAdsToggle = () => {
    if (!settings) return;
    setSaving(true);
    AdminService.patchAdminSettings({ adsEnabled: !settings.adsEnabled })
      .then(setSettings)
      .catch(() => setError("Falha ao salvar."))
      .finally(() => setSaving(false));
  };

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-200">
        {error}
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center py-12">
        <span className="text-muted">Carregando...</span>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-fg">Configurações</h1>
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-medium text-fg">Anúncios (AdSense)</p>
            <p className="text-sm text-muted">
              Exibir blocos de publicidade no feed. Quando desligado, o componente de anúncios não é exibido.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={settings.adsEnabled}
            disabled={saving}
            className={`relative inline-flex h-8 w-14 shrink-0 rounded-full border border-border transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 ${
              settings.adsEnabled ? "bg-primary" : "bg-surface"
            } ${saving ? "opacity-60" : ""}`}
            onClick={handleAdsToggle}
          >
            <span
              className={`pointer-events-none inline-block h-7 w-7 translate-y-0.5 rounded-full bg-white shadow transition-transform ${
                settings.adsEnabled ? "translate-x-7" : "translate-x-1"
              }`}
            />
          </button>
        </div>
        <p className="mt-2 text-sm text-muted">
          Estado atual: <strong>{settings.adsEnabled ? "Ligado" : "Desligado"}</strong>
        </p>
      </div>
    </div>
  );
}
