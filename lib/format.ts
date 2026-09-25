const dateFormatter = new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" });

// SQLite `datetime('now')` yields "YYYY-MM-DD HH:MM:SS" in UTC without a zone marker.
export function toIsoDate(sqliteDate: string): string {
  return sqliteDate.includes("T") ? sqliteDate : `${sqliteDate.replace(" ", "T")}Z`;
}

export function formatDate(sqliteDate: string): string {
  return dateFormatter.format(new Date(toIsoDate(sqliteDate)));
}
