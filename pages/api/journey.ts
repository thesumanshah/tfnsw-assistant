import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const TFNSW_API_KEY = process.env.TFNSW_API_KEY || process.env.NEXT_PUBLIC_TFNSW_API_KEY;
const TFNSW_API_URL = 'https://api.transport.nsw.gov.au/v1/tp/trip';

interface JourneyRequest {
  from: string;
  to: string;
  mode: 'train' | 'metro' | 'bus' | 'ferry';
  datetime?: string;
}

interface StopCoordinates {
  [key: string]: { lat: number; lng: number };
}

// Basic station coordinates (expand this list)
const stationCoordinates: StopCoordinates = {
  // CBD & Inner City
  'Central': { lat: -33.8833, lng: 151.2056 },
  'Town Hall': { lat: -33.8736, lng: 151.2071 },
  'Wynyard': { lat: -33.8657, lng: 151.2056 },
  'Circular Quay': { lat: -33.8615, lng: 151.2119 },
  'St James': { lat: -33.8708, lng: 151.2128 },
  'Museum': { lat: -33.8744, lng: 151.2128 },
  'Martin Place': { lat: -33.8673, lng: 151.2103 },
  'Kings Cross': { lat: -33.8756, lng: 151.2225 },
  'Redfern': { lat: -33.8933, lng: 151.2033 },
  'Green Square': { lat: -33.9123, lng: 151.2067 },
  'Mascot': { lat: -33.9264, lng: 151.1958 },
  'Wolli Creek': { lat: -33.9278, lng: 151.1544 },
  
  // Eastern Suburbs
  'Edgecliff': { lat: -33.8772, lng: 151.2394 },
  'Bondi Junction': { lat: -33.8916, lng: 151.2478 },
  'Waverley': { lat: -33.9033, lng: 151.2567 },
  'Bronte': { lat: -33.9042, lng: 151.2667 },
  'Tamarama': { lat: -33.9056, lng: 151.2700 },
  'Bondi Beach': { lat: -33.8915, lng: 151.2767 },
  
  // North Shore
  'North Sydney': { lat: -33.8424, lng: 151.2067 },
  'Milsons Point': { lat: -33.8456, lng: 151.2114 },
  'Waverton': { lat: -33.8378, lng: 151.2019 },
  'Wollstonecraft': { lat: -33.8314, lng: 151.1986 },
  'St Leonards': { lat: -33.8247, lng: 151.1975 },
  'Artarmon': { lat: -33.8089, lng: 151.1856 },
  'Chatswood': { lat: -33.7969, lng: 151.1828 },
  'Roseville': { lat: -33.7836, lng: 151.1814 },
  'Lindfield': { lat: -33.7786, lng: 151.1719 },
  'Killara': { lat: -33.7681, lng: 151.1631 },
  'Gordon': { lat: -33.7564, lng: 151.1544 },
  'Pymble': { lat: -33.7444, lng: 151.1442 },
  'Turramurra': { lat: -33.7367, lng: 151.1314 },
  'Warrawee': { lat: -33.7281, lng: 151.1217 },
  'Wahroonga': { lat: -33.7181, lng: 151.1158 },
  'Hornsby': { lat: -33.7030, lng: 151.0985 },
  
  // Inner West
  'Newtown': { lat: -33.8978, lng: 151.1797 },
  'Macdonaldtown': { lat: -33.8983, lng: 151.1731 },
  'Stanmore': { lat: -33.8958, lng: 151.1656 },
  'Petersham': { lat: -33.8950, lng: 151.1567 },
  'Lewisham': { lat: -33.8967, lng: 151.1492 },
  'Summer Hill': { lat: -33.8942, lng: 151.1403 },
  'Ashfield': { lat: -33.8886, lng: 151.1289 },
  'Burwood': { lat: -33.8828, lng: 151.1042 },
  'Strathfield': { lat: -33.8736, lng: 151.0942 },
  'Homebush': { lat: -33.8642, lng: 151.0825 },
  'Flemington': { lat: -33.8586, lng: 151.0714 },
  'Lidcombe': { lat: -33.8644, lng: 151.0431 },
  'Auburn': { lat: -33.8489, lng: 151.0325 },
  'Granville': { lat: -33.8306, lng: 151.0114 },
  'Clyde': { lat: -33.8269, lng: 151.0094 },
  'Parramatta': { lat: -33.8151, lng: 151.0012 },
  'Harris Park': { lat: -33.8208, lng: 150.9906 },
  'Westmead': { lat: -33.8072, lng: 150.9881 },
  'Wentworthville': { lat: -33.8067, lng: 150.9711 },
  'Toongabbie': { lat: -33.7886, lng: 150.9481 },
  'Seven Hills': { lat: -33.7742, lng: 150.9350 },
  'Blacktown': { lat: -33.7692, lng: 150.9051 },
  'Doonside': { lat: -33.7594, lng: 150.8700 },
  'Rooty Hill': { lat: -33.7658, lng: 150.8436 },
  'Mount Druitt': { lat: -33.7683, lng: 150.8181 },
  'St Marys': { lat: -33.7700, lng: 150.7744 },
  'Werrington': { lat: -33.7533, lng: 150.7506 },
  'Kingswood': { lat: -33.7533, lng: 150.7267 },
  'Penrith': { lat: -33.7507, lng: 150.6956 },
  
  // Southern Line
  'Arncliffe': { lat: -33.9378, lng: 151.1467 },
  'Rockdale': { lat: -33.9531, lng: 151.1397 },
  'Kogarah': { lat: -33.9653, lng: 151.1339 },
  'Carlton': { lat: -33.9700, lng: 151.1256 },
  'Allawah': { lat: -33.9739, lng: 151.1156 },
  'Hurstville': { lat: -33.9680, lng: 151.1036 },
  'Penshurst': { lat: -33.9658, lng: 151.0872 },
  'Mortdale': { lat: -33.9736, lng: 151.0725 },
  'Oatley': { lat: -33.9831, lng: 151.0756 },
  'Como': { lat: -33.9983, lng: 151.0653 },
  'Jannali': { lat: -34.0208, lng: 151.0653 },
  'Sutherland': { lat: -34.0308, lng: 151.0583 },
  'Gymea': { lat: -34.0358, lng: 151.0856 },
  'Miranda': { lat: -34.0347, lng: 151.1022 },
  'Caringbah': { lat: -34.0417, lng: 151.1239 },
  'Woolooware': { lat: -34.0444, lng: 151.1431 },
  'Cronulla': { lat: -34.0561, lng: 151.1522 },
  
  // Bankstown Line
  'Bankstown': { lat: -33.9181, lng: 150.9347 },
  'Yagoona': { lat: -33.9072, lng: 151.0203 },
  'Birrong': { lat: -33.8944, lng: 151.0150 },
  'Regents Park': { lat: -33.8847, lng: 151.0289 },
  'Berala': { lat: -33.8708, lng: 151.0311 },
  'Sefton': { lat: -33.8797, lng: 151.0097 },
  'Chester Hill': { lat: -33.8697, lng: 150.9944 },
  'Leightonfield': { lat: -33.8683, lng: 150.9822 },
  'Villawood': { lat: -33.8681, lng: 150.9744 },
  'Carramar': { lat: -33.8650, lng: 150.9583 },
  'Cabramatta': { lat: -33.8942, lng: 150.9364 },
  'Warwick Farm': { lat: -33.9128, lng: 150.9361 },
  'Liverpool': { lat: -33.9242, lng: 150.9239 },
  'Casula': { lat: -33.9506, lng: 150.9086 },
  'Glenfield': { lat: -33.9714, lng: 150.8919 },
  'Macquarie Fields': { lat: -33.9861, lng: 150.8736 },
  'Ingleburn': { lat: -34.0042, lng: 150.8608 },
  'Minto': { lat: -34.0264, lng: 150.8453 },
  'Leumeah': { lat: -34.0531, lng: 150.8381 },
  'Campbelltown': { lat: -34.0639, lng: 150.8142 },
  
  // Blue Mountains
  'Emu Plains': { lat: -33.7517, lng: 150.6708 },
  'Leonay': { lat: -33.7486, lng: 150.6467 },
  'Faulconbridge': { lat: -33.7003, lng: 150.5414 },
  'Springwood': { lat: -33.7014, lng: 150.5508 },
  'Valley Heights': { lat: -33.7097, lng: 150.5269 },
  'Katoomba': { lat: -33.7128, lng: 150.3119 },
  'Leura': { lat: -33.7131, lng: 150.3333 },
  'Wentworth Falls': { lat: -33.7067, lng: 150.3756 },
  'Bullaburra': { lat: -33.7331, lng: 150.4156 },
  'Lawson': { lat: -33.7256, lng: 150.4297 },
  'Hazelbrook': { lat: -33.7275, lng: 150.4558 },
  'Woodford': { lat: -33.7314, lng: 150.4747 },
  'Linden': { lat: -33.7336, lng: 150.4958 },
  'Glenbrook': { lat: -33.7728, lng: 150.6239 },
  'Blaxland': { lat: -33.7447, lng: 150.6069 },
  'Warrimoo': { lat: -33.7250, lng: 150.5969 },
  'Sun Valley': { lat: -33.7128, lng: 150.5853 },
  'Winmalee': { lat: -33.6856, lng: 150.5931 },
  'Hawkesbury River': { lat: -33.5514, lng: 150.9981 },
  'Wondabyne': { lat: -33.4997, lng: 151.2272 },
  'Cowan': { lat: -33.5992, lng: 151.1481 },
  'Berowra': { lat: -33.6264, lng: 151.1506 },
  'Mount Kuring-gai': { lat: -33.6536, lng: 151.1372 },
  'Mount Colah': { lat: -33.6753, lng: 151.1203 },
  'Asquith': { lat: -33.6906, lng: 151.1103 },
  'Beecroft': { lat: -33.7489, lng: 151.0675 },
  'Cheltenham': { lat: -33.7600, lng: 151.0811 },
  'Pennant Hills': { lat: -33.7381, lng: 151.0736 },
  'Thornleigh': { lat: -33.7314, lng: 151.0792 },
  'Normanhurst': { lat: -33.7208, lng: 151.0947 },
  'Waitara': { lat: -33.7089, lng: 151.1044 },
  
  // Metro Northwest
  'Epping': { lat: -33.7725, lng: 151.0818 },
  'Eastwood': { lat: -33.7897, lng: 151.0814 },
  'Denistone East': { lat: -33.7939, lng: 151.0931 },
  'West Ryde': { lat: -33.8053, lng: 151.0944 },
  'Meadowbank': { lat: -33.8158, lng: 151.0911 },
  'Rhodes': { lat: -33.8283, lng: 151.0861 },
  'Concord West': { lat: -33.8497, lng: 151.0864 },
  'North Strathfield': { lat: -33.8556, lng: 151.0944 },
  'Macquarie University': { lat: -33.7742, lng: 151.1117 },
  'Macquarie Park': { lat: -33.7769, lng: 151.1239 },
  'North Ryde': { lat: -33.7975, lng: 151.1261 },
  'Cherrybrook': { lat: -33.7278, lng: 151.0497 },
  'Castle Hill': { lat: -33.7314, lng: 151.0039 },
  'Showground': { lat: -33.7369, lng: 150.9842 },
  'Kellyville': { lat: -33.7169, lng: 150.9642 },
  'Rouse Hill': { lat: -33.6831, lng: 150.9147 },
  'Bella Vista': { lat: -33.7339, lng: 150.9508 },
  'Norwest': { lat: -33.7286, lng: 150.9789 },
  'Tallawong': { lat: -33.6789, lng: 150.9061 },
  
  // Illawarra Line
  'Helensburgh': { lat: -34.1772, lng: 150.9933 },
  'Otford': { lat: -34.2108, lng: 151.0069 },
  'Stanwell Park': { lat: -34.2222, lng: 150.9897 },
  'Coalcliff': { lat: -34.2353, lng: 150.9694 },
  'Scarborough': { lat: -34.2497, lng: 150.9408 },
  'Wombarra': { lat: -34.2686, lng: 150.9292 },
  'Coledale': { lat: -34.2936, lng: 150.9347 },
  'Austinmer': { lat: -34.3081, lng: 150.9314 },
  'Thirroul': { lat: -34.3156, lng: 150.9217 },
  'Bulli': { lat: -34.3394, lng: 150.9181 },
  'Woonona': { lat: -34.3469, lng: 150.9047 },
  'Bellambi': { lat: -34.3683, lng: 150.9089 },
  'Corrimal': { lat: -34.3742, lng: 150.9000 },
  'Towradgi': { lat: -34.3856, lng: 150.9058 },
  'Fairy Meadow': { lat: -34.3958, lng: 150.9031 },
  'North Wollongong': { lat: -34.4086, lng: 150.8931 },
  'Wollongong': { lat: -34.4242, lng: 150.8931 },
  'Coniston': { lat: -34.4544, lng: 150.8825 },
  'Spring Hill': { lat: -34.4728, lng: 150.8708 },
  'Unanderra': { lat: -34.4583, lng: 150.8361 },
  'Kembla Grange': { lat: -34.4758, lng: 150.8144 },
  'Dapto': { lat: -34.4986, lng: 150.7925 },
  'Albion Park': { lat: -34.5656, lng: 150.7831 },
  'Bomaderry': { lat: -34.8306, lng: 150.6089 },
  'Kiama': { lat: -34.6706, lng: 150.8542 },
  'Gerringong': { lat: -34.7400, lng: 150.8281 },
  'Berry': { lat: -34.7706, lng: 150.6944 },
  'Nowra': { lat: -34.8706, lng: 150.6014 },
  
  // Additional stations
  'Merrylands': { lat: -33.8325, lng: 150.9881 },
  'Guildford': { lat: -33.8653, lng: 150.9878 },
  'Telopea': { lat: -33.7956, lng: 151.0331 },
  'Dundas': { lat: -33.7928, lng: 151.0522 },
  'Camellia': { lat: -33.8167, lng: 151.0228 },
  'Rosehill': { lat: -33.8200, lng: 151.0156 }
};

