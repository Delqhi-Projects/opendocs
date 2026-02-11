import React, { useState, useMemo, useCallback } from "react";

export interface TableColumn {
  key: string;
  header: string;
  width?: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: unknown, row: Record<string, unknown>) => React.ReactNode;
}

export interface TableOptions {
  title?: string;
  editable?: boolean;
  searchable?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
}

interface TableBlockProps {
  columns: TableColumn[];
  data: Record<string, unknown>[];
  options?: TableOptions;
  onRowClick?: (row: Record<string, unknown>) => void;
  onDataChange?: (data: Record<string, unknown>[]) => void;
}

type SortDirection = "asc" | "desc" | null;

export const TableBlock: React.FC<TableBlockProps> = ({
  columns,
  data,
  options = {},
  onRowClick,
  onDataChange,
}) => {
  const {
    title = "Datentabelle",
    searchable = true,
    pageSize = 10,
    pageSizeOptions = [5, 10, 25, 50, 100],
  } = options;

  const [searchQuery, setSearchQuery] = useState("");
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(pageSize);
  const [editingCell, setEditingCell] = useState<{
    row: number;
    col: string;
  } | null>(null);
  const [editValue, setEditValue] = useState("");

  const handleSort = useCallback(
    (columnKey: string) => {
      if (sortColumn === columnKey) {
        setSortDirection((prev) => {
          if (prev === "asc") return "desc";
          if (prev === "desc") return null;
          return "asc";
        });
        if (sortDirection === "desc") {
          setSortColumn(null);
        }
      } else {
        setSortColumn(columnKey);
        setSortDirection("asc");
      }
      setCurrentPage(1);
    },
    [sortColumn, sortDirection],
  );

  const handleFilterChange = useCallback((columnKey: string, value: string) => {
    setFilters((prev) => ({ ...prev, [columnKey]: value }));
    setCurrentPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setSearchQuery("");
    setSortColumn(null);
    setSortDirection(null);
    setCurrentPage(1);
  }, []);

  const filteredAndSortedData = useMemo(() => {
    let result = [...data];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((row) =>
        columns.some((col) => {
          const value = String(row[col.key] ?? "").toLowerCase();
          return value.includes(query);
        }),
      );
    }

    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        result = result.filter((row) => {
          const cellValue = String(row[key] ?? "").toLowerCase();
          return cellValue.includes(value.toLowerCase());
        });
      }
    });

    if (sortColumn && sortDirection) {
      result.sort((a, b) => {
        const aVal = a[sortColumn];
        const bVal = b[sortColumn];

        if (aVal === null || aVal === undefined)
          return sortDirection === "asc" ? -1 : 1;
        if (bVal === null || bVal === undefined)
          return sortDirection === "asc" ? 1 : -1;

        if (typeof aVal === "number" && typeof bVal === "number") {
          return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
        }

        const aStr = String(aVal).toLowerCase();
        const bStr = String(bVal).toLowerCase();

        if (aStr < bStr) return sortDirection === "asc" ? -1 : 1;
        if (aStr > bStr) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, searchQuery, filters, sortColumn, sortDirection, columns]);

  const totalPages = Math.ceil(filteredAndSortedData.length / rowsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredAndSortedData.slice(start, start + rowsPerPage);
  }, [filteredAndSortedData, currentPage, rowsPerPage]);

  const handleCellEdit = (rowIndex: number, colKey: string, value: unknown) => {
    setEditingCell({ row: rowIndex, col: colKey });
    setEditValue(String(value ?? ""));
  };

  const handleCellSave = () => {
    if (editingCell && onDataChange) {
      const newData = [...data];
      const rowIndex = (currentPage - 1) * rowsPerPage + editingCell.row;
      newData[rowIndex] = {
        ...newData[rowIndex],
        [editingCell.col]: editValue,
      };
      onDataChange(newData);
    }
    setEditingCell(null);
    setEditValue("");
  };

  const hasActiveFilters =
    searchQuery || Object.values(filters).some((v) => v) || sortColumn;

  return (
    <div
      className="table-block"
      style={{
        background: "#0a0a0a",
        border: "1px solid #1a1a1a",
        borderRadius: 0,
        padding: "20px",
        fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {title && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
            borderBottom: "1px solid #1a1a1a",
            paddingBottom: "15px",
          }}
        >
          <h3
            style={{
              margin: 0,
              color: "#00ff9d",
              fontSize: "16px",
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}
          >
            {title}
          </h3>
          <span style={{ color: "#666", fontSize: "12px" }}>
            {filteredAndSortedData.length} Einträge
          </span>
        </div>
      )}

      {searchable && (
        <div style={{ marginBottom: "15px", display: "flex", gap: "10px" }}>
          <input
            type="text"
            placeholder="Suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              padding: "10px 15px",
              background: "#0f0f0f",
              border: "1px solid #1a1a1a",
              color: "#e0e0e0",
              borderRadius: 0,
              fontSize: "14px",
              outline: "none",
            }}
          />
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              onKeyDown={(e) => e.key === "Enter" && clearFilters()}
              style={{
                padding: "10px 20px",
                background: "#1a1a1a",
                border: "1px solid #333",
                color: "#00ff9d",
                cursor: "pointer",
                borderRadius: 0,
                fontSize: "14px",
              }}
            >
              Filter löschen
            </button>
          )}
        </div>
      )}

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{
                    padding: "12px 15px",
                    textAlign: "left",
                    borderBottom: "2px solid #1a1a1a",
                    color: "#00ff9d",
                    fontSize: "12px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    width: col.width,
                    cursor: col.sortable ? "pointer" : "default",
                    userSelect: "none",
                  }}
                  onClick={() => col.sortable && handleSort(col.key)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && col.sortable && handleSort(col.key)
                  }
                  tabIndex={col.sortable ? 0 : -1}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    {col.header}
                    {col.sortable && sortColumn === col.key && (
                      <span style={{ color: "#00ff9d" }}>
                        {sortDirection === "asc" ? " [AUF]" : " [AB]"}
                      </span>
                    )}
                  </div>
                  {col.filterable && (
                    <input
                      type="text"
                      placeholder={`Filter ${col.header}...`}
                      value={filters[col.key] || ""}
                      onChange={(e) =>
                        handleFilterChange(col.key, e.target.value)
                      }
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                      style={{
                        marginTop: "8px",
                        width: "100%",
                        padding: "6px 10px",
                        background: "#0f0f0f",
                        border: "1px solid #1a1a1a",
                        color: "#e0e0e0",
                        fontSize: "12px",
                        borderRadius: 0,
                        outline: "none",
                      }}
                    />
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  style={{
                    padding: "40px",
                    textAlign: "center",
                    color: "#666",
                    fontSize: "14px",
                  }}
                >
                  Keine Daten gefunden
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIndex) => (
                <tr
                  key={`row-${rowIndex}-${JSON.stringify(row).slice(0, 20)}`}
                  onClick={() => onRowClick?.(row)}
                  onKeyDown={(e) => e.key === "Enter" && onRowClick?.(row)}
                  style={{
                    cursor: onRowClick ? "pointer" : "default",
                    transition: "background 0.2s",
                  }}
                  tabIndex={onRowClick ? 0 : -1}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#0f0f0f";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  {columns.map((col) => {
                    const isEditing =
                      editingCell?.row === rowIndex &&
                      editingCell?.col === col.key;
                    const value = row[col.key];

                    return (
                      <td
                        key={`cell-${rowIndex}-${col.key}`}
                        style={{
                          padding: "12px 15px",
                          borderBottom: "1px solid #1a1a1a",
                          color: "#e0e0e0",
                          fontSize: "14px",
                        }}
                        onClick={() =>
                          options.editable &&
                          handleCellEdit(rowIndex, col.key, value)
                        }
                        onKeyDown={(e) =>
                          e.key === "Enter" &&
                          options.editable &&
                          handleCellEdit(rowIndex, col.key, value)
                        }
                        tabIndex={options.editable ? 0 : -1}
                      >
                        {isEditing ? (
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={handleCellSave}
                            onKeyDown={(e) =>
                              e.key === "Enter" && handleCellSave()
                            }
                            style={{
                              width: "100%",
                              padding: "6px 10px",
                              background: "#0f0f0f",
                              border: "1px solid #00ff9d",
                              color: "#e0e0e0",
                              fontSize: "14px",
                              borderRadius: 0,
                              outline: "none",
                            }}
                          />
                        ) : col.render ? (
                          col.render(value, row)
                        ) : (
                          String(value ?? "-")
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "20px",
            paddingTop: "15px",
            borderTop: "1px solid #1a1a1a",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ color: "#666", fontSize: "12px" }}>
              Zeilen pro Seite:
            </span>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              style={{
                padding: "6px 10px",
                background: "#0f0f0f",
                border: "1px solid #1a1a1a",
                color: "#e0e0e0",
                fontSize: "12px",
                borderRadius: 0,
                cursor: "pointer",
              }}
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              type="button"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              style={{
                padding: "8px 12px",
                background: currentPage === 1 ? "#0f0f0f" : "#1a1a1a",
                border: "1px solid #333",
                color: currentPage === 1 ? "#666" : "#e0e0e0",
                cursor: currentPage === 1 ? "not-allowed" : "pointer",
                borderRadius: 0,
                fontSize: "12px",
              }}
            >
              |&lt;
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              style={{
                padding: "8px 12px",
                background: currentPage === 1 ? "#0f0f0f" : "#1a1a1a",
                border: "1px solid #333",
                color: currentPage === 1 ? "#666" : "#e0e0e0",
                cursor: currentPage === 1 ? "not-allowed" : "pointer",
                borderRadius: 0,
                fontSize: "12px",
              }}
            >
              &lt;
            </button>

            <span
              style={{ color: "#e0e0e0", fontSize: "14px", padding: "0 15px" }}
            >
              Seite {currentPage} von {totalPages}
            </span>

            <button
              type="button"
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage === totalPages}
              style={{
                padding: "8px 12px",
                background: currentPage === totalPages ? "#0f0f0f" : "#1a1a1a",
                border: "1px solid #333",
                color: currentPage === totalPages ? "#666" : "#e0e0e0",
                cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                borderRadius: 0,
                fontSize: "12px",
              }}
            >
              &gt;
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              style={{
                padding: "8px 12px",
                background: currentPage === totalPages ? "#0f0f0f" : "#1a1a1a",
                border: "1px solid #333",
                color: currentPage === totalPages ? "#666" : "#e0e0e0",
                cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                borderRadius: 0,
                fontSize: "12px",
              }}
            >
              &gt;|
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableBlock;
