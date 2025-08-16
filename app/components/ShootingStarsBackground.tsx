'use client';
import { useEffect, useState } from 'react';

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  angle: number;
  opacity: number;
  color: string;
  trail: { x: number; y: number; opacity: number }[];
}

interface ShootingStarsBackgroundProps {
  starCount?: number;
  colors?: string[];
  shootingStarCount?: number;
  className?: string;
}

export default function ShootingStarsBackground({ 
  starCount = 100,
  colors = ['#ffffff', '#e3f2fd', '#f3e5f5', '#e8f5e8', '#fff3e0'],
  shootingStarCount = 3,
  className = ''
}: ShootingStarsBackgroundProps) {
  const [stars, setStars] = useState<Star[]>([]);
  const [shootingStars, setShootingStars] = useState<Star[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return;

    // Generate static twinkling stars
    const newStars: Star[] = [];
    for (let i = 0; i < starCount; i++) {
      newStars.push({
        id: i,
        x: Math.random() * dimensions.width,
        y: Math.random() * dimensions.height,
        size: Math.random() * 3 + 1,
        speed: Math.random() * 0.5 + 0.1,
        angle: Math.random() * Math.PI * 2,
        opacity: Math.random(),
        color: colors[Math.floor(Math.random() * colors.length)],
        trail: []
      });
    }
    setStars(newStars);

    // Generate shooting stars
    const newShootingStars: Star[] = [];
    for (let i = 0; i < shootingStarCount; i++) {
      newShootingStars.push(createShootingStar(i, dimensions));
    }
    setShootingStars(newShootingStars);
  }, [dimensions, starCount, shootingStarCount, colors]);

  const createShootingStar = (id: number, dims: { width: number; height: number }): Star => {
    const startSide = Math.floor(Math.random() * 4);
    let x, y, angle;

    switch (startSide) {
      case 0: // Top
        x = Math.random() * dims.width;
        y = -50;
        angle = Math.PI / 4 + (Math.random() - 0.5) * Math.PI / 6;
        break;
      case 1: // Right
        x = dims.width + 50;
        y = Math.random() * dims.height;
        angle = Math.PI * 3/4 + (Math.random() - 0.5) * Math.PI / 6;
        break;
      case 2: // Bottom
        x = Math.random() * dims.width;
        y = dims.height + 50;
        angle = -Math.PI / 4 + (Math.random() - 0.5) * Math.PI / 6;
        break;
      default: // Left
        x = -50;
        y = Math.random() * dims.height;
        angle = Math.PI / 4 + (Math.random() - 0.5) * Math.PI / 6;
    }

    return {
      id,
      x,
      y,
      size: Math.random() * 2 + 2,
      speed: Math.random() * 3 + 4,
      angle,
      opacity: 1,
      color: colors[Math.floor(Math.random() * colors.length)],
      trail: []
    };
  };

  useEffect(() => {
    const animateStars = () => {
      setStars(prevStars => 
        prevStars.map(star => ({
          ...star,
          opacity: Math.sin(Date.now() * 0.001 + star.id) * 0.5 + 0.5
        }))
      );

      setShootingStars(prevShootingStars => 
        prevShootingStars.map(star => {
          const newX = star.x + Math.cos(star.angle) * star.speed;
          const newY = star.y + Math.sin(star.angle) * star.speed;
          
          const newTrail = [
            { x: star.x, y: star.y, opacity: star.opacity },
            ...star.trail.slice(0, 15)
          ].map((point, index) => ({
            ...point,
            opacity: point.opacity * (1 - index * 0.1)
          }));

          const isOutOfBounds = newX < -100 || newX > dimensions.width + 100 || 
                               newY < -100 || newY > dimensions.height + 100;

          if (isOutOfBounds) {
            return createShootingStar(star.id, dimensions);
          }

          return {
            ...star,
            x: newX,
            y: newY,
            trail: newTrail,
            opacity: Math.max(0, star.opacity - 0.005)
          };
        })
      );
    };

    const interval = setInterval(animateStars, 16);
    return () => clearInterval(interval);
  }, [dimensions, colors]);

  return (
    <div className={`fixed inset-0 overflow-hidden pointer-events-none ${className}`}>
      <svg
        width={dimensions.width}
        height={dimensions.height}
        className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at bottom, #0d1117 0%, #010409 100%)' }}
      >
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <filter id="shootingGlow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Static twinkling stars */}
        {stars.map(star => (
          <circle
            key={`star-${star.id}`}
            cx={star.x}
            cy={star.y}
            r={star.size}
            fill={star.color}
            opacity={star.opacity * 0.8}
            filter="url(#glow)"
          />
        ))}

        {/* Shooting stars */}
        {shootingStars.map(star => (
          <g key={`shooting-${star.id}`}>
            {/* Trail */}
            {star.trail.map((point, index) => (
              <circle
                key={`trail-${star.id}-${index}`}
                cx={point.x}
                cy={point.y}
                r={star.size * (1 - index * 0.05)}
                fill={star.color}
                opacity={point.opacity * 0.3}
                filter="url(#shootingGlow)"
              />
            ))}
            
            {/* Main shooting star */}
            <circle
              cx={star.x}
              cy={star.y}
              r={star.size}
              fill={star.color}
              opacity={star.opacity}
              filter="url(#shootingGlow)"
            />
            
            {/* Shooting star streak */}
            <line
              x1={star.x}
              y1={star.y}
              x2={star.x - Math.cos(star.angle) * 30}
              y2={star.y - Math.sin(star.angle) * 30}
              stroke={star.color}
              strokeWidth="2"
              opacity={star.opacity * 0.6}
              filter="url(#shootingGlow)"
            />
          </g>
        ))}

        {/* Nebula effect */}
        <defs>
          <radialGradient id="nebula1" cx="30%" cy="30%" r="40%">
            <stop offset="0%" stopColor="#4c1d95" stopOpacity="0.1"/>
            <stop offset="100%" stopColor="#4c1d95" stopOpacity="0"/>
          </radialGradient>
          <radialGradient id="nebula2" cx="70%" cy="60%" r="35%">
            <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.08"/>
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0"/>
          </radialGradient>
          <radialGradient id="nebula3" cx="20%" cy="80%" r="30%">
            <stop offset="0%" stopColor="#1e40af" stopOpacity="0.06"/>
            <stop offset="100%" stopColor="#1e40af" stopOpacity="0"/>
          </radialGradient>
        </defs>
        
        <rect width="100%" height="100%" fill="url(#nebula1)" />
        <rect width="100%" height="100%" fill="url(#nebula2)" />
        <rect width="100%" height="100%" fill="url(#nebula3)" />

        {/* Constellation lines */}
        <defs>
          <pattern id="constellation" patternUnits="userSpaceOnUse" width="300" height="300">
            <line x1="50" y1="50" x2="150" y2="100" stroke="#4c1d95" strokeWidth="0.5" opacity="0.3"/>
            <line x1="150" y1="100" x2="200" y2="200" stroke="#4c1d95" strokeWidth="0.5" opacity="0.3"/>
            <line x1="100" y1="150" x2="250" y2="150" stroke="#4c1d95" strokeWidth="0.5" opacity="0.3"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#constellation)" opacity="0.4" />
      </svg>
    </div>
  );
} 