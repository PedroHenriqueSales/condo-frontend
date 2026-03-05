import { api } from "./api";
import type {
  NotificationSummary,
  NotificationResponse,
  Page,
} from "./contracts";

export async function getNotificationSummary(): Promise<NotificationSummary> {
  const { data } = await api.get<NotificationSummary>("/notifications/summary");
  return data;
}

export interface ListNotificationsParams {
  unreadOnly?: boolean;
  page?: number;
  size?: number;
}

export async function listNotifications(
  params: ListNotificationsParams = {},
): Promise<Page<NotificationResponse>> {
  const { unreadOnly = false, page = 0, size = 20 } = params;
  const { data } = await api.get<Page<NotificationResponse>>("/notifications", {
    params: { unreadOnly, page, size },
  });
  return data;
}

export async function markAsRead(id: number): Promise<void> {
  await api.post(`/notifications/${id}/read`);
}

export async function markAllAsRead(): Promise<void> {
  await api.post("/notifications/read-all");
}

export async function markAdsAsViewed(
  communityId?: number,
): Promise<void> {
  await api.post("/notifications/ads/mark-viewed", undefined, {
    params: communityId ? { communityId } : undefined,
  });
}

