import ajax from "../utils/ajax";

export function selectAccountingEntries(data: any) {
  return ajax.get("/accountingEntries", data);
}