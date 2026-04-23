export function generateShortUrl(name: string, id: number, originalUrl: string): string {
  const namePart = name.replace(/[^a-zA-Z0-9]/g, "").substring(0, 4).toLowerCase();
  const urlHash = originalUrl.split("").reduce((acc, char) => {
    return ((acc * 31 + char.charCodeAt(0)) >>> 0);
  }, 1).toString(16).substring(0, 8);

  return namePart + id + urlHash;
}
