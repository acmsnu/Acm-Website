import React from 'react';

export default function StarrySky({ count = 150 }) {
  const stars = React.useMemo(() => {
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: Math.random() > 0.5 ? 'w-0.5 h-0.5' : 'w-1 h-1',
      type: Math.random() > 0.85 ? 'star' : 'circle',
      color: Math.random() > 0.9 ? 'bg-[#ff8cbe]' : (Math.random() > 0.9 ? 'bg-[#a8a0ff]' : 'bg-white'),
      delay: `${Math.random() * 4}s`
    }));
  }, [count]);

  return (
    <>
      {stars.map((star) => (
        <div
          key={star.id}
          className={`absolute ${star.type === 'circle' ? 'rounded-full' : ''} ${star.size} ${star.color} animate-pulse`}
          style={{
            top: star.top,
            left: star.left,
            animationDelay: star.delay,
            boxShadow: star.type === 'star' ? '0 -4px 0 0 currentColor, 0 4px 0 0 currentColor, -4px 0 0 0 currentColor, 4px 0 0 0 currentColor' : 'none',
            color: star.color.includes('white') ? 'white' : star.color.includes('ff8cbe') ? '#ff8cbe' : '#a8a0ff',
            zIndex: 0
          }}
        />
      ))}
    </>
  );
}
