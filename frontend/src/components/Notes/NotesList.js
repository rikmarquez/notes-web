import React, { useState, useEffect } from 'react';
import NoteCard from './NoteCard';
import Icon from '../UI/Icon';
import notesService from '../../services/notesService';
import { getErrorMessage } from '../../utils/helpers';

const NotesList = ({ searchQuery, selectedTag, onNoteClick, onClearTag, refreshTrigger }) => {
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


  if (loading && notes.length === 0) {
    return (
      <div className="loading-row">
        <div className="spinner"></div>
        Cargando notas...
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <Icon name="alert" />
        {error}
        <button
          onClick={() => fetchNotes()}
          className="btn btn-sm btn-outline"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="empty">
        <div className="empty-icon">
          <Icon name="note" size={24} />
        </div>
        <h3>
          {searchQuery ? 'No se encontraron notas' :
           selectedTag ? `No hay notas con el tag "${selectedTag}"` :
           'No tienes notas aún'}
        </h3>
        <p>
          {searchQuery ? 'Intenta con otros términos de búsqueda' :
           selectedTag ? 'Prueba con otro tag o crea una nueva nota' :
           'Comienza creando tu primera nota para organizar tus ideas'}
        </p>
        {selectedTag && onClearTag && (
          <button onClick={onClearTag} className="btn btn-sm btn-outline">
            Quitar filtro
          </button>
        )}
      </div>
    );
  }

  return (
    <div>
      {/* Results header */}
      <div className="list-head">
        <p className="eyebrow">
          {selectedTag ? 'Filtradas por tag' : 'Recientes'}
          {' · '}
          {notes.length} {notes.length === 1 ? 'nota' : 'notas'}
        </p>
        {selectedTag && onClearTag && (
          <button onClick={onClearTag} className="btn btn-sm btn-ghost">
            <Icon name="x" size={16} />
            Quitar filtro
          </button>
        )}
      </div>

      {/* Notes grid */}
      <div className="notes-grid">
        {notes.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            onClick={onNoteClick}
          />
        ))}
      </div>

      {/* Load more button */}
      {hasMore && (
        <div className="load-more">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="btn btn-secondary"
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Cargando notas...
              </>
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
