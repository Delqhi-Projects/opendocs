export function toPgIdentSafe(input: string): string {
  // Convert arbitrary ids (nanoid/uuid) to a Postgres identifier-safe fragment.
  // Keep it deterministic and stable.
  return input
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+/, "")
    .replace(/_+$/, "")
    .slice(0, 40);
}

export function buildDatabaseTableName(pageId: string, blockId: string): string {
  const p = toPgIdentSafe(pageId) || "page";
  const b = toPgIdentSafe(blockId) || "block";
  // Postgres identifier limit is 63 bytes; keep headroom.
  const name = `opendocs_db_${p}_${b}`.slice(0, 60);
  // Ensure it starts with a letter/underscore.
  return /^[a-z_]/.test(name) ? name : `opendocs_${name}`;
}
