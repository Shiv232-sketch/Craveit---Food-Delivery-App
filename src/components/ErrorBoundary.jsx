import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('CraveIt Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#fafafa',
          fontFamily: "'Inter', sans-serif",
          padding: '2rem',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>😵</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1a1a2e', marginBottom: '0.5rem' }}>
            Something went wrong
          </h1>
          <p style={{ color: '#6b7280', maxWidth: 400, marginBottom: '1.5rem' }}>
            An unexpected error occurred. Please refresh the page to try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: '#E8401C',
              color: 'white',
              border: 'none',
              padding: '0.75rem 2rem',
              borderRadius: 12,
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: 'pointer',
            }}
          >
            🔄 Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
