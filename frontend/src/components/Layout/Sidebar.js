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

  return null;
};

export default Sidebar;