import React from 'react';
import { useAuth } from '../../hooks/useAuth';

const Header = ({ onSearch, searchQuery, setSearchQuery }) => {
  const { user, logout } = useAuth();

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (onSearch) {
      onSearch(query);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container">
        <div className="flex items-center justify-between p-4">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900">
              📝 Notes Web
            </h1>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-8">
            <div className="search-container">
              <input
                type="text"
                placeholder="Buscar notas, tags, contenido..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="form-input text-lg"
              />
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            <span className="text-gray-600">
              Hola, {user?.name || user?.email}
            </span>
            <button
              onClick={logout}
              className="btn btn-outline btn-sm"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;