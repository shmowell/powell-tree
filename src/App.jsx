import React, { useState, useCallback, useRef, useEffect } from 'react';
import { familyTrees } from './familyData';

// User options
const users = {
  william_theodore: { key: 'william_theodore', label: 'William Theodore Powell' },
  kristen: { key: 'kristen', label: 'Kristen Elizabeth Powell' },
  victoria: { key: 'victoria', label: 'Victoria Maria Powell' },
  william_jordan: { key: 'william_jordan', label: 'William Jordan Powell' },
};

function PersonCard({ person, onCardClick, onExpandClick, isSelected, isExpanded, hasParents, isRoot }) {
  const isDeceased = person.death && person.death !== 'null';
  
  return (
    <div 
      onClick={(e) => {
        e.stopPropagation();
        onCardClick(person);
      }}
      className={`
        relative cursor-pointer transition-all duration-300 ease-out
        ${isSelected ? 'scale-105 z-10' : 'hover:scale-105'}
      `}
    >
      <div 
        className={`
          relative px-4 py-3 rounded-2xl border-2 transition-all duration-300
          ${isRoot 
            ? 'border-amber-500 bg-gradient-to-br from-amber-50 to-orange-50 shadow-lg shadow-amber-200/50' 
            : isSelected 
              ? 'border-amber-600 bg-amber-50 shadow-xl shadow-amber-200/50' 
              : 'border-stone-300 bg-white/90 hover:border-amber-400 hover:shadow-lg'
          }
          ${isDeceased && !isRoot ? 'opacity-80' : ''}
        `}
        style={{
          backdropFilter: 'blur(8px)',
          minWidth: '150px',
        }}
      >
        {isDeceased && (
          <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-stone-400 border-2 border-white" />
        )}
        
        <div className="flex items-center gap-3">
          <div 
            className={`text-2xl w-10 h-10 rounded-full flex items-center justify-center ${isRoot ? 'ring-2 ring-amber-400 ring-offset-2' : ''}`}
            style={{
              background: isRoot 
                ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
                : 'linear-gradient(135deg, #fed7aa 0%, #fdba74 100%)',
            }}
          >
            {person.photo}
          </div>
          <div className="text-left">
            <div className="font-semibold text-stone-800 leading-tight font-display text-sm">
              {person.name}
            </div>
            <div className="text-xs text-stone-500 mt-0.5">
              {person.birth}{person.death ? ` — ${person.death}` : ''}
            </div>
          </div>
        </div>
        
        {hasParents && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onExpandClick();
            }}
            className={`
              absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 
              rounded-full border-2 bg-white flex items-center justify-center
              text-xs font-bold transition-all duration-300
              hover:scale-110 hover:shadow-md
              ${isExpanded 
                ? 'border-amber-500 text-amber-600 rotate-180' 
                : 'border-stone-300 text-stone-500 hover:border-amber-400 hover:text-amber-500'
              }
            `}
          >
            ▼
          </button>
        )}
      </div>
    </div>
  );
}

