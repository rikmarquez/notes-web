import React, { useState, useEffect } from 'react';
import notesService from '../../services/notesService';
import { getTextPreview, highlightSearchTerm, getErrorMessage } from '../../utils/helpers';

const SearchResults = ({ searchQuery, onNoteClick, onClose }) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const searchNotes = async () => {
      if (!searchQuery || searchQuery.trim().length < 2) {
        setResults([]);
        return;
      }

      try {
        setLoading(true);
        setError('');
        
        const response = await notesService.searchNotes(searchQuery.trim());
        
        if (response.success) {
          setResults(response.data.notes);
        } else {
          setError(response.message || 'Error en la búsqueda');
        }
      } catch (error) {
        setError(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    };

    searchNotes();
  }, [searchQuery]);

  const handleResultClick = (note) => {
    onNoteClick(note);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  // Close results when clicking outside (but not on notes)
  useEffect(() => {
    const handleClickOutside = (e) => {
      // Don't close if clicking on a search result note
      if (e.target.closest('.search-result-note')) {
        return;
      }
      
      if (!e.target.closest('.search-results') && !e.target.closest('.search-container')) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  if (!searchQuery || searchQuery.trim().length < 2) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex items-center gap-2">
          <div className="spinner"></div>
          <span>Buscando...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <div className="flex items-center gap-2">
          <span>❌</span>
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          No se encontraron resultados
        </h3>
        <p className="text-gray-500 mb-6">
          No se encontraron notas para "{searchQuery}". Intenta con otros términos de búsqueda.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Results header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Resultados de búsqueda para "{searchQuery}"
        </h2>
        <p className="text-gray-600">
          {results.length} {results.length === 1 ? 'nota encontrada' : 'notas encontradas'}
        </p>
      </div>

      {/* Results grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((note) => (
          <div
            key={note.id}
            className="search-result-note bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow group"
            onClick={() => handleResultClick(note)}
          >
            <div className="flex flex-col h-full">
              {/* Title with privacy indicator */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <h4 
                  className="font-semibold text-gray-900 line-clamp-2 flex-1"
                  dangerouslySetInnerHTML={{
                    __html: highlightSearchTerm(note.title, searchQuery)
                  }}
                />
                {note.is_private && (
                  <div className="flex-shrink-0 bg-red-100 text-red-800 text-xs px-1.5 py-0.5 rounded-full flex items-center gap-1">
                    🔒 <span>Privado</span>
                  </div>
                )}
              </div>
              
              {/* Content preview */}
              <p 
                className="text-gray-600 text-sm mb-3 flex-grow line-clamp-3"
                dangerouslySetInnerHTML={{
                  __html: highlightSearchTerm(
                    getTextPreview(note.summary || note.content, 120), 
                    searchQuery
                  )
                }}
              />
              
              {/* Tags */}
              {note.tags && note.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-auto">
                  {note.tags.slice(0, 3).map((tag, index) => (
                    <span 
                      key={index} 
                      className={`inline-block px-2 py-1 text-xs rounded-full ${
                        tag.toLowerCase().includes(searchQuery.toLowerCase()) 
                          ? 'bg-yellow-200 text-yellow-800' 
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                  {note.tags.length > 3 && (
                    <span className="text-xs text-gray-500 px-2 py-1">
                      +{note.tags.length - 3}
                    </span>
                  )}
                </div>
              )}
              
              {/* Date */}
              {note.updated_at && (
                <div className="text-xs text-gray-400 mt-2">
                  {new Date(note.updated_at).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {results.length >= 20 && (
        <div className="text-center mt-8 p-4 bg-gray-50 rounded-lg">
          <p className="text-gray-600 text-sm">
            Se muestran los primeros 20 resultados. Refina tu búsqueda para resultados más específicos.
          </p>
        </div>
      )}
    </div>
  );
};

export default SearchResults;