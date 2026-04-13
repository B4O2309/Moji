import express from 'express';
import { createConversation, getConversations, getMessages, markAsSeen, hideConversation, deleteConversation, renameGroup, addGroupMembers, 
    leaveGroup, getArchivedConversations, unarchiveConversation } from '../controllers/conversationController.js';

const router = express.Router();

router.post('/', createConversation);
router.get('/', getConversations);
router.get('/:conversationId/messages', getMessages);
router.get('/archived', getArchivedConversations);
router.patch('/:conversationId/seen', markAsSeen);
router.put('/:conversationId/hide', hideConversation);
router.delete('/:conversationId/delete', deleteConversation);
router.patch('/:conversationId/rename', renameGroup);
router.post('/:conversationId/members', addGroupMembers);
router.delete('/:conversationId/leave', leaveGroup);
router.patch('/:conversationId/unarchive', unarchiveConversation);

export default router;