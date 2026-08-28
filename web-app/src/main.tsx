import { StrictMode, Component, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('[CoinBurst ErrorBoundary] Caught fatal runtime error:', error, errorInfo);
  }

  handleReset = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        for (const reg of regs) {
          await reg.unregister();
        }
      }
      if ('caches' in window) {
        const names = await caches.keys();
        await Promise.all(names.map(name => caches.delete(name)));
      }
      localStorage.removeItem('coinburst_installed_ver');
      localStorage.removeItem('coinburst_installed_build_time');
      sessionStorage.clear();
    } catch {}

    const baseUrl = (window.location.origin && window.location.origin !== 'null') 
      ? (window.location.origin + window.location.pathname) 
      : window.location.pathname;
    window.location.href = baseUrl + '?reset=' + Date.now();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#07050F',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          fontFamily: 'sans-serif',
          textAlign: 'center'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #00FF88, #00E5FF, #FF007F)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px',
            boxShadow: '0 0 30px rgba(0,255,136,0.3)'
          }}>
            <span style={{ fontSize: '28px', fontWeight: 900 }}>CB</span>
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>
            Restoring CoinBurst App
          </h2>
          <p style={{ fontSize: '13px', color: '#9CA3AF', maxWidth: '360px', marginBottom: '24px', lineHeight: 1.5 }}>
            A temporary cache conflict occurred during app update. Tap below to clear app cache and restore instantly.
          </p>
          <button
            onClick={this.handleReset}
            style={{
              padding: '12px 28px',
              borderRadius: '14px',
              background: 'linear-gradient(90deg, #00FF88, #00E5FF)',
              color: '#07050F',
              fontWeight: 800,
              fontSize: '13px',
              border: 'none',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              boxShadow: '0 4px 20px rgba(0,255,136,0.4)'
            }}
          >
            Clear Cache & Restore Now
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)

