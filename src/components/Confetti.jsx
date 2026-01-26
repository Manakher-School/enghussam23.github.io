import { useEffect, useState } from 'react';
import { Box } from '@mui/material';

const Confetti = ({ active, onComplete }) => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (active) {
      // Create confetti particles
      const newParticles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: 2 + Math.random() * 1,
        color: ['#4CAF50', '#FFB300', '#64B5F6', '#FF9800', '#E91E63'][Math.floor(Math.random() * 5)],
      }));
      setParticles(newParticles);

      // Clear after animation
      setTimeout(() => {
        setParticles([]);
        if (onComplete) onComplete();
      }, 3000);
    }
  }, [active, onComplete]);

  if (!active || particles.length === 0) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 9999,
        overflow: 'hidden',
      }}
    >
      {particles.map((particle) => (
        <Box
          key={particle.id}
          sx={{
            position: 'absolute',
            left: `${particle.left}%`,
            top: '-20px',
            width: '10px',
            height: '10px',
            backgroundColor: particle.color,
            borderRadius: '50%',
            animation: `fall ${particle.duration}s ease-in ${particle.delay}s forwards`,
            '@keyframes fall': {
              '0%': {
                transform: 'translateY(0) rotate(0deg)',
                opacity: 1,
              },
              '100%': {
                transform: 'translateY(100vh) rotate(720deg)',
                opacity: 0,
              },
            },
          }}
        />
      ))}
    </Box>
  );
};

export default Confetti;
