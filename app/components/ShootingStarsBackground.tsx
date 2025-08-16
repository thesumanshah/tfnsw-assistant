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
  const [isMounted, setIsMounted] = useState(false);

  // Prevent hydration mismatch by only mounting on client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [isMounted]);

  useEffect(() => {
    if (!isMounted || dimensions.width === 0 || dimensions.height === 0) return;

    // Use seeded random for consistent server/client rendering
    let seed = 123456789;
    const seededRandom = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    // Generate static twinkling stars
    const newStars: Star[] = [];
    for (let i = 0; i < starCount; i++) {
      newStars.push({
        id: i,
        x: seededRandom() * dimensions.width,
        y: seededRandom() * dimensions.height,
        size: seededRandom() * 3 + 1,
        speed: seededRandom() * 0.5 + 0.1,
        angle: seededRandom() * Math.PI * 2,
        opacity: seededRandom(),
        color: colors[Math.floor(seededRandom() * colors.length)],
        trail: []
      });
    }
    setStars(newStars);

    // Generate shooting stars
    const newShootingStars: Star[] = [];
    for (let i = 0; i < shootingStarCount; i++) {
      newShootingStars.push(createShootingStar(i, dimensions, seededRandom));
    }
    setShootingStars(newShootingStars);
  }, [dimensions, starCount, shootingStarCount, colors, isMounted]);

  const createShootingStar = (id: number, dims: { width: number; height: number }, randomFn = Math.random): Star => {
    const startFromLeft = randomFn() > 0.5;
    const x = startFromLeft ? -50 : dims.width + 50;
    const y = randomFn() * dims.height;
    
    return {
      id: id + 1000,
      x,
      y,
      size: randomFn() * 2 + 2,
      speed: randomFn() * 3 + 2,
      angle: startFromLeft ? randomFn() * 0.5 + 0.25 : randomFn() * 0.5 + 2.6,
      opacity: 1,
      color: colors[Math.floor(randomFn() * colors.length)],
      trail: []
    };
  };

  useEffect(() => {
    if (!isMounted) return;

    const animateStars = () => {
      const now = Date.now();
      setStars(prevStars => 
        prevStars.map(star => ({
          ...star,
          opacity: Math.sin(now * 0.001 + star.id) * 0.5 + 0.5
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
  }, [dimensions, colors, isMounted]);

  // Don't render anything until mounted on client
  if (!isMounted) {
    return <div className={`fixed inset-0 overflow-hidden pointer-events-none ${className}`} />;
  }

  return (
    <div className={`fixed inset-0 overflow-hidden pointer-events-none ${className}`}>
      <svg
        width={dimensions.width}
        height={dimensions.height}
        className="absolute inset-0"
      >
        {/* Twinkling stars */}
        {stars.map((star) => (
          <circle
            key={star.id}
            cx={star.x}
            cy={star.y}
            r={star.size}
            fill={star.color}
            opacity={star.opacity}
            className="animate-pulse"
          />
        ))}
        
        {/* Shooting stars */}
        {shootingStars.map((star) => (
          <g key={star.id}>
            {/* Trail */}
            {star.trail.map((point, index) => (
              <circle
                key={`${star.id}-trail-${index}`}
                cx={point.x}
                cy={point.y}
                r={Math.max(0.5, star.size * (1 - index * 0.1))}
                fill={star.color}
                opacity={point.opacity}
              />
            ))}
            {/* Main star */}
            <circle
              cx={star.x}
              cy={star.y}
              r={star.size}
              fill={star.color}
              opacity={star.opacity}
            />
            {/* Glow effect */}
            <circle
              cx={star.x}
              cy={star.y}
              r={star.size * 2}
              fill={star.color}
              opacity={star.opacity * 0.3}
              filter="blur(2px)"
            />
          </g>
        ))}
      </svg>
    </div>
  );
} 