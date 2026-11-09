import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { AppErrorBoundary } from './components/ui/AppErrorBoundary';
import './systems/RuntimeDiagnostics';
import './index.css';
import './chua-readable-obs.css';
import './chua-small-panels-gift-centered.css';
import './chua-merit-smaller-offering-narrower.css';

createRoot(document.getElementById('root')!).render(<AppErrorBoundary><App /></AppErrorBoundary>);
