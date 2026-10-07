import React, { useState, useEffect, useRef } from 'react';
import notesService from '../../services/notesService';
import { normalizeTags, parseTagsInput } from '../../utils/helpers';
import Icon from '../UI/Icon';

const TagInput = ({ tags, onChange, placeholder = "Agrega tags..." }) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1);
  const [availableTags, setAvailableTags] = useState([]);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // Fetch user's existing tags for suggestions
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await notesService.getUserTags();
        if (response.success) {
          setAvailableTags(response.data.tags.map(t => t.tag));
        }
      } catch (error) {
        console.error('Error fetching tags:', error);
      }
    };

    fetchTags();
  }, []);

  // Filter suggestions based on input
  useEffect(() => {
    if (inputValue.trim().length > 0) {
      const filtered = availableTags
        .filter(tag => 
          tag.toLowerCase().includes(inputValue.toLowerCase()) &&
          !tags.includes(tag.toLowerCase())
        )
        .slice(0, 5);
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
    setSelectedSuggestion(-1);
  }, [inputValue, tags, availableTags]);

  // Handle input changes
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  // Handle key press events
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
      removeTag(tags.length - 1);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestion(prev => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestion(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Tab' && selectedSuggestion >= 0) {
      e.preventDefault();
      selectSuggestion(suggestions[selectedSuggestion]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedSuggestion(-1);
    }
  };

  // Add a new tag
  const addTag = () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue === '') return;

    const newTags = parseTagsInput(trimmedValue);
    const normalizedNewTags = normalizeTags(newTags);
    
    // Add only unique tags
    const uniqueTags = normalizedNewTags.filter(tag => !tags.includes(tag));
    if (uniqueTags.length > 0) {
      onChange([...tags, ...uniqueTags].slice(0, 10)); // Limit to 10 tags
    }
    
    setInputValue('');
    setShowSuggestions(false);
    setSelectedSuggestion(-1);
  };

  // Remove a tag
  const removeTag = (index) => {
    const newTags = tags.filter((_, i) => i !== index);
    onChange(newTags);
  };

  // Select a suggestion
  const selectSuggestion = (suggestion) => {
    if (!tags.includes(suggestion.toLowerCase())) {
      onChange([...tags, suggestion.toLowerCase()]);
    }
    setInputValue('');
    setShowSuggestions(false);
    setSelectedSuggestion(-1);
    inputRef.current?.focus();
  };

  // Handle container click to focus input
  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  // Handle input blur
  const handleBlur = () => {
    // Delay hiding suggestions to allow for suggestion click
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedSuggestion(-1);
      // Add tag if there's input value
      if (inputValue.trim()) {
        addTag();
      }
    }, 150);
  };

  return (
    <div className="search-container" ref={containerRef}>
      <div 
        className="tag-input-container"
        onClick={handleContainerClick}
      >
        {/* Render existing tags */}
        {tags.map((tag, index) => (
          <span key={index} className="tag">
            {tag}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeTag(index);
              }}
              className="tag-remove"
              title={`Quitar ${tag}`}
            >
              <Icon name="x" size={14} />
            </button>
          </span>
        ))}
        
        {/* Input field */}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="tag-input"
          disabled={tags.length >= 10}
        />
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="dropdown">
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => selectSuggestion(suggestion)}
              className={`dropdown-item ${index === selectedSuggestion ? 'is-active' : ''}`}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Helper text */}
      <div className="form-help">
        Presiona Enter o coma para agregar tags. Máximo 10 tags.
        {tags.length >= 10 && (
          <strong>{' '}Límite alcanzado.</strong>
        )}
      </div>
    </div>
  );
};

export default TagInput;