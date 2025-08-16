import type { NextApiRequest, NextApiResponse } from 'next';

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY || process.env.OPENAI_API_KEY;

const systemPrompt = `You are an assistant for NSW Transport. Extract journey details from user queries.
Return a JSON object with these fields:
- from: departure station name (exact match from NSW stations)
- to: arrival station name (exact match from NSW stations)
- mode: "train", "metro", "bus", or "ferry"
- datetime: ISO timestamp (default to now if not specified)
- needsFollowUp: boolean (true if query is ambiguous)
- followUpQuestion: string (clarifying question if needed)

Common NSW stations include: Central, Town Hall, Wynyard, Circular Quay, Kings Cross, Martin Place, St James, Museum, Redfern, Strathfield, Parramatta, Chatswood, North Sydney, Bondi Junction, Liverpool, Blacktown, Penrith, Hornsby, Hurstville, Bankstown, Epping, Macquarie Park, Castle Hill, Rouse Hill.

If the user doesn't specify a mode, default to "train" for inter-suburb travel and "metro" for CBD/Northwest stations.`;

// Simple fallback parser when API is unavailable
function parseIntentFallback(text: string) {
  console.log('🔍 Fallback parser input:', text);
  const lowerText = text.toLowerCase();
  console.log('🔍 Lowercased text:', lowerText);
  
  // Common station names to look for - expanded list
  const stations = [
    'central', 'town hall', 'wynyard', 'circular quay', 'chatswood', 'parramatta',
    'strathfield', 'north sydney', 'bondi junction', 'liverpool', 'blacktown',
    'penrith', 'hornsby', 'hurstville', 'bankstown', 'epping', 'castle hill',
    'rouse hill', 'macquarie park', 'st leonards', 'redfern', 'mascot',
    'wolli creek', 'sutherland', 'cronulla', 'campbelltown', 'burwood',
    'lidcombe', 'auburn', 'granville', 'harris park', 'westmead', 'wentworthville',
    'toongabbie', 'seven hills', 'doonside', 'rooty hill', 'mount druitt', 'st marys',
    'werrington', 'kingswood', 'emu plains', 'newtown', 'stanmore', 'petersham',
    'lewisham', 'summer hill', 'ashfield', 'homebush', 'flemington', 'olympic park',
    'kings cross', 'martin place', 'st james', 'museum', 'edgecliff', 'bondi beach',
    'waverley', 'milsons point', 'waverton', 'wollstonecraft', 'artarmon',
    'roseville', 'lindfield', 'killara', 'gordon', 'pymble', 'turramurra',
    'warrawee', 'wahroonga', 'berowra', 'mount colah', 'asquith', 'beecroft',
    'cheltenham', 'pennant hills', 'thornleigh', 'normanhurst', 'waitara',
    'eastwood', 'west ryde', 'meadowbank', 'rhodes', 'concord west', 
    'north strathfield', 'macquarie university', 'north ryde', 'cherrybrook',
    'showground', 'kellyville', 'bella vista', 'norwest', 'tallawong',
    'arncliffe', 'rockdale', 'kogarah', 'carlton', 'allawah', 'penshurst',
    'mortdale', 'oatley', 'como', 'jannali', 'gymea', 'miranda', 'caringbah',
    'woolooware', 'yagoona', 'birrong', 'regents park', 'berala', 'sefton',
    'chester hill', 'leightonfield', 'villawood', 'carramar', 'cabramatta',
    'warwick farm', 'casula', 'glenfield', 'macquarie fields', 'ingleburn',
    'minto', 'leumeah', 'green square'
  ];
  
  let from = '';
  let to = '';
  let mode = 'train';
  
  // Look for "from X to Y" pattern
  const fromToMatch = lowerText.match(/from\s+([a-z\s]+?)\s+to\s+([a-z\s]+?)(?:\s|$)/);
  console.log('🔍 From-to regex match:', fromToMatch);
  
  if (fromToMatch) {
    from = fromToMatch[1].trim();
    to = fromToMatch[2].trim();
    console.log('🔍 Extracted from regex - from:', from, 'to:', to);
  } else {
    // Look for "X to Y" pattern
    const toMatch = lowerText.match(/^([a-z\s]+?)\s+to\s+([a-z\s]+?)(?:\s|$)/);
    console.log('🔍 Simple to regex match:', toMatch);
    if (toMatch) {
      from = toMatch[1].trim();
      to = toMatch[2].trim();
      console.log('🔍 Extracted from simple regex - from:', from, 'to:', to);
    }
  }
  
  // Capitalize station names
  const capitalizeStation = (station: string) => {
    return station.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };
  
  // Find matching stations in the list
  if (from && to) {
    console.log('🔍 Searching for stations in list...');
    const fromStation = stations.find(station => 
      from.includes(station) || station.includes(from)
    );
    const toStation = stations.find(station => 
      to.includes(station) || station.includes(to)
    );
    
    console.log('🔍 Found stations - from:', fromStation, 'to:', toStation);
    
    if (fromStation && toStation) {
      const result = {
        from: capitalizeStation(fromStation),
        to: capitalizeStation(toStation),
        mode,
        datetime: new Date().toISOString(),
        needsFollowUp: false
      };
      console.log('🔍 Success! Returning:', result);
      return result;
    }
  }
  
  console.log('🔍 Pattern matching failed, returning needsFollowUp');
  return {
    needsFollowUp: true,
    followUpQuestion: 'Please specify your journey in the format: "from [station] to [station]". For example: "from Central to Parramatta"'
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }

  // If no API key, use fallback parser
  if (!PERPLEXITY_API_KEY) {
    const fallbackResult = parseIntentFallback(text);
    return res.status(200).json(fallbackResult);
  }

  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online', // Fast and cost-effective model
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text }
        ],
        temperature: 0.3,
        max_tokens: 200,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status}`);
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0]?.message?.content || '{}');
    
    // Add current datetime if not specified
    if (!result.datetime) {
      result.datetime = new Date().toISOString();
    }

    res.status(200).json(result);
  } catch (error: any) {
    console.error('Perplexity API error:', error);
    
    // Use fallback parser
    const fallbackResult = parseIntentFallback(text);
    return res.status(200).json(fallbackResult);
  }
}