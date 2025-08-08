import React, { useState, useEffect } from 'react';
import notesService from '../../services/notesService';

const PopularTags = ({ onTagFilter, selectedTag }) => {
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

  if (loading) {
    return (
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Tags Populares
        </h3>
        <div className="flex justify-center py-4">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (tags.length === 0) {
    return (
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Tags Populares
        </h3>
        <p className="text-gray-500 text-sm">
          No hay tags disponibles
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 sm:mt-8">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
        Tags Populares
      </h3>
      
      <div className="flex flex-wrap gap-2 sm:gap-3">
        {tags.slice(0, 20).map((tagData) => (
          <button
            key={tagData.tag}
            onClick={() => handleTagClick(tagData.tag)}
            className={`inline-flex items-center px-3 py-2 rounded-full text-sm transition-colors min-w-fit ${
              selectedTag === tagData.tag
                ? 'bg-blue-100 text-blue-800 font-medium border border-blue-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span>🏷️ {tagData.tag}</span>
            <span className="ml-2 text-xs bg-white bg-opacity-70 px-2 py-1 rounded-full">
              {tagData.count}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default PopularTags;