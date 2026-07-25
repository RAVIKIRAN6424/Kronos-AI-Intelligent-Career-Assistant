import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[Kronos Error Boundary Captured Exception]:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleResetStorage = () => {
    localStorage.clear();
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#060a12',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          fontFamily: 'Inter, system-ui, sans-serif'
        }}>
          <div style={{
            maxWidth: '650px',
            width: '100%',
            background: 'rgba(13, 22, 38, 0.9)',
            border: '2px solid rgba(239, 68, 68, 0.4)',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 0 30px rgba(239, 68, 68, 0.2)',
            textAlign: 'center'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <AlertTriangle size={32} color="#f87171" />
            </div>

            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#ffffff', marginBottom: '8px' }}>
              Kronos AI Diagnostic Recovery System
            </h2>

            <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '20px' }}>
              A UI rendering exception occurred, but Kronos AI caught it safely to prevent a blank screen.
            </p>

            <div style={{
              background: 'rgba(2, 6, 15, 0.8)',
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.1)',
              textAlign: 'left',
              fontFamily: 'monospace',
              fontSize: '12px',
              color: '#f87171',
              overflowX: 'auto',
              marginBottom: '24px',
              maxHeight: '150px'
            }}>
              {this.state.error && this.state.error.toString()}
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={this.handleReload}
                style={{
                  background: 'linear-gradient(135deg, #00f2fe, #4facfe)',
                  color: '#060a12',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <RefreshCw size={16} /> Reload Application
              </button>

              <button
                onClick={this.handleResetStorage}
                style={{
                  background: 'rgba(239, 68, 68, 0.2)',
                  color: '#f87171',
                  border: '1px solid #f87171',
                  padding: '12px 24px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Reset Storage Cache & Reload
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
