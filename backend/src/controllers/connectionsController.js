const Connection = require('../models/Connection');

const connectionsController = {
  async createConnection(req, res) {
    try {
      const { targetNoteId, connectionType } = req.body;
      const sourceNoteId = req.params.noteId;
      const userId = req.user.id;

      if (sourceNoteId === targetNoteId) {
        return res.status(400).json({
          success: false,
          message: 'Cannot create connection to the same note'
        });
      }

      const connection = await Connection.create(sourceNoteId, targetNoteId, connectionType, userId);

      if (!connection) {
        return res.status(409).json({
          success: false,
          message: 'Connection already exists'
        });
      }

      res.status(201).json({
        success: true,
        message: 'Connection created successfully',
        data: { connection }
      });

    } catch (error) {
      if (error.message === 'One or both notes do not belong to the user') {
        return res.status(403).json({
          success: false,
          message: error.message
        });
      }

      console.error('Create connection error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  async getNoteConnections(req, res) {
    try {
      const { noteId } = req.params;

      console.log(`Getting connections for noteId: ${noteId}`);

      if (!noteId) {
        return res.status(400).json({
          success: false,
          message: 'Missing required parameters'
        });
      }

      const connections = await Connection.findByNoteId(noteId);
      console.log(`Found ${connections.length} connections`);

      // Group connections by type
      const groupedConnections = connections.reduce((acc, conn) => {
        const type = conn.connection_type;
        if (!acc[type]) {
          acc[type] = [];
        }
        
        // Determine if this note is source or target
        const isSource = conn.source_note_id == noteId;
        acc[type].push({
          id: conn.id,
          noteId: isSource ? conn.target_note_id : conn.source_note_id,
          title: isSource ? conn.target_title : conn.source_title,
          connectionType: type,
          direction: isSource ? 'outgoing' : 'incoming',
          createdAt: conn.created_at
        });
        
        return acc;
      }, {});

      res.json({
        success: true,
        data: { 
          connections: groupedConnections,
          connectionTypes: Connection.getConnectionTypes()
        }
      });

    } catch (error) {
      console.error('Get note connections error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        noteId: req.params.noteId
      });
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  async deleteConnection(req, res) {
    try {
      const { connectionId } = req.params;
      const userId = req.user.id;

      const deletedConnection = await Connection.delete(connectionId, userId);

      if (!deletedConnection) {
        return res.status(404).json({
          success: false,
          message: 'Connection not found'
        });
      }

      res.json({
        success: true,
        message: 'Connection deleted successfully'
      });

    } catch (error) {
      console.error('Delete connection error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  async getConnectionTypes(req, res) {
    try {
      const types = Connection.getConnectionTypes();
      
      res.json({
        success: true,
        data: { connectionTypes: types }
      });

    } catch (error) {
      console.error('Get connection types error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
};

module.exports = connectionsController;