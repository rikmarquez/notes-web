import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Layout/Header';
import NotesList from '../components/Notes/NotesList';
import SearchResults from '../components/Search/SearchResults';
import ImportNotes from '../components/Import/ImportNotes';
import PopularTags from '../components/Tags/PopularTags';
import Icon from '../components/UI/Icon';
import { useDebounce } from '../hooks/useDebounce';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState(null);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Debounce search query to avoid too many API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const handleSearch = (query) => {
    setSearchQuery(query);
    setShowSearchResults(query.length > 0);
    if (query.length === 0) {
      setSelectedTag(null);
    }
  };

  const handleTagFilter = (tag) => {
    setSelectedTag(tag);
    setSearchQuery('');
    setShowSearchResults(false);
  };

  const handleNoteClick = (note) => {
    navigate(`/note/${note.id}`);
  };

  const handleNewNote = () => {
    navigate('/note/new');
  };

  const handleImportComplete = () => {
    setRefreshTrigger(prev => prev + 1);
    setShowImportModal(false);
  };

  const isSearching = showSearchResults && debouncedSearchQuery;

  return (
    <div className="app-shell">
      <Header />

      <main className="container page">
        <div className="page-head">
          <h1 className="page-title">
            {isSearching ?
              `Resultados para "${debouncedSearchQuery}"` :
              selectedTag ?
                `Notas con tag "${selectedTag}"` :
                'Base de conocimiento'
            }
          </h1>

          <div className="page-actions">
            <button
              onClick={() => setShowImportModal(true)}
              className="btn btn-ghost"
              title="Importar notas desde archivo JSON"
            >
              <Icon name="upload" />
              Importar
            </button>
            <button onClick={handleNewNote} className="btn btn-primary">
              <Icon name="plus" />
              Nueva nota
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="search-container searchbar">
          <Icon name="search" size={20} />
          <input
            type="text"
            placeholder="Buscar notas, tags, contenido..."
            aria-label="Buscar notas"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => handleSearch('')}
              className="icon-btn"
              title="Limpiar búsqueda"
            >
              <Icon name="x" />
            </button>
          )}
        </div>

        <div className="dashboard-layout">
          <section>
            {/* Search Results - replace recent notes when searching */}
            {isSearching ? (
              <SearchResults
                searchQuery={debouncedSearchQuery}
                onNoteClick={handleNoteClick}
                onClose={() => setShowSearchResults(false)}
              />
            ) : (
              /* Notes List - show recent notes when not searching */
              <NotesList
                searchQuery={''}
                selectedTag={selectedTag}
                onNoteClick={handleNoteClick}
                onClearTag={() => handleTagFilter(null)}
                refreshTrigger={refreshTrigger}
              />
            )}
          </section>

          {/* Popular Tags - Only show when not searching */}
          {!showSearchResults && (
            <PopularTags
              onTagFilter={handleTagFilter}
              selectedTag={selectedTag}
            />
          )}
        </div>
      </main>

      {/* Import Modal */}
      {showImportModal && (
        <div
          className="modal-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowImportModal(false);
          }}
        >
          <div className="modal" role="dialog" aria-modal="true" aria-label="Importar notas">
            <div className="modal-head">
              <h2 className="modal-title">Importar notas</h2>
              <button
                onClick={() => setShowImportModal(false)}
                className="icon-btn"
                title="Cerrar"
              >
                <Icon name="x" size={20} />
              </button>
            </div>
            <div className="modal-body">
              <ImportNotes onImportComplete={handleImportComplete} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
