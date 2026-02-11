import { postJson } from "@/services/apiClient";

export type ProvisionColumn = {
  name: string;
  type: "text" | "number" | "checkbox" | "date" | "select";
};

export type CreateTableRequest = {
  tableName: string;
  columns: ProvisionColumn[];
};

export type DropTableRequest = {
  tableName: string;
};

export async function createDbTable(req: CreateTableRequest): Promise<{ ok: true; tableName: string }> {
  return await postJson("/api/db/table/create", req);
}

export async function dropDbTable(req: DropTableRequest): Promise<{ ok: true; tableName: string }> {
  return await postJson("/api/db/table/drop", req);
}

export async function installAutomations(): Promise<{ ok: true }> {
  return await postJson("/api/db/automations/install", {});
}

export type AutomationRule = {
  tableName: string;
  whenColumn: string;
  whenEquals: string;
  thenSetColumn: string;
  thenSetValue: string;
};

export async function createAutomationRule(rule: AutomationRule): Promise<{ ok: true; id: string }> {
  return await postJson("/api/db/automations/rules/create", rule);
}

/**
 * Installs the real Postgres triggers for the given table.
 */
export async function syncAutomationRules(tableName: string): Promise<{ ok: true; trigger: string }> {
  return await postJson("/api/db/automations/rules/sync", { tableName });
}

export async function triggerAutomationJob(tableName: string, rowId: string): Promise<{ ok: true }> {
  return await postJson("/api/db/automations/trigger", { tableName, rowId });
}

// -----------------------------
// Database schema + row sync (Database block)
// -----------------------------

export type EnsureColumnsRequest = {
  tableName: string;
  columns: ProvisionColumn[];
};

export async function ensureDbColumns(req: EnsureColumnsRequest): Promise<{ ok: true; tableName: string }> {
  return await postJson("/api/db/table/ensure-columns", req);
}

export type CreateRowRequest = {
  tableName: string;
  rowId: string;
};

export async function createDbRow(req: CreateRowRequest): Promise<{ ok: true; tableName: string; rowId: string }> {
  return await postJson("/api/db/rows/create", req);
}

export type UpsertRowRequest = {
  tableName: string;
  rowId: string;
  data: Record<string, unknown>;
};

export async function upsertDbRow(req: UpsertRowRequest): Promise<{ ok: true; tableName: string; rowId: string }> {
  return await postJson("/api/db/rows/upsert", req);
}

export type DeleteRowRequest = {
  tableName: string;
  rowId: string;
};

export async function deleteDbRow(req: DeleteRowRequest): Promise<{ ok: true; tableName: string; rowId: string }> {
  return await postJson("/api/db/rows/delete", req);
}
