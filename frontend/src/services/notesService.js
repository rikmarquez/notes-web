import api from './api';

const notesService = {
  async getNotes(page = 1, limit = 20) {
    try {
      const response = await api.get(`/notes?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to get notes' };
    }
  },

  async getNote(id) {
    try {
      const response = await api.get(`/notes/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to get note' };
    }
  },

  async createNote(noteData) {
    try {
      const response = await api.post('/notes', noteData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to create note' };
    }
  },

  async updateNote(id, noteData) {
    try {
      const response = await api.put(`/notes/${id}`, noteData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to update note' };
    }
  },

  async deleteNote(id) {
    try {
      const response = await api.delete(`/notes/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to delete note' };
    }
  },

  async searchNotes(query, limit = 20) {
    try {
      const response = await api.get(`/notes/search?q=${encodeURIComponent(query)}&limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to search notes' };
    }
  },

  async getUserTags() {
    try {
      const response = await api.get('/notes/tags');
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to get tags' };
    }
  },

  async getNotesByTag(tag, page = 1, limit = 20) {
    try {
      const response = await api.get(`/notes/tag/${encodeURIComponent(tag)}?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to get notes by tag' };
    }
  },

  async importNotes(notesData) {
    try {
      const response = await api.post('/notes/import', { notes: notesData });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to import notes' };
    }
  }
};

export default notesService;