import React, { useState, useEffect } from 'react';
import notesService from '../../services/notesService';
import { getConnectionTypeLabel, getTextPreview, getErrorMessage } from '../../utils/helpers';
import { useDebounce } from '../../hooks/useDebounce';

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
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">
          Crear Nueva Conexión
        </h3>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600"
          disabled={loading}
        >
          ✕
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Search for notes */}
        <div className="form-group">
          <label className="form-label text-sm">
            Buscar nota para conectar
          </label>
          <div className="relative">
            <input
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
            
            {searching && (
              <div className="absolute right-3 top-3">
                <div className="spinner"></div>
              </div>
            )}
          </div>

          {/* Search results */}
          {searchResults.length > 0 && !selectedNote && (
            <div className="mt-2 border border-gray-300 rounded-md max-h-32 overflow-y-auto bg-white">
              {searchResults.map(note => (
                <div
                  key={note.id}
                  onClick={() => handleNoteSelect(note)}
                  className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <div className="font-medium text-gray-900 mb-1 text-sm">
                    {note.title}
                  </div>
                  <div className="text-xs text-gray-600">
                    {getTextPreview(note.summary || note.content, 60)}
                  </div>
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {note.tags.slice(0, 2).map((tag, index) => (
                        <span key={index} className="tag text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {searchQuery.trim().length >= 2 && searchResults.length === 0 && !searching && (
            <div className="mt-2 text-sm text-gray-500">
              No se encontraron notas para "{searchQuery}"
            </div>
          )}
        </div>

        {/* Selected note preview */}
        {selectedNote && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="font-medium text-green-900 text-sm">
                  ✓ Nota seleccionada: {selectedNote.title}
                </div>
                <div className="text-xs text-green-700 mt-1">
                  {getTextPreview(selectedNote.summary || selectedNote.content, 80)}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedNote(null);
                  setSearchQuery('');
                }}
                className="text-green-600 hover:text-green-800 ml-2"
                disabled={loading}
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Connection type */}
        <div className="form-group">
          <label className="form-label text-sm">
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
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-outline btn-sm"
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
              <span className="flex items-center gap-2">
                <div className="spinner"></div>
                Creando...
              </span>
            ) : (
              'Crear Conexión'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InlineConnectionForm;