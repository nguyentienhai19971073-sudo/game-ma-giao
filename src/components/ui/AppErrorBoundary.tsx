// CHUA_STABLE3D_DIAGNOSTICS_V3: Show a useful error instead of a blank React root.
import { Component, type ErrorInfo, type ReactNode } from 'react';
import { recordRuntimeDiagnostic } from '../../systems/RuntimeDiagnostics';

interface ErrorBoundaryProps { children: ReactNode; }
interface ErrorBoundaryState { hasError: boolean; message: string; }

export class AppErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, message: error.message || 'Lỗi giao diện không xác định' };
  }

  componentDidCatch(error: Error, _info: ErrorInfo) {
    recordRuntimeDiagnostic('react_error', { message: error.message });
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div style={{ minHeight: '100vh', background: '#170904', color: '#ffe9b0', padding: 24, fontFamily: 'sans-serif' }}>
        <h2>TĨNH TÂM ONLINE — Lỗi giao diện</h2>
        <p>Đã lưu nhật ký lỗi trên trình duyệt. Có thể tải lại trang để tiếp tục.</p>
        <p style={{ fontSize: 12, opacity: 0.8 }}>{this.state.message}</p>
        <button onClick={() => window.location.reload()} style={{ padding: '10px 16px', cursor: 'pointer' }}>
          Tải lại trang
        </button>
      </div>
    );
  }
}
