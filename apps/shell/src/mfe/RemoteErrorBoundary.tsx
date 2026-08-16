import { Component, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import styles from "./RemoteErrorBoundary.module.css";

interface RemoteErrorBoundaryProps {
  fallbackMessage: string;
  children: ReactNode;
}

interface RemoteErrorBoundaryState {
  hasError: boolean;
  retryKey: number;
}

export class RemoteErrorBoundary extends Component<
  RemoteErrorBoundaryProps,
  RemoteErrorBoundaryState
> {
  constructor(props: RemoteErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, retryKey: 0 };
  }

  static getDerivedStateFromError(): Pick<RemoteErrorBoundaryState, "hasError"> {
    return { hasError: true };
  }

  private handleRetry = () => {
    this.setState((state) => ({
      hasError: false,
      retryKey: state.retryKey + 1,
    }));
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.container} role="alert">
          <AlertTriangle size={28} className={styles.icon} aria-hidden="true" />
          <p className={styles.message}>{this.props.fallbackMessage}</p>
          <button
            type="button"
            className={styles.retryButton}
            onClick={this.handleRetry}
          >
            <RefreshCw size={16} aria-hidden="true" />
            Retry
          </button>
        </div>
      );
    }

    return (
      <div key={this.state.retryKey} className={styles.host}>
        {this.props.children}
      </div>
    );
  }
}
