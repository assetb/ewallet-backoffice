import { randomUUID } from "crypto";
import dayjs from "dayjs";

export function generateId(): string {
  return randomUUID();
}

export function getCurrentISODate(): string {
  return dayjs().toISOString();
}