// Connector using dynamic measurements
function AncestryBranch({ node, onSelectPerson, selectedPerson, expandedNodes, toggleExpand, isRoot = false }) {
  const hasParents = node.father || node.mother;
  const isExpanded = expandedNodes.has(node.id);
  
  const containerRef = useRef(null);
  const fatherRef = useRef(null);
  const motherRef = useRef(null);
  const [curvePath, setCurvePath] = useState('');
  const [svgSize, setSvgSize] = useState({ width: 0, height: 50 });

  // Calculate curve paths based on actual DOM positions
  useEffect(() => {
    if (!isExpanded || !hasParents) return;
    
    const updateCurves = () => {
      const container = containerRef.current;
      if (!container) return;
      
      const containerRect = container.getBoundingClientRect();
      const height = 50;
      
      let paths = [];
      
      // Get center top point (where curves start)
      const startX = containerRect.width / 2;
      
      if (fatherRef.current) {
        const fatherRect = fatherRef.current.getBoundingClientRect();
        const fatherCenterX = fatherRect.left + fatherRect.width / 2 - containerRect.left;
        
        // Cubic bezier from top-center to father
        paths.push(`M ${startX} 0 C ${startX} 25, ${fatherCenterX} 25, ${fatherCenterX} ${height}`);
      }
      
      if (motherRef.current) {
        const motherRect = motherRef.current.getBoundingClientRect();
        const motherCenterX = motherRect.left + motherRect.width / 2 - containerRect.left;
        
        // Cubic bezier from top-center to mother
        paths.push(`M ${startX} 0 C ${startX} 25, ${motherCenterX} 25, ${motherCenterX} ${height}`);
      }
      
      setCurvePath(paths.join(' '));
      setSvgSize({ width: containerRect.width, height });
    };
    
    // Update after render and on resize
    const timer = setTimeout(updateCurves, 10);
    window.addEventListener('resize', updateCurves);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateCurves);
    };
  }, [isExpanded, hasParents, expandedNodes]);

  return (
    <div className="flex flex-col items-center" ref={containerRef}>
      <PersonCard 
        person={node} 
        onCardClick={onSelectPerson}
        onExpandClick={() => toggleExpand(node.id)}
        isSelected={selectedPerson?.id === node.id}
        isExpanded={isExpanded}
        hasParents={hasParents}
        isRoot={isRoot}
      />
      
      {hasParents && isExpanded && (
        <>
          {/* SVG curved connector - positioned over the parent row */}
          <div style={{ height: svgSize.height, width: '100%', display: 'flex', justifyContent: 'center' }}>
            <svg 
              width={svgSize.width || 100} 
              height={svgSize.height} 
              style={{ overflow: 'visible' }}
            >
              <path
                d={curvePath}
                fill="none"
                stroke="#a8a29e"
                strokeWidth="2"
              />
            </svg>
          </div>
          
          {/* Parents row */}
          <div className="flex gap-8">
            {node.father && (
              <div ref={fatherRef}>
                <AncestryBranch
                  node={node.father}
                  onSelectPerson={onSelectPerson}
                  selectedPerson={selectedPerson}
                  expandedNodes={expandedNodes}
                  toggleExpand={toggleExpand}
                />
              </div>
            )}
            {node.mother && (
              <div ref={motherRef}>
                <AncestryBranch
                  node={node.mother}
                  onSelectPerson={onSelectPerson}
                  selectedPerson={selectedPerson}
                  expandedNodes={expandedNodes}
                  toggleExpand={toggleExpand}
                />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function DetailPanel({ person, onClose }) {
  const panelRef = useRef(null);
  
  // Close panel when clicking outside
  useEffect(() => {
    if (!person) return;
    
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose();
      }
    };
    
    // Delay adding listener to prevent immediate close
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);
    
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [person, onClose]);
  
  if (!person) return null;
  
  return (
    <div 
      ref={panelRef}
      className="fixed right-0 top-0 h-full w-80 bg-white/95 shadow-2xl border-l border-stone-200 p-6 overflow-y-auto z-50 animate-slideIn"
      style={{ backdropFilter: 'blur(20px)' }}
    >
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 transition-colors"
      >
        ✕
      </button>
      
      <div className="text-center mb-6">
        <div 
          className="text-6xl w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-4"
          style={{
            background: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 50%, #fdba74 100%)',
            boxShadow: '0 8px 32px rgba(251, 191, 36, 0.3)',
          }}
        >
          {person.photo}
        </div>
        <h2 className="text-2xl font-bold text-stone-800 mb-1 font-display">
          {person.name}
        </h2>
        <p className="text-stone-500">
          {person.birth}{person.death ? ` — ${person.death}` : ' — Present'}
        </p>
      </div>
      
      <div className="space-y-4">
        <div 
          className="p-4 rounded-xl"
          style={{ background: 'linear-gradient(135deg, #fefce8 0%, #fef9c3 100%)' }}
        >
          <h3 className="text-sm font-semibold text-amber-800 uppercase tracking-wide mb-2">
            Vital Information
          </h3>
          <div className="space-y-2 text-stone-700">
            <div className="flex justify-between">
              <span className="text-stone-500">Birth Year</span>
              <span className="font-medium">{person.birth || 'Unknown'}</span>
            </div>
            {person.birthPlace && (
              <div className="flex justify-between">
                <span className="text-stone-500">Birthplace</span>
                <span className="font-medium text-right text-sm max-w-[180px]">{person.birthPlace}</span>
              </div>
            )}
            {person.death && (
              <div className="flex justify-between">
                <span className="text-stone-500">Death Year</span>
                <span className="font-medium">{person.death}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-stone-500">Status</span>
              <span className={`font-medium ${person.death ? 'text-stone-500' : 'text-emerald-600'}`}>
                {person.death ? 'Deceased' : 'Living'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PannableCanvas({ children, zoom, setZoom }) {
  const containerRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    if (e.target.closest('button')) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    if (e.target.closest('button')) return;
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({
      x: touch.clientX - position.x,
      y: touch.clientY - position.y
    });
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    setPosition({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y
    });
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.05 : 0.05;
    setZoom(z => Math.min(1.5, Math.max(0.2, z + delta)));
  };

  const resetPosition = () => {
    setPosition({ x: 0, y: 0 });
  };

  useEffect(() => {
    const handleUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchend', handleUp);
    return () => {
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchend', handleUp);
    };
  }, []);

  // Add wheel event listener with passive: false to allow preventDefault
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => container.removeEventListener('wheel', handleWheel);
    }
  }, [setZoom]);

  return (
    <div 
      ref={containerRef}
      className="relative flex-1 overflow-hidden"
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleMouseUp}
    >
      <div 
        className="flex justify-center items-start pt-8"
        style={{ 
          transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
          transformOrigin: 'top center',
        }}
      >
        <div className="min-w-max px-8 py-4">
          {children}
        </div>
      </div>
      
      {(position.x !== 0 || position.y !== 0) && (
        <button
          onClick={resetPosition}
          className="absolute top-4 right-4 px-3 py-1.5 bg-white/90 hover:bg-white rounded-full border border-stone-200 text-stone-600 text-sm shadow-sm hover:shadow transition-all flex items-center gap-1.5 z-20"
        >
          <span>⌖</span> Re-center
        </button>
      )}
    </div>
  );
}

export default function App() {
  const [currentUser, setCurrentUser] = useState('william_theodore');
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [zoom, setZoom] = useState(0.8);

  const familyData = familyTrees[currentUser];

  // Reset expanded nodes when user changes, expand root by default
  useEffect(() => {
    if (familyData) {
      setExpandedNodes(new Set([familyData.id]));
      setSelectedPerson(null);
    }
  }, [currentUser]);

  const toggleExpand = useCallback((nodeId) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  }, []);

  const expandAll = () => {
    const getAllIds = (node) => {
      if (!node) return [];
      let ids = [node.id];
      if (node.father) ids = [...ids, ...getAllIds(node.father)];
      if (node.mother) ids = [...ids, ...getAllIds(node.mother)];
      return ids;
    };
    setExpandedNodes(new Set(getAllIds(familyData)));
  };

  const collapseAll = () => {
    if (familyData) {
      setExpandedNodes(new Set([familyData.id]));
    }
  };

  if (!familyData) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div 
      className="h-screen flex flex-col relative overflow-hidden"
      style={{
        background: `
          radial-gradient(ellipse at top, #fefce8 0%, transparent 50%),
          radial-gradient(ellipse at bottom right, #fff7ed 0%, transparent 50%),
          radial-gradient(ellipse at bottom left, #fef3c7 0%, transparent 50%),
          linear-gradient(180deg, #fffbeb 0%, #fef9c3 50%, #fef3c7 100%)
        `,
      }}
    >
      {/* Decorative Pattern */}
      <div 
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4a574' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      
      {/* Header */}
      <header className="relative z-10 text-center py-6 px-4 flex-shrink-0">
        <div className="inline-flex items-center gap-3 mb-2">
          <div className="w-12 h-0.5 bg-gradient-to-r from-transparent to-amber-400 rounded-full" />
          <span className="text-amber-600 text-2xl">🌳</span>
          <div className="w-12 h-0.5 bg-gradient-to-l from-transparent to-amber-400 rounded-full" />
        </div>
        <h1 
          className="text-4xl md:text-5xl font-bold text-stone-800 mb-2 font-display"
          style={{ textShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
        >
          The Powell Family
        </h1>
        <p className="text-stone-500 text-lg mb-4">
          Ancestry of {users[currentUser].label}
        </p>
        
        {/* User Selector */}
        <div className="flex justify-center">
          <select
            value={currentUser}
            onChange={(e) => setCurrentUser(e.target.value)}
            className="px-4 py-2 bg-white/90 rounded-full border border-stone-300 text-stone-700 font-medium shadow-sm hover:shadow transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            {Object.values(users).map(user => (
              <option key={user.key} value={user.key}>
                {user.label}
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* Controls */}
      <div className="relative z-10 flex justify-center gap-3 mb-4 px-4 flex-wrap flex-shrink-0">
        <button 
          onClick={expandAll}
          className="px-4 py-2 bg-white/80 hover:bg-white rounded-full border border-stone-200 text-stone-700 text-sm font-medium shadow-sm hover:shadow transition-all flex items-center gap-2"
        >
          <span>📖</span> Expand All
        </button>
        <button 
          onClick={collapseAll}
          className="px-4 py-2 bg-white/80 hover:bg-white rounded-full border border-stone-200 text-stone-700 text-sm font-medium shadow-sm hover:shadow transition-all flex items-center gap-2"
        >
          <span>📕</span> Collapse
        </button>
        <div className="flex items-center gap-2 px-3 bg-white/80 rounded-full border border-stone-200 shadow-sm">
          <button 
            onClick={() => setZoom(z => Math.max(0.2, z - 0.1))}
            className="w-7 h-7 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-600"
          >
            −
          </button>
          <span className="text-sm text-stone-500 w-12 text-center">{Math.round(zoom * 100)}%</span>
          <button 
            onClick={() => setZoom(z => Math.min(1.5, z + 0.1))}
            className="w-7 h-7 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-600"
          >
            +
          </button>
        </div>
      </div>

      {/* Pannable Ancestry Tree */}
      <PannableCanvas zoom={zoom} setZoom={setZoom}>
        <AncestryBranch 
          node={familyData}
          onSelectPerson={setSelectedPerson}
          selectedPerson={selectedPerson}
          expandedNodes={expandedNodes}
          toggleExpand={toggleExpand}
          isRoot={true}
        />
      </PannableCanvas>

      {/* Detail Panel */}
      <DetailPanel 
        person={selectedPerson} 
        onClose={() => setSelectedPerson(null)} 
      />

      {/* Legend */}
      <div className="fixed bottom-4 left-4 z-40">
        <div className="flex items-center gap-4 px-4 py-2 bg-white/90 rounded-full border border-stone-200 shadow-lg text-sm text-stone-600">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 ring-1 ring-amber-400" />
            <span>You</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-br from-amber-200 to-amber-400" />
            <span>Living</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-stone-300 border-2 border-stone-400" />
            <span>Deceased</span>
          </div>
        </div>
      </div>

      {/* Help Text */}
      <div className="fixed bottom-4 right-4 z-40 px-4 py-2 bg-white/90 rounded-full border border-stone-200 shadow-lg text-sm text-stone-500">
        Scroll to zoom • Drag to pan • Click ▼ for ancestors
      </div>
    </div>
  );
}
