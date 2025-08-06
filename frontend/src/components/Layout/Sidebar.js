import React, { useState, useEffect } from 'react';
import notesService from '../../services/notesService';

const Sidebar = ({ onTagFilter, selectedTag, onNewNote }) => {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await notesService.getUserTags();
        if (response.success) {
          setTags(response.data.tags);
        }
      } catch (error) {
        console.error('Error fetching tags:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTags();
  }, []);

  const handleTagClick = (tag) => {
    if (selectedTag === tag) {
      onTagFilter(null); // Clear filter
    } else {
      onTagFilter(tag);
    }
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-full">
      <div className="p-4">
        {/* New Note Button */}
        <button
          onClick={onNewNote}
          className="btn btn-primary w-full mb-6"
        >
          ✏️ Nueva Nota
        </button>

        {/* All Notes */}
        <div className="mb-6">
          <button
            onClick={() => onTagFilter(null)}
            className={`w-full text-left p-3 rounded-lg transition-colors ${
              !selectedTag 
                ? 'bg-blue-50 text-blue-700 font-medium' 
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            📋 Todas las notas
          </button>
        </div>

        {/* Tags Section */}
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Tags Populares
          </h3>
          
          {loading ? (
            <div className="flex justify-center py-4">
              <div className="spinner"></div>
            </div>
          ) : tags.length === 0 ? (
            <p className="text-gray-500 text-sm">
              No hay tags disponibles
            </p>
          ) : (
            <div className="space-y-1">
              {tags.slice(0, 15).map((tagData) => (
                <button
                  key={tagData.tag}
                  onClick={() => handleTagClick(tagData.tag)}
                  className={`w-full text-left p-2 rounded-lg transition-colors flex items-center justify-between ${
                    selectedTag === tagData.tag
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="truncate">
                    🏷️ {tagData.tag}
                  </span>
                  <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                    {tagData.count}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;