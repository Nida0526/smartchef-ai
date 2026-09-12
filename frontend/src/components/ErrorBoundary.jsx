import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="auth-wrapper">
          <div className="glass-panel auth-box" style={{ textAlign: 'center' }}>
            <h2>Something went wrong</h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>
              An unexpected error occurred. Please reload the page to continue.
            </p>
            <button
              className="btn-primary"
              style={{ marginTop: '1.5rem' }}
              onClick={() => window.location.reload()}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}