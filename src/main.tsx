import { Component, StrictMode } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    // Auto-reload on dynamic import failure if online to fetch a potentially new hash
    if (error.message.includes('Failed to fetch dynamically imported module')) {
      if (navigator.onLine) {
        const reloadCount = parseInt(sessionStorage.getItem('dynamicImportReload') || '0');
        if (reloadCount < 2) {
          sessionStorage.setItem('dynamicImportReload', (reloadCount + 1).toString());
          window.location.reload();
        }
      }
    }
  }
  render() {
    if (this.state.hasError) {
      if (this.state.error?.message.includes('Failed to fetch dynamically imported module') && !navigator.onLine) {
        return (
          <div className="flex flex-col items-center justify-center w-screen h-screen bg-[#09090b] text-white p-6 font-sans">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500 mb-6"><path d="m2 2 20 20" /><path d="M8.5 8.5C10 7.5 12 7 14 7c2 0 4 .5 5.5 1.5" /><path d="M12 12c2.5 0 4.5 1 6 2.5" /><path d="M16 16c1 .5 2 1.5 2 3" /><path d="M22 22A10 10 0 0 0 2 22" /></svg>
            <h2 className="text-2xl font-bold mb-3 tracking-tight">Offline Resource Unavailable</h2>
            <p className="text-zinc-400 text-center max-w-md leading-relaxed">
              This tool hasn't been fully downloaded to your device yet. Please reconnect to the internet briefly, and the app will cache it for future offline use.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.href = '/';
              }}
              className="mt-8 px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-xl font-medium transition-all"
            >
              Return Home
            </button>
          </div>
        );
      }

      return (
        <div style={{ color: '#ff8080', padding: '20px', backgroundColor: '#18181b', height: '100vh', width: '100vw', fontFamily: 'sans-serif', overflow: 'auto' }}>
          <h2>Runtime Crash Detected</h2>
          <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', marginTop: '20px' }}>{this.state.error?.toString()}</pre>
          <pre style={{ marginTop: '20px', fontSize: '12px' }}>{this.state.error?.stack}</pre>
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
