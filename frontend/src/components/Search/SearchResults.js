import React, { useState, useEffect } from 'react';
import notesService from '../../services/notesService';
import Icon from '../UI/Icon';
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
      <div className="loading-row">
        <div className="spinner"></div>
        Buscando...
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <Icon name="alert" />
        {error}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="empty">
        <div className="empty-icon">
          <Icon name="search" size={24} />
        </div>
        <h3>No se encontraron resultados</h3>
        <p>
          No se encontraron notas para "{searchQuery}". Intenta con otros términos de búsqueda.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Results header */}
      <div className="list-head">
        <p className="eyebrow">
          {results.length} {results.length === 1 ? 'nota encontrada' : 'notas encontradas'}
        </p>
      </div>

      {/* Results grid */}
      <div className="notes-grid">
        {results.map((note) => (
          <article
            key={note.id}
            className="search-result-note note-card"
            onClick={() => handleResultClick(note)}
            onKeyDown={(e) => e.key === 'Enter' && handleResultClick(note)}
            role="link"
            tabIndex={0}
          >
            {/* Title with privacy indicator */}
            <div className="note-card-head">
              <h3
                className="note-card-title"
                dangerouslySetInnerHTML={{
                  __html: highlightSearchTerm(note.title, searchQuery)
                }}
              />
              {note.is_private && (
                <span className="chip-lock">
                  <Icon name="lock" size={12} />
                  Privada
                </span>
              )}
            </div>

            {/* Content preview */}
            <p
              className="note-card-text"
              dangerouslySetInnerHTML={{
                __html: highlightSearchTerm(
                  getTextPreview(note.summary || note.content, 120),
                  searchQuery
                )
              }}
            />

            {/* Tags */}
            {note.tags && note.tags.length > 0 && (
              <div className="tag-row">
                {note.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className={`tag ${
                      tag.toLowerCase().includes(searchQuery.toLowerCase())
                        ? 'tag-match'
                        : ''
                    }`}
                  >
                    {tag}
                  </span>
                ))}
                {note.tags.length > 3 && (
                  <span className="tag">+{note.tags.length - 3}</span>
                )}
              </div>
            )}

            {/* Date */}
            {note.updated_at && (
              <div className="note-card-foot">
                {new Date(note.updated_at).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </div>
            )}
          </article>
        ))}
      </div>

      {results.length >= 20 && (
        <p className="form-help">
          Se muestran los primeros 20 resultados. Refina tu búsqueda para resultados más específicos.
        </p>
      )}
    </div>
  );
};

export default SearchResults;
