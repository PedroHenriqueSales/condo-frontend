import { api } from "./api";
import type { ReportReason } from "./contracts";

export async function reportAd(adId: number, reason: ReportReason): Promise<void> {
  await api.post("/reports", { adId, reason });
}
