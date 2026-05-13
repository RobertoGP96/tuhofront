import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error('[ErrorBoundary] Uncaught error:', error, info);
    }
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  handleHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    if (this.props.fallback) {
      return this.props.fallback;
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <img
            src="/img/logo/svg/IdUHo-01.svg"
            alt="Universidad de Holguín"
            className="mx-auto h-16"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-primary-navy">
              Algo salió mal
            </h1>
            <p className="text-sm text-gray-500">
              Ocurrió un error inesperado en la aplicación. Puedes intentar recargar la página o volver al inicio.
            </p>
          </div>
          {import.meta.env.DEV && this.state.error && (
            <pre className="text-xs text-left bg-red-50 border border-red-100 rounded p-3 overflow-auto max-h-40 text-red-700">
              {this.state.error.message}
            </pre>
          )}
          <div className="flex gap-2 justify-center">
            <button
              onClick={this.handleReload}
              className="px-4 py-2 bg-primary-navy text-white font-medium rounded-md hover:opacity-90 transition-opacity"
            >
              Recargar
            </button>
            <button
              onClick={this.handleHome}
              className="px-4 py-2 border border-gray-200 text-gray-700 font-medium rounded-md hover:bg-gray-100 transition-colors"
            >
              Ir al inicio
            </button>
          </div>
        </div>
      </div>
    );
  }
}
