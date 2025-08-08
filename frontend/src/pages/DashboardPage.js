import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Layout/Header';
import NotesList from '../components/Notes/NotesList';
import SearchResults from '../components/Search/SearchResults';
import ImportNotes from '../components/Import/ImportNotes';
import PopularTags from '../components/Tags/PopularTags';
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

  const handleEditNote = (note) => {
    if (note) {
      navigate(`/note/${note.id}/edit`);
    } else {
      navigate('/note/new');
    }
  };

  const handleNewNote = () => {
    navigate('/note/new');
  };

  const handleNoteCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleImportComplete = () => {
    setRefreshTrigger(prev => prev + 1);
    setShowImportModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        onSearch={handleSearch}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      
      <div className="h-screen pt-16"> {/* pt-16 to account for fixed header */}
        <main className="overflow-auto h-full">
          <div className="container py-6">
            {/* Title */}
            <div className="mb-4">
              <h1 className="text-2xl font-bold text-gray-900">
                {showSearchResults && debouncedSearchQuery ? 
                  `Resultados para "${debouncedSearchQuery}"` :
                  selectedTag ? 
                    `Notas con tag "${selectedTag}"` :
                    'Base de Conocimiento Colaborativa'
                }
              </h1>
            </div>

            {/* Action Buttons */}
            <div className="mb-6 flex flex-wrap gap-3">
              <button
                onClick={handleNewNote}
                className="btn btn-primary"
              >
                ✏️ Nueva Nota
              </button>
              <button
                onClick={() => handleTagFilter(null)}
                className={`btn ${!selectedTag ? 'btn-primary' : 'btn-secondary'}`}
              >
                📋 Todas las notas
              </button>
              <button
                onClick={() => setShowImportModal(true)}
                className="btn btn-secondary"
                title="Importar notas desde archivo JSON"
              >
                📥 Importar Notas
              </button>
            </div>

            {/* Search Results - replace recent notes when searching */}
            {showSearchResults && debouncedSearchQuery ? (
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
                refreshTrigger={refreshTrigger}
              />
            )}

            {/* Popular Tags - Only show when not searching */}
            {!showSearchResults && (
              <PopularTags
                onTagFilter={handleTagFilter}
                selectedTag={selectedTag}
              />
            )}
          </div>
        </main>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Importar Notas</h2>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <ImportNotes onImportComplete={handleImportComplete} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;