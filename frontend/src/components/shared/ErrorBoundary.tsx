import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import { Button } from './Button';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <div className="w-full max-w-lg p-6 bg-white dark:bg-[#1A1A1A] border-2 border-amber-300 dark:border-amber-800/60 rounded-2xl shadow-lg space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto border border-amber-200 dark:border-amber-900/50">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-extrabold text-[#1A1A1A] dark:text-white">
                {this.props.fallbackTitle || 'Ha ocurrido un detalle en esta sección'}
              </h3>
              <p className="text-xs text-[#666666] dark:text-[#B0B0B0] leading-relaxed">
                {this.props.fallbackMessage ||
                  'No te preocupes, el resto de la plataforma sigue funcionando normalmente. Puedes reintentar o recargar la vista.'}
              </p>
            </div>

            {this.state.error && (
              <details className="text-left bg-gray-50 dark:bg-[#121212] p-3 rounded-xl border border-[#E0E0E0] dark:border-[#2D2D2D] text-[11px] font-mono text-gray-700 dark:text-gray-300">
                <summary className="cursor-pointer font-bold text-amber-600 dark:text-amber-400 select-none">
                  Ver detalle técnico
                </summary>
                <div className="mt-2 whitespace-pre-wrap overflow-x-auto max-h-36">
                  {this.state.error.toString()}
                </div>
              </details>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => (window.location.href = '/')}
                leftIcon={<Home className="w-4 h-4" />}
              >
                Ir al Inicio
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={this.handleReset}
                leftIcon={<RotateCcw className="w-4 h-4" />}
              >
                Reintentar
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
