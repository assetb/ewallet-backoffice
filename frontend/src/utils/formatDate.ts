import dayjs from "dayjs";

export function formatDate(isoString: string): string {
  return dayjs(isoString).format("YYYY-MM-DD HH:mm:ss");
}
