import React, { useState, useEffect } from 'react';
import NoteCard from './NoteCard';
import notesService from '../../services/notesService';
import { getErrorMessage } from '../../utils/helpers';

const NotesList = ({ searchQuery, selectedTag, onNoteClick, onEditNote, refreshTrigger }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const fetchNotes = async (pageNum = 1, reset = true) => {
    try {
      setLoading(true);
      setError('');

      let response;
      
      if (searchQuery) {
        response = await notesService.searchNotes(searchQuery);
      } else if (selectedTag) {
        response = await notesService.getNotesByTag(selectedTag, pageNum);
      } else {
        response = await notesService.getNotes(pageNum);
      }

      if (response.success) {
        if (reset) {
          setNotes(response.data.notes);
        } else {
          setNotes(prev => [...prev, ...response.data.notes]);
        }
        
        setHasMore(response.data.pagination?.hasMore || false);
        setPage(pageNum);
      } else {
        setError(response.message || 'Error al cargar las notas');
      }
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [searchQuery, selectedTag, refreshTrigger]);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchNotes(page + 1, false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      const response = await notesService.deleteNote(noteId);
      if (response.success) {
        setNotes(prev => prev.filter(note => note.id !== noteId));
      } else {
        alert(response.message || 'Error al eliminar la nota');
      }
    } catch (error) {
      alert(getErrorMessage(error));
    }
  };

  if (loading && notes.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        {error}
        <button 
          onClick={() => fetchNotes()}
          className="btn btn-sm btn-outline ml-4"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📝</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          {searchQuery ? 'No se encontraron notas' : 
           selectedTag ? `No hay notas con el tag "${selectedTag}"` : 
           'No tienes notas aún'}
        </h3>
        <p className="text-gray-500 mb-6">
          {searchQuery ? 'Intenta con otros términos de búsqueda' :
           selectedTag ? 'Prueba con otro tag o crea una nueva nota' :
           'Comienza creando tu primera nota para organizar tus ideas'}
        </p>
        {!searchQuery && !selectedTag && (
          <button 
            onClick={() => onEditNote(null)}
            className="btn btn-primary"
          >
            Crear mi primera nota
          </button>
        )}
      </div>
    );
  }

  return (
    <div>
      {/* Results header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {searchQuery ? `Resultados para "${searchQuery}"` :
           selectedTag ? `Notas con tag "${selectedTag}"` :
           'Tus notas recientes'}
        </h2>
        <p className="text-gray-600">
          {notes.length} {notes.length === 1 ? 'nota encontrada' : 'notas encontradas'}
        </p>
      </div>

      {/* Notes grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {notes.map((note) => (
          <div key={note.id} className="group">
            <NoteCard
              note={note}
              onClick={onNoteClick}
              onEdit={onEditNote}
              onDelete={handleDeleteNote}
            />
          </div>
        ))}
      </div>

      {/* Load more button */}
      {hasMore && (
        <div className="text-center mt-8">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="btn btn-outline"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="spinner"></div>
                Cargando...
              </span>
            ) : (
              'Cargar más notas'
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default NotesList;