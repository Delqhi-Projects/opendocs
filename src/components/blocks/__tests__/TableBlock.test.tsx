import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { TableBlock } from "../TableBlock";

describe("TableBlock", () => {
  const mockColumns = [
    { key: "id", header: "ID", sortable: true },
    { key: "name", header: "Name", sortable: true, filterable: true },
    { key: "email", header: "Email" },
  ];

  const mockData = [
    { id: 1, name: "Alice", email: "alice@example.com" },
    { id: 2, name: "Bob", email: "bob@example.com" },
    { id: 3, name: "Charlie", email: "charlie@example.com" },
  ];

  it("renders table with data", () => {
    render(<TableBlock columns={mockColumns} data={mockData} />);

    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(screen.getByText("Charlie")).toBeInTheDocument();
  });

  it("sorts data when column header clicked", () => {
    render(<TableBlock columns={mockColumns} data={mockData} />);

    const nameHeader = screen.getByText("Name");
    fireEvent.click(nameHeader);

    expect(screen.getByText("[AUF]")).toBeInTheDocument();
  });

  it("filters data based on search input", () => {
    render(<TableBlock columns={mockColumns} data={mockData} />);

    const searchInput = screen.getByPlaceholderText("Suchen...");
    fireEvent.change(searchInput, { target: { value: "Alice" } });

    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.queryByText("Bob")).not.toBeInTheDocument();
  });

  it("paginates data correctly", () => {
    render(
      <TableBlock
        columns={mockColumns}
        data={mockData}
        options={{ pageSize: 2 }}
      />,
    );

    expect(screen.getByText("Seite 1 von 2")).toBeInTheDocument();
  });

  it("calls onRowClick when row is clicked", () => {
    const handleRowClick = vi.fn();
    render(
      <TableBlock
        columns={mockColumns}
        data={mockData}
        onRowClick={handleRowClick}
      />,
    );

    const row = screen.getByText("Alice").closest("tr");
    fireEvent.click(row!);

    expect(handleRowClick).toHaveBeenCalledWith(mockData[0]);
  });

  it("handles cell editing when editable is true", () => {
    const handleDataChange = vi.fn();
    render(
      <TableBlock
        columns={mockColumns}
        data={mockData}
        options={{ editable: true }}
        onDataChange={handleDataChange}
      />,
    );

    const cell = screen.getByText("Alice");
    fireEvent.click(cell);

    const input = screen.getByDisplayValue("Alice");
    fireEvent.change(input, { target: { value: "Alicia" } });
    fireEvent.blur(input);

    expect(handleDataChange).toHaveBeenCalled();
  });
});
