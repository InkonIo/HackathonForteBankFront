import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import Login from './pages/Auth/Login';
import TransactionAnalysisPage from './pages/TransactionAnalysis/TransactionAnalysis';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route
            path="/transactions"
            element={
              <ProtectedRoute>
                <TransactionAnalysisPage />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <TransactionAnalysisPage />
              </ProtectedRoute>
            }
          />
          
          <Route path="/" element={<Navigate to="/transactions" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

// 22e2w