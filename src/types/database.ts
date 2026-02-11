export type DbPropertyType = "text" | "number" | "select" | "date" | "checkbox";

export type DbSelectOption = {
  id: string;
  name: string;
  color?: "zinc" | "red" | "orange" | "yellow" | "green" | "blue" | "indigo" | "violet";
};

export type DbProperty =
  | { id: string; name: string; type: "text"; dbColumnName: string }
  | { id: string; name: string; type: "number"; dbColumnName: string }
  | { id: string; name: string; type: "date"; dbColumnName: string }
  | { id: string; name: string; type: "checkbox"; dbColumnName: string }
  | { id: string; name: string; type: "select"; dbColumnName: string; options: DbSelectOption[] };

export type DbCellValue = string | number | boolean | null;

export type DbRow = {
  id: string;
  cells: Record<string, DbCellValue>;
  /** Visual metadata for Graph/Workflow views */
  x_pos?: number;
  y_pos?: number;
  color?: string;
};

export type DbView =
  | { id: string; name: string; type: "table" }
  | { id: string; name: string; type: "kanban"; groupByPropertyId: string }
  | { id: string; name: string; type: "graph" }
  | { id: string; name: string; type: "calendar"; datePropertyId?: string }
  | { id: string; name: string; type: "timeline"; datePropertyId?: string }
  | { id: string; name: string; type: "gallery" };

export type DatabaseRemote = {
  /** If set, this database is backed by a real Postgres table (Supabase). */
  tableName?: string;
  /** Provisioning lifecycle */
  provisioning?: "idle" | "creating" | "ready" | "error";
  /** Human-friendly error message */
  lastError?: string;
  /** Optional realtime sync mode */
  sync?: "off" | "realtime";
};

export type DatabaseBlockData = {
  title: string;
  properties: DbProperty[];
  rows: DbRow[];
  views: DbView[];
  activeViewId: string;
  remote?: DatabaseRemote;
};
