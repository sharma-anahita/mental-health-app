import { Component, type ErrorInfo, type ReactNode } from 'react';

/**
 * Global Error Boundary
 * 
 * Catches React render errors anywhere in the component tree.
 * Shows a calm, non-technical fallback UI with recovery options.
 * 
 * Usage: Wrap the entire app once at root level.
 */

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorId: string | null;
}

class GlobalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorId: null };
  }

  static getDerivedStateFromError(_error: Error): State {
    // Generate a simple error ID for reference (without exposing details)
    const errorId = `ERR-${Date.now().toString(36).toUpperCase()}`;
    return { hasError: true, errorId };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log once for debugging — avoid excessive logging
    if (import.meta.env.DEV) {
      console.error('[GlobalErrorBoundary] Caught error:', error.message);
      console.error('[GlobalErrorBoundary] Component stack:', errorInfo.componentStack);
    }
    // In production, you could send to an error reporting service here
  }

  handleReload = (): void => {
    window.location.reload();
  };

  handleGoHome = (): void => {
    window.location.href = '/';
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 via-purple-50 to-blue-50 px-4">
          <div className="max-w-md w-full text-center">
            {/* Calm illustration/icon */}
            <div className="mb-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-indigo-100 flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-indigo-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
            </div>

            {/* Friendly message */}
            <h1 className="text-2xl font-semibold text-slate-800 mb-2">
              Something went wrong
            </h1>
            <p className="text-slate-600 mb-6">
              We hit an unexpected bump. Don't worry — your data is safe.
              <br />
              Try reloading the app to continue.
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReload}
                className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                Reload App
              </button>
              <button
                onClick={this.handleGoHome}
                className="px-6 py-2.5 bg-white text-slate-700 font-medium rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200"
              >
                Go to Home
              </button>
            </div>

            {/* Reference ID (subtle, for support) */}
            {this.state.errorId && (
              <p className="mt-8 text-xs text-slate-400">
                Reference: {this.state.errorId}
              </p>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;
