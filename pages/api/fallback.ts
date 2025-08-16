import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

// This is a simplified fallback for offline mode
// In production, you would load actual GTFS data
const fallbackSchedules = {
  'Central-Parramatta': [
    { depart: '06:00', arrive: '06:30', platform: '16' },
    { depart: '06:15', arrive: '06:45', platform: '16' },
    { depart: '06:30', arrive: '07:00', platform: '16' },
    { depart: '07:00', arrive: '07:30', platform: '16' },
    { depart: '07:15', arrive: '07:45', platform: '16' },
    { depart: '07:30', arrive: '08:00', platform: '16' },
    { depart: '08:00', arrive: '08:30', platform: '16' },
    { depart: '08:15', arrive: '08:45', platform: '16' },
    { depart: '08:30', arrive: '09:00', platform: '16' },
  ],
  'Central-Chatswood': [
    { depart: '06:05', arrive: '06:25', platform: '12' },
    { depart: '06:20', arrive: '06:40', platform: '12' },
    { depart: '06:35', arrive: '06:55', platform: '12' },
    { depart: '07:05', arrive: '07:25', platform: '12' },
    { depart: '07:20', arrive: '07:40', platform: '12' },
    { depart: '07:35', arrive: '07:55', platform: '12' },
    { depart: '08:05', arrive: '08:25', platform: '12' },
    { depart: '08:20', arrive: '08:40', platform: '12' },
    { depart: '08:35', arrive: '08:55', platform: '12' },
  ],
  'Town Hall-Bondi Junction': [
    { depart: '06:10', arrive: '06:25', platform: '3' },
    { depart: '06:25', arrive: '06:40', platform: '3' },
    { depart: '06:40', arrive: '06:55', platform: '3' },
    { depart: '07:10', arrive: '07:25', platform: '3' },
    { depart: '07:25', arrive: '07:40', platform: '3' },
    { depart: '07:40', arrive: '07:55', platform: '3' },
    { depart: '08:10', arrive: '08:25', platform: '3' },
    { depart: '08:25', arrive: '08:40', platform: '3' },
    { depart: '08:40', arrive: '08:55', platform: '3' },
  ]
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { from, to } = req.body;

  if (!from || !to) {
    return res.status(400).json({ error: 'From and to stations are required' });
  }

  // Try to find a matching route
  const routeKey = `${from}-${to}`;
  const reverseRouteKey = `${to}-${from}`;
  
  let schedules = fallbackSchedules[routeKey as keyof typeof fallbackSchedules];
  let isReverse = false;

  if (!schedules) {
    schedules = fallbackSchedules[reverseRouteKey as keyof typeof fallbackSchedules];
    isReverse = true;
  }

  if (!schedules) {
    // Return generic schedule for unknown routes
    schedules = Array.from({ length: 9 }, (_, i) => {
      const hour = 6 + Math.floor(i / 3);
      const minute = (i % 3) * 20;
      const departTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const arriveHour = hour;
      const arriveMinute = minute + 30;
      const arriveTime = `${arriveHour.toString().padStart(2, '0')}:${arriveMinute.toString().padStart(2, '0')}`;
      
      return {
        depart: departTime,
        arrive: arriveTime,
        platform: 'TBA'
      };
    });
  }

  // Get current time
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Filter schedules to show only future departures
  const futureSchedules = schedules.filter(schedule => {
    const [depHour, depMin] = schedule.depart.split(':').map(Number);
    const depMinutes = depHour * 60 + depMin;
    return depMinutes >= currentMinutes;
  });

  // If no future schedules today, show tomorrow's first schedules
  const results = (futureSchedules.length > 0 ? futureSchedules : schedules.slice(0, 3)).map(schedule => {
    const today = new Date();
    const [depHour, depMin] = schedule.depart.split(':').map(Number);
    const [arrHour, arrMin] = schedule.arrive.split(':').map(Number);
    
    const departureTime = new Date(today);
    departureTime.setHours(depHour, depMin, 0, 0);
    
    const arrivalTime = new Date(today);
    arrivalTime.setHours(arrHour, arrMin, 0, 0);
    
    // If no future schedules, show tomorrow's times
    if (futureSchedules.length === 0) {
      departureTime.setDate(departureTime.getDate() + 1);
      arrivalTime.setDate(arrivalTime.getDate() + 1);
    }

    return {
      departureTime: departureTime.toISOString(),
      arrivalTime: arrivalTime.toISOString(),
      duration: Math.floor((arrivalTime.getTime() - departureTime.getTime()) / 60000),
      changes: 0,
      legs: [{
        mode: 'train',
        line: 'T1 North Shore & Western Line',
        departure: {
          time: departureTime.toISOString(),
          platform: isReverse ? 'TBA' : schedule.platform,
          stop: from
        },
        arrival: {
          time: arrivalTime.toISOString(),
          platform: 'TBA',
          stop: to
        }
      }]
    };
  });

  res.status(200).json({
    results,
    from,
    to,
    mode: 'train',
    timestamp: new Date().toISOString(),
    cached: true,
    offline: true
  });
}
