import api from './api';

const connectionsService = {
  async getNoteConnections(noteId) {
    try {
      const response = await api.get(`/connections/note/${noteId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to get note connections' };
    }
  },

  async createConnection(noteId, targetNoteId, connectionType) {
    try {
      const response = await api.post(`/connections/note/${noteId}`, {
        targetNoteId,
        connectionType
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to create connection' };
    }
  },

  async deleteConnection(connectionId) {
    try {
      const response = await api.delete(`/connections/${connectionId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to delete connection' };
    }
  },

  async getConnectionTypes() {
    try {
      const response = await api.get('/connections/types');
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to get connection types' };
    }
  }
};

export default connectionsService;