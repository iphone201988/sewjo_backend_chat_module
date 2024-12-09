import express from 'express';
import {
  createConversation,
  getConversations,
  getConversationMessages,
  markMessagesAsRead,
  getConversationId,
  hideConversation,
} from '../controllers/conversation.controller.js';

const router = express.Router();

// Fetch all conversations for a user
router.get('/:userId', getConversations);

// Create a new conversation
router.post('/', createConversation);

// Get or create a conversation ID based on sender and receiver
router.post('/getOrCreate', getConversationId);

// Fetch messages in a specific conversation
router.get('/:conversationId/messages', getConversationMessages);

// Mark all messages as read in a conversation for a user
router.put('/:conversationId/read', markMessagesAsRead);

// Hide a conversation for a user
router.post('/hide', hideConversation); // New route

export default router;
