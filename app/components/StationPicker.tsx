'use client';
import { useState, useEffect } from 'react';
import stations from '../../public/stations/station-list.json';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { MapPin, Navigation, Train, Bus, Waves, Search } from 'lucide-react';
import { cn } from '../lib/utils';

type TransportMode = 'train' | 'metro' | 'bus' | 'ferry';

interface StationPickerProps {
  onSearch?: (from: string, to: string, mode: TransportMode) => void;
  selectedFrom?: string;
  selectedTo?: string;
  selectedMode?: TransportMode;
}

const modeOptions = [
  { value: 'train' as TransportMode, label: 'Train', icon: Train },
  { value: 'metro' as TransportMode, label: 'Metro', icon: Train },
  { value: 'bus' as TransportMode, label: 'Bus', icon: Bus },
  { value: 'ferry' as TransportMode, label: 'Ferry', icon: Waves },
];

export default function StationPicker({ 
  onSearch, 
  selectedFrom = '', 
  selectedTo = '', 
  selectedMode = 'train' 
}: StationPickerProps) {
  const [from, setFrom] = useState(selectedFrom);
  const [to, setTo] = useState(selectedTo);
  const [via, setVia] = useState('');
  const [mode, setMode] = useState<TransportMode>(selectedMode);
  const [showVia, setShowVia] = useState(false);

  // Update internal state when external props change
  useEffect(() => {
    setFrom(selectedFrom);
    setTo(selectedTo);
    setMode(selectedMode);
  }, [selectedFrom, selectedTo, selectedMode]);

  const handleSearch = () => {
    if (from && to && onSearch) {
      onSearch(from, to, mode);
    }
  };

  const handleSwap = () => {
    const newFrom = to;
    const newTo = from;
    setFrom(newFrom);
    setTo(newTo);
    
    // Automatically search after swap if both stations are selected
    if (newFrom && newTo && onSearch) {
      onSearch(newFrom, newTo, mode);
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Train className="h-5 w-5" />
          Plan Your Journey
        </CardTitle>
        <CardDescription>
          Find the best routes for your NSW transport journey
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Transport Mode Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Transport Mode</label>
          <div className="grid grid-cols-4 gap-2">
            {modeOptions.map(({ value, label, icon: Icon }) => (
              <Button
                key={value}
                variant={mode === value ? "default" : "outline"}
                size="sm"
                onClick={() => setMode(value)}
                className="flex-col gap-1 h-auto py-2"
              >
                <Icon className="h-4 w-4" />
                <span className="text-xs">{label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* From Station */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Navigation className="h-4 w-4 text-muted-foreground" />
            From Station
          </label>
          <Select value={from} onValueChange={setFrom}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select departure station" />
            </SelectTrigger>
            <SelectContent>
              {stations.map((station: any, index: number) => (
                <SelectItem key={`${station.code}-${station.name}-${index}`} value={station.name}>
                  {station.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Optional Via Station */}
        {showVia && (
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              Via Station (Optional)
            </label>
            <div className="flex gap-2">
              <Select value={via} onValueChange={setVia}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select intermediate station" />
                </SelectTrigger>
                <SelectContent>
                  {stations.map((station: any, index: number) => (
                    <SelectItem key={`via-${station.code}-${station.name}-${index}`} value={station.name}>
                      {station.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {via && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setVia('')}
                  className="px-3"
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Toggle Via Station */}
        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowVia(!showVia)}
            className="hover:bg-primary/10 text-xs"
          >
            {showVia ? 'Hide' : 'Add'} Via Station
          </Button>
        </div>
        
        {/* Swap Button */}
        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSwap}
            className="hover:bg-primary/10"
            disabled={!from || !to}
          >
            <svg
              className="h-4 w-4 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
              />
            </svg>
            <span className="ml-2">Swap stations</span>
          </Button>
        </div>

        {/* To Station */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            To Station
          </label>
          <Select value={to} onValueChange={setTo}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select arrival station" />
            </SelectTrigger>
            <SelectContent>
              {stations.map((station: any, index: number) => (
                <SelectItem key={`${station.code}-${station.name}-${index}`} value={station.name}>
                  {station.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Search Button */}
        <Button 
          onClick={handleSearch} 
          className="w-full"
          disabled={!from || !to}
        >
          <Search className="mr-2 h-4 w-4" />
          Search {mode === 'train' ? 'Trains' : mode === 'metro' ? 'Metro' : mode === 'bus' ? 'Buses' : 'Ferries'}
        </Button>
      </CardContent>
    </Card>
  );
}
