import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from: {
      id: number;
      first_name: string;
      username?: string;
    };
    chat: {
      id: number;
      type: string;
    };
    text?: string;
    date: number;
  };
}

async function sendMessage(chatId: number, text: string) {
  try {
    await axios.post(`${TELEGRAM_API_URL}/sendMessage`, {
      chat_id: chatId,
      text,
      parse_mode: 'Markdown'
    });
  } catch (error) {
    console.error('Error sending Telegram message:', error);
  }
}

// Helper function to get the base URL from the request
function getBaseUrl(req: NextApiRequest): string {
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  return `${protocol}://${host}`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const update: TelegramUpdate = req.body;

  if (!update.message || !update.message.text) {
    return res.status(200).json({ ok: true });
  }

  const chatId = update.message.chat.id;
  const text = update.message.text;
  const firstName = update.message.from.first_name;

  // Handle commands
  if (text === '/start') {
    await sendMessage(
      chatId,
      `🚆 Welcome ${firstName}! I'm the NSW Train Assistant bot.\n\n` +
      `I can help you with:\n` +
      `• Train schedules and routes\n` +
      `• Real-time journey planning\n` +
      `• Service alerts\n\n` +
      `Just send me a message like:\n` +
      `"Next train from Central to Parramatta"\n` +
      `"How do I get to Circular Quay?"`
    );
    return res.status(200).json({ ok: true });
  }

  try {
    // Get the base URL for internal API calls
    const baseUrl = getBaseUrl(req);
    console.log('Base URL for internal calls:', baseUrl);
    
    // Extract intent from the message
    const intentResponse = await fetch(`${baseUrl}/api/intent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });

    console.log('Intent API response status:', intentResponse.status);
    const intent = await intentResponse.json();
    console.log('Intent API response:', intent);

    if (intent.needsFollowUp) {
      await sendMessage(chatId, intent.followUpQuestion || 'Could you please provide more details?');
      return res.status(200).json({ ok: true });
    }

    if (intent.from && intent.to) {
      console.log('Processing journey:', intent.from, 'to', intent.to);
      // Get journey information
      const journeyResponse = await fetch(`${baseUrl}/api/journey`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: intent.from,
          to: intent.to,
          mode: intent.mode || 'train',
          datetime: intent.datetime
        })
      });

      const journeyData = await journeyResponse.json();

      if (journeyData.results && journeyData.results.length > 0) {
        let responseText = `🚆 *${intent.mode?.toUpperCase() || 'TRAIN'} - ${intent.from} to ${intent.to}*\n\n`;
        
        journeyData.results.slice(0, 3).forEach((journey: any, idx: number) => {
          const depTime = new Date(journey.departureTime).toLocaleTimeString('en-AU', {
            hour: '2-digit',
            minute: '2-digit'
          });
          const arrTime = new Date(journey.arrivalTime).toLocaleTimeString('en-AU', {
            hour: '2-digit',
            minute: '2-digit'
          });
          
          responseText += `${idx + 1}. *Departs:* ${depTime} - *Arrives:* ${arrTime}\n`;
          responseText += `   Duration: ${journey.duration}min | Changes: ${journey.changes}\n`;
          responseText += `   Platform: ${journey.legs[0]?.departure?.platform || 'TBA'}\n\n`;
        });

        responseText += `_Last updated: ${new Date().toLocaleTimeString('en-AU')}_`;
        
        await sendMessage(chatId, responseText);
      } else {
        await sendMessage(
          chatId,
          '❌ Sorry, I couldn\'t find any journey information for that route. Please check the station names and try again.'
        );
      }
    } else {
      console.log('Intent missing from/to:', { from: intent.from, to: intent.to, fullIntent: intent });
      await sendMessage(
        chatId,
        '🤔 I couldn\'t understand your request. Please specify the departure and arrival stations.\n\n' +
        'Example: "Next train from Central to Chatswood"'
      );
    }
  } catch (error) {
    console.error('Error processing Telegram message:', error);
    await sendMessage(
      chatId,
      '❌ Sorry, there was an error processing your request. Please try again later.'
    );
  }

  res.status(200).json({ ok: true });
}
