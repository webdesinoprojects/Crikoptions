import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center p-4 min-h-[100px] bg-bear-red/5 border border-bear-red/20 rounded-lg overflow-hidden">
          <AlertTriangle className="w-6 h-6 text-bear-red mb-2 opacity-80" />
          <h2 className="text-sm font-black text-bear-red mb-1 text-center">Something went wrong</h2>
          <p className="text-[10px] text-on-surface-variant text-center max-w-[200px] truncate mb-3">
            {this.state.error?.message || "An unexpected error occurred"}
          </p>
          <button
            type="button"
            onClick={this.handleReset}
            className="px-3 py-1 bg-bear-red/10 hover:bg-bear-red/20 text-bear-red text-[10px] font-black uppercase tracking-wider rounded transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
