'use client';
import { useState, useRef } from 'react';
import ChatWindow from './components/ChatWindow';
import StationPicker from './components/StationPicker';
import OfflineIndicator from './components/OfflineIndicator';
import ShootingStarsBackground from './components/ShootingStarsBackground';
import { Train } from 'lucide-react';

export default function Home() {
  const [selectedStations, setSelectedStations] = useState({
    from: '',
    to: '',
    mode: 'train' as 'train' | 'metro' | 'bus' | 'ferry'
  });
  const [externalQuery, setExternalQuery] = useState<any>(null);
  const chatWindowRef = useRef<any>(null);

  const handleStationSelect = (from: string, to: string, mode: string) => {
    setSelectedStations({ from, to, mode: mode as any });
  };

  const handleSearch = (from: string, to: string, mode: 'train' | 'metro' | 'bus' | 'ferry') => {
    setExternalQuery({ from, to, mode, timestamp: Date.now() });
  };

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Shooting Stars Background */}
      <ShootingStarsBackground 
        starCount={150}
        shootingStarCount={4}
        colors={['#ffffff', '#e3f2fd', '#f3e5f5', '#e8f5e8', '#fff3e0', '#fce4ec']}
      />
      
      {/* Content Layer */}
      <div className="relative z-10">
        <div className="container mx-auto p-4 max-w-7xl">
          <header className="flex items-center justify-between mb-8 py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20 text-primary backdrop-blur-sm border border-primary/20">
                <Train className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">NSW Train Assistant</h1>
                <p className="text-sm text-gray-300">Your AI-powered travel companion</p>
              </div>
            </div>
            <OfflineIndicator />
          </header>
          
          <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
            <div className="space-y-6">
              <ChatWindow 
                ref={chatWindowRef}
                onStationSelect={handleStationSelect}
                externalQuery={externalQuery}
              />
            </div>
            
            <div className="space-y-6">
              <StationPicker 
                onSearch={handleSearch}
                selectedFrom={selectedStations.from}
                selectedTo={selectedStations.to}
                selectedMode={selectedStations.mode}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
