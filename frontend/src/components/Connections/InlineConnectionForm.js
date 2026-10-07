import React, { useState, useEffect } from 'react';
import notesService from '../../services/notesService';
import { getConnectionTypeLabel, getTextPreview, getErrorMessage } from '../../utils/helpers';
import { useDebounce } from '../../hooks/useDebounce';
import Icon from '../UI/Icon';

const InlineConnectionForm = ({ noteId, connectionTypes, onCreateConnection, onCancel }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [selectedConnectionType, setSelectedConnectionType] = useState('relacionado');
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Search for notes
  useEffect(() => {
    const searchNotes = async () => {
      if (!debouncedSearchQuery || debouncedSearchQuery.trim().length < 2) {
        setSearchResults([]);
        return;
      }

      try {
        setSearching(true);
        const response = await notesService.searchNotes(debouncedSearchQuery.trim());
        
        if (response.success) {
          // Filter out the current note
          const filteredResults = response.data.notes.filter(note => note.id !== noteId);
          setSearchResults(filteredResults);
        } else {
          setSearchResults([]);
        }
      } catch (error) {
        console.error('Error searching notes:', error);
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    };

    searchNotes();
  }, [debouncedSearchQuery, noteId]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedNote) {
      setError('Selecciona una nota para conectar');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      await onCreateConnection(selectedNote.id, selectedConnectionType);
      
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  // Handle note selection
  const handleNoteSelect = (note) => {
    setSelectedNote(note);
    setSearchQuery(note.title);
    setSearchResults([]);
  };

  return (
    <div className="panel form-group">
      <div className="section-head">
        <h3 className="section-title">Nueva conexión</h3>
        <button
          onClick={onCancel}
          className="icon-btn"
          title="Cancelar"
          disabled={loading}
        >
          <Icon name="x" />
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          <Icon name="alert" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Search for notes */}
        {!selectedNote && (
          <div className="form-group">
            <label className="form-label" htmlFor="connection-search">
              Buscar nota para conectar
            </label>
            <input
              id="connection-search"
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedNote(null);
              }}
              placeholder="Busca por título, contenido o tags..."
              className="form-input"
              disabled={loading}
              autoFocus
            />

            {/* Search results */}
            {searchResults.length > 0 && (
              <div className="dropdown dropdown-static">
                {searchResults.map(note => (
                  <div
                    key={note.id}
                    onClick={() => handleNoteSelect(note)}
                    className="dropdown-item"
                  >
                    <div className="dropdown-item-title">
                      {note.title}
                    </div>
                    <div className="dropdown-item-text">
                      {getTextPreview(note.summary || note.content, 60)}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {searching && (
              <div className="form-help">Buscando...</div>
            )}

            {searchQuery.trim().length >= 2 && searchResults.length === 0 && !searching && (
              <div className="form-help">
                No se encontraron notas para "{searchQuery}"
              </div>
            )}
          </div>
        )}

        {/* Selected note preview */}
        {selectedNote && (
          <div className="selected-note">
            <Icon name="check" />
            <div className="row-text" style={{ flex: 1 }}>
              <div className="row-title">{selectedNote.title}</div>
              <div className="row-sub">
                {getTextPreview(selectedNote.summary || selectedNote.content, 80)}
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedNote(null);
                setSearchQuery('');
              }}
              className="icon-btn"
              title="Cambiar nota"
              disabled={loading}
            >
              <Icon name="x" />
            </button>
          </div>
        )}

        {/* Connection type */}
        <div className="form-group">
          <label className="form-label">
            Tipo de conexión
          </label>
          <select
            value={selectedConnectionType}
            onChange={(e) => setSelectedConnectionType(e.target.value)}
            className="form-input"
            disabled={loading}
          >
            {connectionTypes.map(type => (
              <option key={type} value={type}>
                {getConnectionTypeLabel(type)}
              </option>
            ))}
          </select>
        </div>

        {/* Submit buttons */}
        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-ghost btn-sm"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn btn-primary btn-sm"
            disabled={loading || !selectedNote}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Creando...
              </>
            ) : (
              'Crear conexión'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InlineConnectionForm;