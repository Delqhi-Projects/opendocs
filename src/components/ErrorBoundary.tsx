import { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCcw, DatabaseZap } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * OpenDocs Critical Recovery Boundary
 * Best Practices Feb 2026: Visual debugging and recovery for runtime crashes.
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("CRITICAL UI CRASH:", error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.clear();
      window.location.reload();
    } catch (e) {
      console.error("Failed to clear storage:", e);
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen w-screen flex-col items-center justify-center bg-zinc-950 p-6 font-sans text-zinc-50 antialiased">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-red-500/10 text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
            <AlertTriangle size={48} />
          </div>
          
          <h1 className="mb-2 text-2xl font-bold tracking-tight">OpenDocs Recovery Mode</h1>
          <p className="mb-8 max-w-md text-center text-zinc-400">
            The application encountered a critical runtime error. This is often caused by environment mismatches or corrupted local state.
          </p>
          
          <div className="mb-8 w-full max-w-2xl overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/50 px-4 py-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Error Stack Trace</span>
              <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            </div>
            <div className="max-h-[300px] overflow-auto p-4 font-mono text-[11px] leading-relaxed text-red-400">
              <p className="mb-2 font-bold">{this.state.error?.name}: {this.state.error?.message}</p>
              <pre className="opacity-70">{this.state.error?.stack}</pre>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 rounded-lg bg-zinc-50 px-6 py-2.5 text-sm font-bold text-zinc-950 transition-all hover:bg-white active:scale-95 shadow-lg"
            >
              <RefreshCcw size={16} /> Try Reload
            </button>
            <button
              onClick={this.handleReset}
              className="flex items-center gap-2 rounded-lg border border-red-900/50 bg-red-950/20 px-6 py-2.5 text-sm font-bold text-red-500 transition-all hover:bg-red-950/40 active:scale-95"
            >
              <DatabaseZap size={16} /> Force Reset Data
            </button>
          </div>
          
          <div className="mt-12 text-[10px] uppercase tracking-widest text-zinc-600 font-bold">
            Best Practices Feb 2026 Resilience Model
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
