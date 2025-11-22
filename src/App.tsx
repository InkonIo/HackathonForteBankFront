import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import Login from './pages/Auth/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import TransactionAnalysisPage from './pages/TransactionAnalysis/TransactionAnalysis';
import CustomerAnalyticsPage from './pages/CustomerAnalytics/CustomerAnalytics';
import BatchTimeline from './pages/BatchTimeline/BatchTimeline';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          
          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/transactions"
            element={
              <ProtectedRoute>
                <TransactionAnalysisPage />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/batch"
            element={
              <ProtectedRoute>
                <BatchTimeline />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/customer/:customerId"
            element={
              <ProtectedRoute>
                <CustomerAnalyticsPage />
              </ProtectedRoute>
            }
          />
          
          {/* Default Route */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;