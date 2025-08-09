// Date formatting utilities
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    return 'Ayer';
  } else if (diffDays < 7) {
    return `Hace ${diffDays} días`;
  } else {
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
};

export const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Text utilities
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

export const stripHtml = (html) => {
  if (!html) return '';
  const temp = document.createElement('div');
  temp.innerHTML = html;
  return temp.textContent || temp.innerText || '';
};

// Strip HTML but preserve line breaks
export const stripHtmlPreservingLineBreaks = (html) => {
  if (!html) return '';
  
  let text = html
    // Convert <br>, <br/>, <br /> to line breaks
    .replace(/<br\s*\/?>/gi, '\n')
    // Convert </p> tags to double line breaks (paragraph separation)
    .replace(/<\/p>/gi, '\n\n')
    // Convert </div> tags to line breaks
    .replace(/<\/div>/gi, '\n')
    // Convert </li> tags to line breaks
    .replace(/<\/li>/gi, '\n')
    // Convert </h1>, </h2>, etc. to double line breaks
    .replace(/<\/h[1-6]>/gi, '\n\n');
  
  // Now strip all remaining HTML tags
  const temp = document.createElement('div');
  temp.innerHTML = text;
  text = temp.textContent || temp.innerText || '';
  
  // Clean up multiple consecutive line breaks (more than 2)
  text = text.replace(/\n{3,}/g, '\n\n');
  
  // Trim whitespace from each line and remove empty lines at start/end
  text = text
    .split('\n')
    .map(line => line.trim())
    .join('\n')
    .trim();
  
  return text;
};

export const getTextPreview = (content, maxLength = 150) => {
  const plainText = stripHtml(content);
  return truncateText(plainText, maxLength);
};

// Tag utilities
export const normalizeTags = (tags) => {
  if (!Array.isArray(tags)) return [];
  return tags
    .map(tag => tag.toLowerCase().trim())
    .filter(tag => tag.length > 0)
    .filter((tag, index, arr) => arr.indexOf(tag) === index); // Remove duplicates
};

export const parseTagsInput = (input) => {
  if (!input) return [];
  return input
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0)
    .slice(0, 10); // Limit to 10 tags
};

// Connection type translations
export const getConnectionTypeLabel = (type) => {
  const labels = {
    'relacionado': 'Relacionado',
    'contradice': 'Contradice',
    'ejemplifica': 'Ejemplifica',
    'inspira': 'Inspira',
    'causa_efecto': 'Causa/Efecto',
    'parte_de': 'Parte de'
  };
  return labels[type] || type;
};

// Validation utilities
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  return password && password.length >= 6;
};

// Local storage utilities
export const saveToLocalStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

export const getFromLocalStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return defaultValue;
  }
};

// Search highlighting utility
export const highlightSearchTerm = (text, searchTerm) => {
  if (!searchTerm || !text) return text;
  
  const regex = new RegExp(`(${searchTerm})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
};

// Clipboard utility
export const copyToClipboard = async (text) => {
  try {
    // Modern approach - using Clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return { success: true, message: '¡Copiado al portapapeles!' };
    }
    
    // Fallback approach for older browsers or non-HTTPS
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'absolute';
    textArea.style.left = '-9999px';
    textArea.style.top = '-9999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    
    if (successful) {
      return { success: true, message: '¡Copiado al portapapeles!' };
    } else {
      throw new Error('No se pudo copiar');
    }
  } catch (error) {
    console.error('Error al copiar:', error);
    return { success: false, message: 'No se pudo copiar al portapapeles' };
  }
};

// Format note content for copying (just main content)
export const formatNoteForCopy = (note) => {
  // Only copy the main content, stripped of HTML but preserving line breaks
  return note.content ? stripHtmlPreservingLineBreaks(note.content) : '';
};

// Error handling utility
export const getErrorMessage = (error) => {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.response?.data?.message) return error.response.data.message;
  return 'Ha ocurrido un error inesperado';
};