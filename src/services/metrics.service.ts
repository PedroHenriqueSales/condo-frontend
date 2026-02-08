import { api } from "./api";
import type { ContactClickRequest, EventLogRequest } from "./contracts";

export async function registerContactClick(payload: ContactClickRequest): Promise<void> {
  await api.post("/contact/click", payload);
}

export async function registerEvent(payload: EventLogRequest): Promise<void> {
  await api.post("/events", payload);
}

