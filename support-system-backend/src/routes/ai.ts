import express from 'express';
import OpenAI from 'openai';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

router.post('/suggest-reply', authMiddleware, async (req, res) => {
  try {
    const openai = new OpenAI({ 
      apiKey: process.env.OPENAI_API_KEY! 
    });
    
    const { ticketTitle, ticketDescription, comments } = req.body;

    const conversationHistory = comments
      .slice(-6)
      .map((c: any) => `${c.userName} (${c.userRole}): ${c.message}`)
      .join('\n');

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 200,
      messages: [
        {
          role: 'system',
          content: `You are a helpful IT support agent assistant. 
Write professional, helpful, concise replies from the 
agent's perspective. Be empathetic and solution-focused. 
Keep replies under 3 sentences. No greetings or sign-offs. 
Reply only with the message text, nothing else.`
        },
        {
          role: 'user',
          content: `Ticket: ${ticketTitle}
Description: ${ticketDescription}

Recent conversation:
${conversationHistory}

Suggest a professional reply from the agent.`
        }
      ]
    });

    const suggestion = completion.choices[0]?.message?.content || '';
    res.json({ suggestion });

  } catch (error: any) {
    console.error('AI suggest error:', error);
    res.status(500).json({ message: 'AI suggestion failed' });
  }
});

export default router;

