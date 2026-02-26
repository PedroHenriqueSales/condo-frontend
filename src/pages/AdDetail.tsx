import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AdPlaceholder } from "../components/AdPlaceholder";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { ImageLightbox } from "../components/ImageLightbox";
import { Navbar } from "../components/Navbar";
import { BottomNav } from "../components/BottomNav";
import { TextWithLinks } from "../components/TextWithLinks";
import { useAuth } from "../hooks/useAuth";
import { useCondominium } from "../hooks/useCondominium";
import type { AdResponse, CommentResponse, ReportReason } from "../services/contracts";
import { AdTypeLabels, ReportReasonLabels } from "../services/contracts";
import { formatPrice, formatPublishedAt } from "../utils/format";
import { resolveImageUrl } from "../utils/imageUrl";
import { buildAdShareWhatsAppUrl } from "../utils/share";
import { buildContactUrl, buildRecommendationContactUrl } from "../utils/whatsapp";
import * as AdsService from "../services/ads.service";
import * as MetricsService from "../services/metrics.service";
import * as ReportsService from "../services/reports.service";

export function AdDetail() {
  const nav = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const { activeCommunityId } = useCondominium();

  const [ad, setAd] = useState<AdResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [commentText, setCommentText] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<number | null>(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState<ReportReason | "">("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  const fetchAd = useCallback(() => {
    const adId = Number(id);
    if (!adId) return;
    AdsService.getAdById(adId)
      .then(setAd)
      .catch((err: any) => setError(err?.response?.data?.error ?? "Falha ao carregar anúncio."));
  }, [id]);

  useEffect(() => {
    const adId = Number(id);
    if (!adId) {
      setError("Anúncio inválido.");
      setLoading(false);
      return;
    }
    setLoading(true);
    AdsService.getAdById(adId)
      .then(setAd)
      .catch((err: any) => setError(err?.response?.data?.error ?? "Falha ao carregar anúncio."))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!ad?.id || ad.type !== "RECOMMENDATION") {
      setComments([]);
      return;
    }
    setLoadingComments(true);
    AdsService.getComments(ad.id, { page: 0, size: 100 })
      .then((res) => setComments(res.content))
      .catch(() => setComments([]))
      .finally(() => setLoadingComments(false));
  }, [ad?.id, ad?.type]);

  async function onContact() {
    if (!ad || !activeCommunityId) return;

    if (ad.type === "RECOMMENDATION") {
      if (!ad.recommendedContact?.trim()) {
        alert("Esta indicação não possui WhatsApp cadastrado.");
        return;
      }
      const digits = ad.recommendedContact.replace(/[^\d]/g, "");
      if (!digits) {
        alert("WhatsApp inválido.");
        return;
      }
      const url = buildRecommendationContactUrl(
        ad.recommendedContact,
        ad.serviceType ?? "serviço",
        ad.title
      );
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      if (!ad.userWhatsapp) {
        alert("Este anúncio não possui WhatsApp cadastrado.");
        return;
      }
      const digits = ad.userWhatsapp.replace(/[^\d]/g, "");
      if (!digits) {
        alert("WhatsApp inválido.");
        return;
      }
      window.open(buildContactUrl(ad.userWhatsapp, ad.title, ad.price), "_blank", "noopener,noreferrer");
    }

    try {
      await MetricsService.registerContactClick({ adId: ad.id, communityId: activeCommunityId });
    } catch {
      // ignore
    }
  }

  function onShare() {
    if (!ad) return;
    const whatsappUrl = buildAdShareWhatsAppUrl(ad);
    // Abre imediatamente (evita bloqueio de popup no Safari iOS)
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  }

  async function onSetRating(rating: number) {
    if (!ad || ad.type !== "RECOMMENDATION") return;
    try {
      await AdsService.setRating(ad.id, rating);
      fetchAd();
    } catch {
      // ignore
    }
  }

  async function onRemoveRating() {
    if (!ad || ad.type !== "RECOMMENDATION") return;
    try {
      await AdsService.removeReaction(ad.id);
      fetchAd();
    } catch {
      // ignore
    }
  }

  async function onSubmitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!ad || ad.type !== "RECOMMENDATION" || !commentText.trim()) return;
    setSubmittingComment(true);
    try {
      await AdsService.createComment(ad.id, { text: commentText.trim() });
      setCommentText("");
      const res = await AdsService.getComments(ad.id, { page: 0, size: 100 });
      setComments(res.content);
    } catch {
      // ignore
    } finally {
      setSubmittingComment(false);
    }
  }

  async function onToggleCommentLike(commentId: number) {
    if (!ad || ad.type !== "RECOMMENDATION") return;
    try {
      await AdsService.toggleCommentLike(ad.id, commentId);
      setComments((prev) =>
        prev.map((c) => {
          if (c.id !== commentId) return c;
          return {
            ...c,
            currentUserLiked: !c.currentUserLiked,
            likeCount: c.likeCount + (c.currentUserLiked ? -1 : 1),
          };
        })
      );
    } catch {
      // ignore
    }
  }

  async function onDeleteComment(commentId: number) {
    if (!ad || ad.type !== "RECOMMENDATION") return;
    if (!window.confirm("Excluir este comentário?")) return;
    setDeletingCommentId(commentId);
    try {
      await AdsService.deleteComment(ad.id, commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch {
      // ignore
    } finally {
      setDeletingCommentId(null);
    }
  }

  const WhatsAppIcon = () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );

  return (
    <div className="min-h-screen bg-bg pb-24">
      <Navbar />
      <div className="mx-auto max-w-3xl px-4 py-6">
        <div className="mb-4 flex items-center justify-between">
          <Link className="text-sm font-medium text-accent-strong hover:underline" to="/feed">
            ← Voltar
          </Link>
        </div>

        {loading ? <div className="text-sm text-muted">Carregando...</div> : null}
        {error ? <div className="text-sm text-danger">{error}</div> : null}

        {ad ? (
          <Card>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xl font-semibold">{ad.title}</div>
                <div className="mt-1 text-sm text-muted">
                  por <span className="font-medium text-text">{ad.userName}</span>
                  {ad.createdAt ? (
                    <span className="ml-2">• {formatPublishedAt(ad.createdAt)}</span>
                  ) : null}
                </div>
              </div>
              <div className="flex flex-shrink-0 flex-col items-end gap-1">
                <Badge tone={ad.type === "RECOMMENDATION" ? "accent" : "primary"}>{AdTypeLabels[ad.type]}</Badge>
                {ad.type === "RECOMMENDATION" ? (
                  <span className="text-sm text-muted">Indicação</span>
                ) : ad.type === "DONATION" ? (
                  <span className="text-sm text-muted">Doação</span>
                ) : ad.price != null ? (
                  <span className="whitespace-nowrap text-lg font-semibold text-info">
                    {formatPrice(Number(ad.price))}
                  </span>
                ) : (
                  <span className="text-sm text-muted">Valor a consultar</span>
                )}
              </div>
            </div>

            {ad.type === "RECOMMENDATION" && (ad.recommendedContact || ad.serviceType) ? (
              <div className="mt-4 rounded-xl border border-border bg-surface/50 p-3 text-sm">
                {ad.serviceType ? (
                  <div className="font-medium text-text">Tipo de serviço: {ad.serviceType}</div>
                ) : null}
                {ad.recommendedContact ? (
                  <div className="mt-1 text-muted">WhatsApp: {ad.recommendedContact}</div>
                ) : null}
              </div>
            ) : null}

            {ad.type !== "RECOMMENDATION" && ad.imageUrls?.length ? (
              <div className="mt-4 flex gap-2 overflow-x-auto rounded-xl">
                {ad.imageUrls.map((url, i) => (
                  <img
                    key={i}
                    src={resolveImageUrl(url)}
                    alt=""
                    className="max-h-48 cursor-pointer flex-shrink-0 rounded-lg object-cover transition hover:opacity-90"
                    onClick={() => setLightboxImage(resolveImageUrl(url))}
                  />
                ))}
              </div>
            ) : ad.type !== "RECOMMENDATION" ? (
              <div className="mt-4 flex justify-center">
                <AdPlaceholder />
              </div>
            ) : null}

            {ad.type === "RECOMMENDATION" ? (
              <>
                <div className="mt-4 rounded-xl border border-border bg-surface/40 p-4">
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Descrição</h3>
                  <div className="whitespace-pre-wrap text-sm text-text">
                    <TextWithLinks text={ad.description ?? "Sem descrição."} />
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-border bg-surface/40 p-4">
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                    Avaliação
                  </h3>
                  <div className="flex flex-col gap-0.5 text-sm">
                    {(ad.ratingCount ?? 0) > 0 ? (
                      <>
                        <span className="font-medium text-text">
                          {Number(ad.averageRating).toFixed(1)} de 5 ★
                        </span>
                        <span className="text-muted">
                          {ad.ratingCount} {ad.ratingCount === 1 ? "avaliação" : "avaliações"}
                        </span>
                      </>
                    ) : (
                      <span className="text-muted">Sem avaliações</span>
                    )}
                  </div>
                  <p className="mt-3 mb-2 text-xs text-muted">
                    Conhece o indicado? Dê uma nota de 1 a 5 estrelas.
                  </p>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => onSetRating(star)}
                        className="rounded p-0.5 text-muted transition hover:text-primary-strong focus:outline-none focus:ring-2 focus:ring-primary/50"
                        title={`${star} ${star === 1 ? "estrela" : "estrelas"}`}
                        aria-label={`${star} estrelas`}
                      >
                        <svg
                          width="28"
                          height="28"
                          viewBox="0 0 24 24"
                          fill={(ad.currentUserRating ?? 0) >= star ? "currentColor" : "none"}
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className={(ad.currentUserRating ?? 0) >= star ? "text-primary-strong" : ""}
                        >
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                      </button>
                    ))}
                  </div>
                  {ad.currentUserRating != null ? (
                    <button
                      type="button"
                      onClick={onRemoveRating}
                      className="mt-2 text-xs font-medium text-muted underline hover:text-text"
                    >
                      Remover minha avaliação
                    </button>
                  ) : null}
                </div>

                <div className="mt-4 rounded-xl border border-border bg-surface/40 p-4">
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">Comentários</h3>
                  <form onSubmit={onSubmitComment} className="mb-4 flex flex-col gap-2">
                    <textarea
                      className="min-h-[80px] w-full resize-y rounded-xl border border-border bg-surface px-3 py-2 text-sm shadow-soft placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
                      placeholder="Escreva um comentário..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      maxLength={500}
                      rows={2}
                    />
                    <Button
                      type="submit"
                      disabled={submittingComment || !commentText.trim()}
                      size="sm"
                      variant="accent"
                      className="w-fit self-end px-3 py-1.5 text-xs"
                    >
                      {submittingComment ? "..." : "Enviar"}
                    </Button>
                  </form>
                  {loadingComments ? (
                    <div className="text-sm text-muted">Carregando comentários...</div>
                  ) : comments.length === 0 ? (
                    <div className="text-sm text-muted">Nenhum comentário ainda.</div>
                  ) : (
                    <ul className="space-y-3">
                      {comments.map((c) => (
                        <li key={c.id} className="rounded-lg border border-border bg-surface/60 p-3 text-sm">
                          <div className="flex items-start justify-between gap-2">
                            <div className="font-medium text-text">{c.userName}</div>
                            {c.userId === user?.id ? (
                              <button
                                type="button"
                                onClick={() => onDeleteComment(c.id)}
                                disabled={deletingCommentId === c.id}
                                className="rounded p-1 text-muted transition hover:bg-danger/15 hover:text-danger disabled:opacity-50"
                                title="Excluir comentário"
                                aria-label="Excluir comentário"
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <line x1="18" y1="6" x2="6" y2="18" />
                                  <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                              </button>
                            ) : null}
                          </div>
                          <div className="mt-1 whitespace-pre-wrap text-text">{c.text}</div>
                          <div className="mt-2 flex items-center gap-3 text-xs text-muted">
                            <span>{formatPublishedAt(c.createdAt)}</span>
                            {c.userId !== user?.id ? (
                              <button
                                type="button"
                                onClick={() => onToggleCommentLike(c.id)}
                                className={
                                  "flex items-center gap-1 font-medium transition " +
                                  (c.currentUserLiked ? "text-primary-strong" : "hover:text-primary-strong")
                                }
                              >
                                {c.currentUserLiked ? "✓ " : ""}Curtir{c.likeCount > 0 ? ` (${c.likeCount})` : ""}
                              </button>
                            ) : (
                              <span>Curtir{c.likeCount > 0 ? ` (${c.likeCount})` : ""}</span>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </>
            ) : (
              <div className="mt-4 whitespace-pre-wrap text-sm text-text">
                <TextWithLinks text={ad.description ?? "Sem descrição."} />
              </div>
            )}

            <div className="mt-6 space-y-4">
              <div className="w-full min-w-0">
                <div className="flex flex-col gap-2 sm:flex-row sm:flex-nowrap sm:justify-center sm:gap-3">
                  {(ad.type === "RECOMMENDATION" && ad.recommendedContact) || (ad.type !== "RECOMMENDATION" && ad.userId !== user?.id) ? (
                    <Button
                      onClick={onContact}
                      variant="primary"
                      size="sm"
                      className="w-full min-w-0 sm:w-auto sm:shrink-0"
                    >
                      <WhatsAppIcon />
                      Entrar em contato
                    </Button>
                  ) : null}
                  <Button
                    onClick={onShare}
                    variant="accent"
                    size="sm"
                    className="w-full min-w-0 sm:w-auto sm:shrink-0 !bg-[rgba(59,130,246,0.75)] !text-white hover:!bg-[rgba(59,130,246,0.9)] active:!bg-[rgba(59,130,246,0.9)] focus:!ring-[rgb(59,130,246)]/40 dark:!bg-[rgba(59,130,246,0.5)] dark:hover:!bg-[rgba(59,130,246,0.7)] dark:active:!bg-[rgba(59,130,246,0.7)]"
                  >
                    <WhatsAppIcon />
                    Compartilhar
                  </Button>
                </div>
              </div>
              {ad.userId === user?.id && (ad.status === "ACTIVE" || ad.status === "PAUSED") ? (
                <div className="text-center">
                  <Button variant="ghost" onClick={() => nav(`/ads/${ad.id}/edit`)}>
                    Editar
                  </Button>
                </div>
              ) : null}
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4 text-sm">
                <button
                  type="button"
                  onClick={() => nav("/feed")}
                  className="font-medium text-muted hover:text-text hover:underline"
                >
                  ← Ver mais anúncios
                </button>
                {ad.userId !== user?.id && ad.status !== "REMOVED" ? (
                  <button
                    type="button"
                    onClick={() => {
                      setReportError(null);
                      setReportReason("");
                      setReportModalOpen(true);
                    }}
                    className="text-muted hover:text-danger hover:underline"
                  >
                    Denunciar anúncio
                  </button>
                ) : null}
              </div>
            </div>
          </Card>
        ) : null}
      </div>

      {reportModalOpen && ad && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="report-modal-title"
        >
          <div className="w-full max-w-md rounded-2xl border border-border bg-bg p-6 shadow-lg">
            <h2 id="report-modal-title" className="text-lg font-semibold text-text">
              Denunciar anúncio
            </h2>
            <p className="mt-2 text-sm text-muted">
              Selecione o motivo da denúncia. A moderação pode suspender ou remover o anúncio.
            </p>
            <div className="mt-4">
              <label className="block text-sm font-medium text-text">Motivo</label>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value as ReportReason | "")}
                className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
              >
                <option value="">Selecione...</option>
                {(Object.keys(ReportReasonLabels) as ReportReason[]).map((r) => (
                  <option key={r} value={r}>
                    {ReportReasonLabels[r]}
                  </option>
                ))}
              </select>
            </div>
            {reportError ? (
              <p className="mt-3 text-sm text-danger">{reportError}</p>
            ) : null}
            <div className="mt-6 flex gap-3">
              <Button
                type="button"
                variant="ghost"
                className="flex-1"
                disabled={reportSubmitting}
                onClick={() => {
                  setReportModalOpen(false);
                  setReportError(null);
                }}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="danger"
                className="flex-1"
                disabled={reportSubmitting || !reportReason}
                onClick={async () => {
                  if (!reportReason || !ad) return;
                  setReportError(null);
                  setReportSubmitting(true);
                  try {
                    await ReportsService.reportAd(ad.id, reportReason);
                    setReportModalOpen(false);
                    setReportReason("");
                  } catch (err: any) {
                    const msg = err?.response?.data?.error ?? "Não foi possível enviar a denúncia.";
                    setReportError(msg);
                  } finally {
                    setReportSubmitting(false);
                  }
                }}
              >
                {reportSubmitting ? "Enviando..." : "Enviar denúncia"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {lightboxImage && (
        <ImageLightbox imageUrl={lightboxImage} onClose={() => setLightboxImage(null)} />
      )}
      <BottomNav />
    </div>
  );
}

