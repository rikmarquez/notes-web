import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Logo from '../UI/Logo';
import Icon from '../UI/Icon';

const Header = () => {
  const { user, logout } = useAuth();
  const displayName = user?.name || user?.email || '';

  return (
    <header className="topbar">
      <div className="container topbar-inner">
        <Link to="/dashboard" className="logo" aria-label="Ir al dashboard">
          <Logo size={28} />
        </Link>

        <div className="topbar-user">
          {displayName && (
            <>
              <span className="avatar">{displayName.charAt(0)}</span>
              <span className="topbar-name">{displayName}</span>
            </>
          )}
          <button onClick={logout} className="btn btn-ghost btn-sm">
            <Icon name="logout" size={16} />
            Salir
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
