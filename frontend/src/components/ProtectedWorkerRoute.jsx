import { Navigate } from 'react-router-dom';
import { clearWorkerSession, isWorkerTokenValid } from '../services/api';

function ProtectedWorkerRoute({ children }) {
  const token = localStorage.getItem('workerToken');

  if (!isWorkerTokenValid(token)) {
    clearWorkerSession();
    return <Navigate to="/trabajadores/login" replace />;
  }

  return children;
}

export default ProtectedWorkerRoute;
