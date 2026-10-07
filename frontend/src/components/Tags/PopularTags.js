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
      <aside>
        <h2 className="eyebrow">Tags populares</h2>
        <div className="loading-row">
          <div className="spinner"></div>
        </div>
      </aside>
    );
  }

  if (tags.length === 0) {
    return (
      <aside>
        <h2 className="eyebrow">Tags populares</h2>
        <p className="form-help">No hay tags disponibles</p>
      </aside>
    );
  }

  return (
    <aside>
      <h2 className="eyebrow">Tags populares</h2>

      <div className="tag-list">
        {tags.slice(0, 20).map((tagData) => (
          <button
            key={tagData.tag}
            onClick={() => handleTagClick(tagData.tag)}
            className={`tag-filter ${selectedTag === tagData.tag ? 'is-active' : ''}`}
            aria-pressed={selectedTag === tagData.tag}
          >
            <span>{tagData.tag}</span>
            <span className="count">{tagData.count}</span>
          </button>
        ))}
      </div>
    </aside>
  );
};

export default PopularTags;
