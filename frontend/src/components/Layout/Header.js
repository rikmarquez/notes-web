import React from 'react';
import { useAuth } from '../../hooks/useAuth';

const Header = ({ onSearch, searchQuery, setSearchQuery, showSearchInHeader = true }) => {
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
        {/* First row: Logo and Logout Button */}
        <div className="flex items-center justify-between p-4 pb-2">
          <div className="flex items-center flex-1 min-w-0">
            <img 
              src="/assets/notes-logo.png" 
              alt="Notes Web Logo" 
              className="mr-2"
              style={{
                width: '32px',
                height: '32px',
                objectFit: 'contain'
              }}
            />
            <h1 className="text-base md:text-xl font-bold text-gray-900">
              Notes Web
            </h1>
          </div>
          <button
            onClick={logout}
            style={{
              backgroundColor: '#dc2626',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease',
              whiteSpace: 'nowrap',
              marginLeft: '12px'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#b91c1c'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#dc2626'}
          >
            Cerrar Sesión
          </button>
        </div>

        {/* Second row: User Greeting */}
        {showSearchInHeader && (
          <div className="px-4 pb-2">
            <span className="text-gray-600 text-sm md:text-base">
              Hola, {user?.name || user?.email}
            </span>
          </div>
        )}

        {/* Search Bar - responsive single version */}
        {showSearchInHeader && (
          <div className="px-4 pb-4">
            <div className="search-container relative w-full">
                <input
                  type="text"
                  placeholder="Buscar notas, tags, contenido..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="form-input text-base md:text-lg pr-10 w-full"
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
        )}
      </div>
    </header>
  );
};

export default Header;