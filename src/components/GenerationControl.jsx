import React from 'react';

export function GenerationControl({ maxGenerations, setMaxGenerations }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-white/80 rounded-full
                    border border-stone-200 shadow-sm">
      <span className="text-sm text-stone-600 whitespace-nowrap">Show Generations:</span>
      <select
        value={maxGenerations}
        onChange={(e) => setMaxGenerations(Number(e.target.value))}
        className="bg-transparent border-none text-stone-700 font-medium
                   focus:outline-none cursor-pointer pr-1"
      >
        {[3, 4, 5, 6, 7, 8, 9, 10, 15, 20].map(n => (
          <option key={n} value={n}>{n}</option>
        ))}
      </select>
    </div>
  );
}
