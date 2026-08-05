const express = require('express');
const mongoose = require('mongoose');
const ContactMessage = require('../models/ContactMessage');
const authMiddleware = require('../middleware/authMiddleware');
const { sendContactReplyEmail } = require('../utils/mailer');

const router = express.Router();

// GET /api/contact — list all messages (admin)
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.json({ success: true, count: messages.length, data: messages });
  } catch (error) {
    next(error);
  }
});

// POST /api/contact
router.post('/', async (req, res, next) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'name, email, and message are required',
      });
    }

    const contactMessage = await ContactMessage.create({
      name,
      email,
      message,
    });

    res.status(201).json({
      success: true,
      message: 'Message received',
      data: contactMessage,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/contact/:id/reply — admin reply via email
router.post('/:id/reply', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;
    const replyText = typeof req.body.replyText === 'string' ? req.body.replyText.trim() : '';

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid message ID' });
    }

    if (!replyText) {
      return res.status(400).json({
        success: false,
        message: 'replyText is required',
      });
    }

    const contactMessage = await ContactMessage.findById(id);

    if (!contactMessage) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    await sendContactReplyEmail({
      name: contactMessage.name,
      email: contactMessage.email,
      replyText,
      originalMessage: contactMessage.message,
    });

    contactMessage.replied = true;
    contactMessage.replyMessage = replyText;
    contactMessage.repliedAt = new Date();
    await contactMessage.save();

    res.json({
      success: true,
      message: 'Reply sent',
      data: contactMessage,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
