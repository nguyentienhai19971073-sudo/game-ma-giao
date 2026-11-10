import { createRoot } from 'react-dom/client';
import App from './App';
import { AppErrorBoundary } from './components/ui/AppErrorBoundary';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <AppErrorBoundary><App /></AppErrorBoundary>,
);
