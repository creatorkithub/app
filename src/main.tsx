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
  }
  render() {
    if (this.state.hasError) {
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
