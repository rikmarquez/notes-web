import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Layout/Header';
import Sidebar from '../components/Layout/Sidebar';
import NotesList from '../components/Notes/NotesList';
import SearchResults from '../components/Search/SearchResults';
import { useDebounce } from '../hooks/useDebounce';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState(null);
  const [showSearchResults, setShowSearchResults] = useState(false);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        onSearch={handleSearch}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      
      <div className="flex h-screen pt-16"> {/* pt-16 to account for fixed header */}
        <Sidebar 
          onTagFilter={handleTagFilter}
          selectedTag={selectedTag}
          onNewNote={handleNewNote}
        />
        
        <main className="flex-1 overflow-auto">
          <div className="container py-6">
            {/* Search Results Dropdown */}
            {showSearchResults && debouncedSearchQuery && (
              <div className="mb-6">
                <SearchResults 
                  searchQuery={debouncedSearchQuery}
                  onNoteClick={handleNoteClick}
                  onClose={() => setShowSearchResults(false)}
                />
              </div>
            )}

            {/* Notes List */}
            <NotesList
              searchQuery={showSearchResults ? '' : debouncedSearchQuery}
              selectedTag={selectedTag}
              onNoteClick={handleNoteClick}
              onEditNote={handleEditNote}
              refreshTrigger={refreshTrigger}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;