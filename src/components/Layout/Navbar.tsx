import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './Navbar.css';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h2>🔐 Forte Bank - Fraud Detection</h2>
      </div>
      <div className="navbar-menu">
        <button onClick={() => navigate('/dashboard')} className="nav-link">
          Dashboard
        </button>
        <button onClick={() => navigate('/transactions')} className="nav-link">
          Транзакции
        </button>
        <button onClick={() => navigate('/batch')} className="nav-link">
          Загрузка
        </button>
      </div>
      <div className="navbar-user">
        <span className="user-email">{user?.email}</span>
        <button onClick={handleLogout} className="logout-btn">
          Выйти
        </button>
      </div>
    </nav>
  );
};

export default Navbar;