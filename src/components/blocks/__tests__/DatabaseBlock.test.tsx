import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { DatabaseBlock } from "../DatabaseBlock";

describe("DatabaseBlock", () => {
  it("renders connection form", () => {
    render(<DatabaseBlock />);

    expect(screen.getByLabelText("Verbindungsname")).toBeInTheDocument();
    expect(screen.getByLabelText("Datenbanktyp")).toBeInTheDocument();
    expect(screen.getByLabelText("Host")).toBeInTheDocument();
  });

  it("updates port when database type changes", () => {
    render(<DatabaseBlock />);

    const typeSelect = screen.getByLabelText("Datenbanktyp");
    fireEvent.change(typeSelect, { target: { value: "mysql" } });

    const portInput = screen.getByLabelText("Port") as HTMLInputElement;
    expect(portInput.value).toBe("3306");
  });

  it("calls onConnect when connect button clicked", async () => {
    const handleConnect = vi.fn().mockResolvedValue(undefined);
    render(<DatabaseBlock onConnect={handleConnect} />);

    fireEvent.change(screen.getByLabelText("Verbindungsname"), {
      target: { value: "Test DB" },
    });
    fireEvent.change(screen.getByLabelText("Host"), {
      target: { value: "localhost" },
    });
    fireEvent.change(screen.getByLabelText("Datenbank"), {
      target: { value: "testdb" },
    });

    const connectButton = screen.getByText("[VERBINDEN]");
    fireEvent.click(connectButton);

    await waitFor(() => {
      expect(handleConnect).toHaveBeenCalled();
    });
  });

  it("toggles password visibility", () => {
    render(<DatabaseBlock />);

    const passwordInput = screen.getByLabelText("Passwort");
    expect(passwordInput).toHaveAttribute("type", "password");

    const toggleButton = screen.getByText("[ZEIGEN]");
    fireEvent.click(toggleButton);

    expect(screen.getByText("[VERSTECKEN]")).toBeInTheDocument();
  });

  it("switches between connect and saved tabs", () => {
    render(<DatabaseBlock savedConnections={[]} />);

    const savedTab = screen.getByText("Gespeichert (0)");
    fireEvent.click(savedTab);

    expect(
      screen.getByText("Keine gespeicherten Verbindungen"),
    ).toBeInTheDocument();
  });
});