const getModeCode = (mode: string): number => {
  switch (mode) {
    case 'train': return 1;
    case 'ferry': return 9;
    case 'bus': return 5;
    case 'metro': return 11;
    default: return 1;
  }
};

const parseApiResponse = (apiData: any, from: string, to: string, mode: string) => {
  try {
    const journeys = apiData?.journeys || [];
    console.log(`Found ${journeys.length} journeys to parse`);
    
    return journeys.slice(0, 5).map((journey: any, index: number) => {
      const legs = journey.legs || [];
      console.log(`Journey ${index + 1}: ${legs.length} legs`);
      
      // Debug each leg
      legs.forEach((leg: any, legIndex: number) => {
        const isWalking = leg.transportation?.product?.class === 100;
        const isTrainClass = leg.transportation?.product?.class === 1;
        const nameOrDesc = (leg.transportation?.product?.name || leg.transportation?.description || '').toString();
        const isTrainByName = /train/i.test(nameOrDesc);
        let transportType = 'unknown';
        
        if (isWalking) {
          transportType = 'walking';
        } else if (isTrainClass || isTrainByName) {
          transportType = leg.transportation?.product?.name || leg.transportation?.description || 'train';
        } else {
          transportType = leg.transportation?.product?.name || leg.transportation?.description || 'other';
        }
        
        console.log(`  Leg ${legIndex + 1}:`, {
          transportation: transportType,
          platform: leg.origin?.platform || leg.destination?.platform,
          class: leg.transportation?.product?.class
        });
        
        // Debug platform information in detail for transport legs
        if (leg.transportation && (isTrainClass || isTrainByName)) {
          console.log(`    Train leg - Origin platform info:`, {
            platform: leg.origin?.platform,
            platformName: leg.origin?.platformName,
            properties: leg.origin?.properties,
            allOriginFields: Object.keys(leg.origin || {})
          });
          console.log(`    Train leg - Destination platform info:`, {
            platform: leg.destination?.platform,
            platformName: leg.destination?.platformName,
            properties: leg.destination?.properties,
            allDestFields: Object.keys(leg.destination || {})
          });
        }
      });
      
      // Find train transport legs only (exclude walking and others)
      const transportLegs = legs.filter((leg: any) => {
        if (!leg.transportation) return false;
        const productClass = leg.transportation.product?.class;
        const nameOrDesc = (leg.transportation.product?.name || leg.transportation.description || '').toString();
        return productClass === 1 || /train/i.test(nameOrDesc);
      });
      
      console.log(`  Transport legs: ${transportLegs.length}, Total legs: ${legs.length}`);
      
      const firstLeg = legs[0] || {};
      const lastLeg = legs[legs.length - 1] || {};

      // Train legs we will use for times and platforms
      const firstTrainLeg = transportLegs[0];
      const lastTrainLeg = transportLegs[transportLegs.length - 1];

      // If no train legs, skip this journey
      if (!firstTrainLeg || !lastTrainLeg) {
        return null;
      }
      
      // Extract departure/arrival times from TRAIN legs (not walking)
      const trainDepartureTime = firstTrainLeg.origin?.departureTimeEstimated ||
                                 firstTrainLeg.origin?.departureTimePlanned;
      
      const trainArrivalTime = lastTrainLeg.destination?.arrivalTimeEstimated ||
                               lastTrainLeg.destination?.arrivalTimePlanned;
      
      // Calculate duration in minutes based on TRAIN segment only
      let durationMin = 0;
      if (trainDepartureTime && trainArrivalTime) {
        const depTime = new Date(trainDepartureTime);
        const arrTime = new Date(trainArrivalTime);
        durationMin = Math.round((arrTime.getTime() - depTime.getTime()) / 60000);
      } else if (journey.duration) {
        durationMin = journey.duration > 1000 ? Math.round(journey.duration / 60) : journey.duration;
      }
      
      // Extract platform information from train leg only (no guessing)
      const trainLeg = firstTrainLeg;
      
      const rawDeparturePlatform = trainLeg?.origin?.platform || 
                                   trainLeg?.origin?.platformName ||
                                   trainLeg?.origin?.properties?.platform ||
                                   trainLeg?.origin?.properties?.RealtimeTripUpdate?.platform ||
                                   trainLeg?.transportation?.origin?.platform ||
                                   trainLeg?.properties?.platform ||
                                   trainLeg?.stopSequence?.[0]?.platform ||
                                   null;
      
      const rawArrivalPlatform = trainLeg?.destination?.platform || 
                                 trainLeg?.destination?.platformName ||
                                 trainLeg?.destination?.properties?.platform ||
                                 trainLeg?.destination?.properties?.RealtimeTripUpdate?.platform ||
                                 trainLeg?.transportation?.destination?.platform ||
                                 trainLeg?.properties?.platform ||
                                 trainLeg?.stopSequence?.[trainLeg?.stopSequence?.length - 1]?.platform ||
                                 null;

      // Normalize platform values to numbers only (strip prefixes like CE)
      const toNumericPlatform = (value: any): string | undefined => {
        if (value === null || value === undefined) return undefined;
        const str = String(value);
        const match = str.match(/\d+/);
        return match ? match[0] : undefined;
      };

      const departurePlatform = toNumericPlatform(rawDeparturePlatform);
      const arrivalPlatform = toNumericPlatform(rawArrivalPlatform);

      // Count actual train service changes (not walking)
      const trainLegs = transportLegs.filter((leg: any) => 
        leg.transportation && (leg.transportation?.product?.class === 1 || /train/i.test((leg.transportation?.product?.name || leg.transportation?.description || '').toString()))
      );
      const changes = Math.max(0, trainLegs.length - 1);

      // Get main service information from the train leg
      let lineName = 'Sydney Trains';
      if (trainLeg?.transportation) {
        lineName = trainLeg.transportation.product?.name || 
                  trainLeg.transportation.product?.line || 
                  trainLeg.transportation.disassembledName || 
                  trainLeg.transportation.description || 
                  'Sydney Trains';
        if (lineName.includes('Network')) lineName = 'Sydney Trains';
      }

      return {
        departureTime: trainDepartureTime,
        arrivalTime: trainArrivalTime,
        duration: durationMin,
        changes: changes,
        isQuickest: index === 0,
        legs: [{
          mode: mode,
          line: lineName,
          departure: {
            time: trainDepartureTime,
            ...(departurePlatform ? { platform: `${departurePlatform}` } : {}),
            stop: from
          },
          arrival: {
            time: trainArrivalTime,
            ...(arrivalPlatform ? { platform: `${arrivalPlatform}` } : {}),
            stop: to
          }
        }]
      };
    }).filter((journey: any) => journey && journey.departureTime && journey.arrivalTime); // Only valid journeys
  } catch (error) {
    console.error('Error parsing API response:', error);
    return [];
  }
};

