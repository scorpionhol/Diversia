import express from 'express';
import { getArticles, createArticle, updateArticle, deleteArticle } from '../controllers/articleController.js';
import { getProjects } from '../controllers/projectController.js';
import { createContact } from '../controllers/contactController.js';
import { createQuote } from '../controllers/quoteController.js';
import { loginAdmin } from '../controllers/authController.js';
import { healthCheck } from '../controllers/healthController.js';
import { getOperations } from '../controllers/operationsController.js';
import { getRequests, updateRequestStatus, updateRequestAdminNotes, deleteRequest } from '../controllers/requestController.js';
import { getNotifications, ackNotification } from '../controllers/notificationsController.js';
import { sendEmail, getSentEmails } from '../controllers/mailController.js';
import { getMessages } from '../controllers/messagesController.js';
import { getChatMessages, getChatSessions, createChatMessage, createAdminChatMessage } from '../controllers/chatController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { getJobs, createJob, updateJob, deleteJob } from '../controllers/jobController.js';
import { getApplications, createApplication, deleteApplication, downloadApplicationCv } from '../controllers/applicationController.js';
import { getTexts, updateText } from '../controllers/textController.js';

const router = express.Router();

router.get('/health', healthCheck);
router.get('/articles', getArticles);
router.post('/articles', authenticate, createArticle);
router.put('/articles/:id', authenticate, updateArticle);
router.delete('/articles/:id', authenticate, deleteArticle);
router.get('/projects', getProjects);
router.post('/contacts', createContact);
router.post('/quotes', createQuote);
router.post('/auth/login', loginAdmin);
router.get('/operations', authenticate, getOperations);
router.get('/requests', authenticate, getRequests);
router.post('/requests/:id/status', authenticate, updateRequestStatus);
router.post('/requests/:id/notes', authenticate, updateRequestAdminNotes);
router.delete('/requests/:id', authenticate, deleteRequest);
router.get('/notifications', authenticate, getNotifications);
router.post('/notifications/:id/ack', authenticate, ackNotification);
router.post('/send-email', authenticate, sendEmail);
router.get('/messages', authenticate, getMessages);
router.get('/chat/sessions', authenticate, getChatSessions);
router.get('/chat', getChatMessages);
router.post('/chat', createChatMessage);
router.post('/chat/admin', authenticate, createAdminChatMessage);
router.get('/sent-emails', authenticate, getSentEmails);

// Jobs CRUD routes
router.get('/jobs', getJobs);
router.post('/jobs', authenticate, createJob);
router.put('/jobs/:id', authenticate, updateJob);
router.delete('/jobs/:id', authenticate, deleteJob);

// Applications / CV deposit routes
router.get('/applications', authenticate, getApplications);
router.post('/applications', createApplication);
router.delete('/applications/:id', authenticate, deleteApplication);
router.get('/applications/:id/cv', authenticate, downloadApplicationCv);

// Configurable homepage texts
router.get('/texts', getTexts);
router.post('/texts', authenticate, updateText);


export default router;
