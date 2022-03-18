import ajax from "../utils/ajax";

export function selectAccountingEntries(data: any) {
  return ajax.get("/accountingEntries", data);
}

export function exportAccountingEntries(data: any) {
  ajax.download("/accountingEntries/export", data);
}