const normalizeStation = (name: string) =>
  name
    .toLowerCase()
    .replace(/\bstation\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

const resolveStationCoords = (name: string) => {
  if (!name) return undefined;
  // direct match first
  if (stationCoordinates[name]) return stationCoordinates[name];
  const norm = normalizeStation(name);
  for (const key of Object.keys(stationCoordinates)) {
    if (normalizeStation(key) === norm) {
      return stationCoordinates[key];
    }
  }
  return undefined;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { from, to, mode = 'train', datetime } = req.body as JourneyRequest;

  if (!from || !to) {
    return res.status(400).json({ error: 'From and to stations are required' });
  }

  if (!TFNSW_API_KEY) {
    return res.status(500).json({ error: 'TfNSW API key not configured' });
  }

  const fromCoords = resolveStationCoords(from);
  const toCoords = resolveStationCoords(to);

  if (!fromCoords || !toCoords) {
    return res.status(400).json({ error: 'Invalid station names' });
  }

  try {
    console.log(`Making TfNSW API request: ${from} (${fromCoords.lat}, ${fromCoords.lng}) to ${to} (${toCoords.lat}, ${toCoords.lng}) via ${mode}`);
    
    const requestTime = datetime ? new Date(datetime) : new Date();
    
    // Use Australia/Sydney timezone for date/time to avoid region-based "no results" issues
    const dt = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Australia/Sydney',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).formatToParts(requestTime);
    const get = (type: string) => dt.find(p => p.type === type)?.value || '';
    const itdDate = `${get('year')}${get('month')}${get('day')}`;
    const itdTime = `${get('hour')}${get('minute')}${get('second')}`;
    
    // Try using coordinates instead since station names aren't being recognized
    const params = {
      outputFormat: 'rapidJSON',
      depArrMacro: 'dep',
      itdDate,
      itdTime,
      type_origin: 'coord',
      name_origin: `${fromCoords.lng}:${fromCoords.lat}:EPSG:4326`,
      type_destination: 'coord', 
      name_destination: `${toCoords.lng}:${toCoords.lat}:EPSG:4326`,
      calcNumberOfTrips: 5,
      ptOptionsActive: 1,
      coordOutputFormat: 'EPSG:4326',
      // Add transport mode parameters for trains
      trITMOT: 1, // Include trains
      routeType: 'LEASTTIME'
    };

    console.log('API Request params:', params);

    const response = await axios.get(TFNSW_API_URL, {
      params,
      headers: {
        'Authorization': `apikey ${TFNSW_API_KEY}`,
        'Accept': 'application/json',
        'Accept-Language': 'en-AU,en;q=0.9',
        'User-Agent': 'tfnsw-assistant/1.0 (+https://transport-nsw-chatbot.vercel.app)'
      },
      timeout: 15000
    });

    console.log('TfNSW API Response Status:', response.status);
    
    if (response.status === 200 && response.data) {
      // Add debugging to see what we're getting
      console.log('API Response sample:', JSON.stringify(response.data, null, 2).substring(0, 1000));
      
      const parsedResults = parseApiResponse(response.data, from, to, mode);
      
      if (parsedResults.length > 0) {
        const responseData = {
          results: parsedResults,
          from,
          to,
          mode,
          timestamp: new Date().toISOString(),
          source: 'tfnsw-api'
        };

        console.log(`Returning ${parsedResults.length} real-time journeys from TfNSW API`);
        return res.status(200).json(responseData);
      }
    }

    // If API returns no results, provide a helpful message
    console.log('TfNSW API returned no journey results');
    return res.status(200).json({
      results: [],
      from,
      to,
      mode,
      timestamp: new Date().toISOString(),
      message: 'No journey options found for this route at this time',
      source: 'tfnsw-api-empty'
    });

  } catch (error: any) {
    console.error('TfNSW API error:', error.message);
    console.error('Error details:', error.response?.data || error);
    
    // Return error information only. Do not fabricate journeys.
    return res.status(503).json({
      error: 'Unable to fetch real-time journey information',
      details: error.message,
      upstreamStatus: error.response?.status || null,
      from,
      to,
      mode,
      timestamp: new Date().toISOString(),
      message: 'The transport API is currently unavailable. Please try again later.'
    });
  }
}
