import { Component, type ErrorInfo, type ReactNode } from 'react';
import { RefreshCw, ShieldAlert } from 'lucide-react';
import { clearTrainingState } from '../../utils/storage';

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = {
    hasError: false,
    errorMessage: '',
  };

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error.message || 'An unexpected mission control error occurred.',
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('ANANTRA ErrorBoundary caught an error:', error, info);
  }

  private handleReload = () => {
    window.location.assign('/');
  };

  private handleResetAndReload = () => {
    clearTrainingState();
    window.location.assign('/dashboard');
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-space-void p-6 text-slate-100">
          <div
            role="alert"
            className="w-full max-w-lg rounded-2xl border border-rose-400/40 bg-space-navy p-6 sm:p-8 shadow-2xl"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-rose-400/30 bg-rose-500/15 text-rose-300">
              <ShieldAlert className="h-6 w-6" aria-hidden="true" />
            </div>
            <h1 className="font-display text-xl font-bold text-slate-50">
              Mission Telemetry Interrupted
            </h1>
            <p className="mt-2 text-sm text-slate-300">
              {this.state.errorMessage}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={this.handleReload}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-sky-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-sky-300 cursor-pointer"
              >
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                Return to Base
              </button>
              <button
                type="button"
                onClick={this.handleResetAndReload}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-space-border bg-space-slate px-4 py-2 text-sm font-medium text-slate-200 hover:bg-space-hover cursor-pointer"
              >
                Reset Local Progress
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
