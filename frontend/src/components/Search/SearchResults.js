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
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
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

  return (
    <div className="search-results">
      {loading && (
        <div className="search-result-item text-center">
          <div className="flex items-center justify-center gap-2">
            <div className="spinner"></div>
            <span>Buscando...</span>
          </div>
        </div>
      )}

      {error && (
        <div className="search-result-item text-red-600">
          <div className="flex items-center gap-2">
            <span>❌</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {!loading && !error && results.length === 0 && (
        <div className="search-result-item text-gray-500">
          <div className="flex items-center gap-2">
            <span>🔍</span>
            <span>No se encontraron resultados para "{searchQuery}"</span>
          </div>
        </div>
      )}

      {!loading && !error && results.length > 0 && (
        <>
          <div className="search-result-item border-b-2 border-gray-200 font-semibold text-gray-700">
            {results.length} resultado{results.length !== 1 ? 's' : ''} encontrado{results.length !== 1 ? 's' : ''}
          </div>
          
          {results.map((note) => (
            <div
              key={note.id}
              className="search-result-item"
              onClick={() => handleResultClick(note)}
            >
              <div className="flex flex-col">
                {/* Title */}
                <h4 
                  className="font-semibold text-gray-900 mb-1"
                  dangerouslySetInnerHTML={{
                    __html: highlightSearchTerm(note.title, searchQuery)
                  }}
                />
                
                {/* Content preview */}
                <p 
                  className="text-gray-600 text-sm mb-2"
                  dangerouslySetInnerHTML={{
                    __html: highlightSearchTerm(
                      getTextPreview(note.summary || note.content, 100), 
                      searchQuery
                    )
                  }}
                />
                
                {/* Tags */}
                {note.tags && note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {note.tags.slice(0, 3).map((tag, index) => (
                      <span 
                        key={index} 
                        className={`tag text-xs ${
                          tag.toLowerCase().includes(searchQuery.toLowerCase()) 
                            ? 'bg-yellow-200 text-yellow-800' 
                            : ''
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                    {note.tags.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{note.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {results.length >= 20 && (
            <div className="search-result-item text-center text-gray-500 text-sm">
              Se muestran los primeros 20 resultados. Refina tu búsqueda para resultados más específicos.
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SearchResults;