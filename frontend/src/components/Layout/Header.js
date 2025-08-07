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

  const handleClearSearch = () => {
    setSearchQuery('');
    if (onSearch) {
      onSearch('');
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
            <div className="search-container relative">
              <input
                type="text"
                placeholder="Buscar notas, tags, contenido..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="form-input text-lg pr-10"
              />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Limpiar búsqueda"
                >
                  <svg 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              )}
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