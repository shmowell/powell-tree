import React, { useState, useCallback } from 'react';

// Sample family data - replace with your own!
const familyData = {
  id: 1,
  name: "James Mitchell",
  birth: "1920",
  death: "1998",
  photo: "👴",
  spouse: { name: "Eleanor Mitchell", birth: "1924", death: "2010", photo: "👵" },
  children: [
    {
      id: 2,
      name: "Robert Mitchell",
      birth: "1945",
      photo: "👨",
      spouse: { name: "Margaret Mitchell", birth: "1948", photo: "👩" },
      children: [
        {
          id: 5,
          name: "Sarah Mitchell",
          birth: "1970",
          photo: "👩",
          spouse: { name: "David Chen", birth: "1968", photo: "👨" },
          children: [
            { id: 10, name: "Emma Chen", birth: "1998", photo: "👧", children: [] },
            { id: 11, name: "Lucas Chen", birth: "2001", photo: "👦", children: [] }
          ]
        },
        {
          id: 6,
          name: "Michael Mitchell",
          birth: "1973",
          photo: "👨",
          spouse: { name: "Jennifer Mitchell", birth: "1975", photo: "👩" },
          children: [
            { id: 12, name: "Olivia Mitchell", birth: "2005", photo: "👧", children: [] }
          ]
        }
      ]
    },
    {
      id: 3,
      name: "Patricia Wilson",
      birth: "1948",
      photo: "👩",
      spouse: { name: "Thomas Wilson", birth: "1946", death: "2020", photo: "👨" },
      children: [
        {
          id: 7,
          name: "Andrew Wilson",
          birth: "1972",
          photo: "👨",
          children: []
        },
        {
          id: 8,
          name: "Catherine Wilson",
          birth: "1976",
          photo: "👩",
          spouse: { name: "Mark Davis", birth: "1974", photo: "👨" },
          children: [
            { id: 13, name: "Sophie Davis", birth: "2008", photo: "👧", children: [] },
            { id: 14, name: "Jack Davis", birth: "2011", photo: "👦", children: [] }
          ]
        }
      ]
    },
    {
      id: 4,
      name: "William Mitchell",
      birth: "1952",
      death: "2015",
      photo: "👨",
      spouse: { name: "Susan Mitchell", birth: "1954", photo: "👩" },
      children: [
        {
          id: 9,
          name: "Daniel Mitchell",
          birth: "1980",
          photo: "👨",
          spouse: { name: "Rachel Mitchell", birth: "1982", photo: "👩" },
          children: [
            { id: 15, name: "Noah Mitchell", birth: "2012", photo: "👦", children: [] },
            { id: 16, name: "Ava Mitchell", birth: "2015", photo: "👧", children: [] }
          ]
        }
      ]
    }
  ]
};

function PersonCard({ person, isSpouse, onClick, isSelected, isExpanded, hasChildren }) {
  const isDeceased = person.death;
  
  return (
    <div 
      onClick={() => onClick(person)}
      className={`
        relative cursor-pointer transition-all duration-300 ease-out
        ${isSpouse ? 'scale-90' : ''}
        ${isSelected ? 'scale-105 z-10' : 'hover:scale-102'}
      `}
    >
      <div 
        className={`
          relative px-4 py-3 rounded-2xl border-2 transition-all duration-300
          ${isSelected 
            ? 'border-amber-600 bg-amber-50 shadow-xl shadow-amber-200/50' 
            : 'border-stone-300 bg-white/90 hover:border-amber-400 hover:shadow-lg'
          }
          ${isDeceased ? 'opacity-80' : ''}
        `}
        style={{
          backdropFilter: 'blur(8px)',
          minWidth: '140px',
        }}
      >
        {isDeceased && (
          <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-stone-400 border-2 border-white" />
        )}
        
        <div className="flex items-center gap-3">
          <div 
            className="text-2xl w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              background: isSpouse 
                ? 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)' 
                : 'linear-gradient(135deg, #fed7aa 0%, #fdba74 100%)',
            }}
          >
            {person.photo}
          </div>
          <div className="text-left">
            <div className="font-semibold text-stone-800 leading-tight font-display">
              {person.name}
            </div>
            <div className="text-xs text-stone-500 mt-0.5">
              {person.birth}{person.death ? ` — ${person.death}` : ''}
            </div>
          </div>
        </div>
        
        {hasChildren && !isSpouse && (
          <div 
            className={`
              absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 
              rounded-full border-2 bg-white flex items-center justify-center
              text-xs font-bold transition-all duration-300
              ${isExpanded 
                ? 'border-amber-500 text-amber-600 rotate-180' 
                : 'border-stone-300 text-stone-500'
              }
            `}
          >
            ▼
          </div>
        )}
      </div>
    </div>
  );
}

function FamilyNode({ node, level = 0, onSelectPerson, selectedPerson, expandedNodes, toggleExpand }) {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedNodes.has(node.id);

  const handleClick = (person) => {
    onSelectPerson(person);
    if (hasChildren && person.id === node.id) {
      toggleExpand(node.id);
    }
  };

  return (
    <div className="flex flex-col items-center animate-fadeIn">
      <div className="flex items-center gap-2">
        <PersonCard 
          person={node} 
          onClick={handleClick}
          isSelected={selectedPerson?.id === node.id}
          isExpanded={isExpanded}
          hasChildren={hasChildren}
        />
        {node.spouse && (
          <>
            <div className="flex items-center gap-1">
              <div className="w-6 h-0.5 bg-gradient-to-r from-amber-300 to-rose-300 rounded-full" />
              <div className="text-rose-400 text-lg">♥</div>
              <div className="w-6 h-0.5 bg-gradient-to-l from-amber-300 to-rose-300 rounded-full" />
            </div>
            <PersonCard 
              person={node.spouse} 
              isSpouse 
              onClick={() => onSelectPerson(node.spouse)}
              isSelected={selectedPerson?.name === node.spouse.name}
            />
          </>
        )}
      </div>
      
      {hasChildren && isExpanded && (
        <div className="relative mt-8">
          <div 
            className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-6 -mt-6"
            style={{
              background: 'linear-gradient(to bottom, #d6d3d1, #a8a29e)',
            }}
          />
          
          {node.children.length > 1 && (
            <div 
              className="absolute top-0 h-0.5 -mt-2"
              style={{
                left: `calc(50% - ${(node.children.length - 1) * 120}px)`,
                right: `calc(50% - ${(node.children.length - 1) * 120}px)`,
                background: 'linear-gradient(to right, transparent, #a8a29e 10%, #a8a29e 90%, transparent)',
              }}
            />
          )}
          
          <div className="flex gap-8 items-start">
            {node.children.map((child) => (
              <div key={child.id} className="relative flex flex-col items-center">
                <div 
                  className="absolute -top-2 left-1/2 -translate-x-1/2 w-0.5 h-4"
                  style={{
                    background: 'linear-gradient(to bottom, #a8a29e, #d6d3d1)',
                  }}
                />
                <div className="pt-4">
                  <FamilyNode 
                    node={child} 
                    level={level + 1}
                    onSelectPerson={onSelectPerson}
                    selectedPerson={selectedPerson}
                    expandedNodes={expandedNodes}
                    toggleExpand={toggleExpand}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DetailPanel({ person, onClose }) {
  if (!person) return null;
  
  return (
    <div 
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
              <span className="font-medium">{person.birth}</span>
            </div>
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
        
        <div className="p-4 rounded-xl bg-stone-50">
          <h3 className="text-sm font-semibold text-stone-600 uppercase tracking-wide mb-3">
            Quick Actions
          </h3>
          <div className="space-y-2">
            <button className="w-full py-2 px-4 bg-white rounded-lg border border-stone-200 text-stone-700 hover:border-amber-400 hover:bg-amber-50 transition-all text-left flex items-center gap-2">
              <span>📝</span> Edit Details
            </button>
            <button className="w-full py-2 px-4 bg-white rounded-lg border border-stone-200 text-stone-700 hover:border-amber-400 hover:bg-amber-50 transition-all text-left flex items-center gap-2">
              <span>📷</span> Add Photo
            </button>
            <button className="w-full py-2 px-4 bg-white rounded-lg border border-stone-200 text-stone-700 hover:border-amber-400 hover:bg-amber-50 transition-all text-left flex items-center gap-2">
              <span>📜</span> Add Story
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [expandedNodes, setExpandedNodes] = useState(new Set([1]));
  const [zoom, setZoom] = useState(1);

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
      let ids = [node.id];
      if (node.children) {
        node.children.forEach(child => {
          ids = [...ids, ...getAllIds(child)];
        });
      }
      return ids;
    };
    setExpandedNodes(new Set(getAllIds(familyData)));
  };

  const collapseAll = () => {
    setExpandedNodes(new Set([1]));
  };

  return (
    <div 
      className="min-h-screen relative overflow-hidden"
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
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4a574' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      
      {/* Header */}
      <header className="relative z-10 text-center py-8 px-4">
        <div className="inline-flex items-center gap-3 mb-2">
          <div className="w-12 h-0.5 bg-gradient-to-r from-transparent to-amber-400 rounded-full" />
          <span className="text-amber-600 text-2xl">🌳</span>
          <div className="w-12 h-0.5 bg-gradient-to-l from-transparent to-amber-400 rounded-full" />
        </div>
        <h1 
          className="text-4xl md:text-5xl font-bold text-stone-800 mb-2 font-display"
          style={{ textShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
        >
          The Mitchell Family
        </h1>
        <p className="text-stone-500 text-lg">
          Four Generations of Heritage
        </p>
      </header>

      {/* Controls */}
      <div className="relative z-10 flex justify-center gap-3 mb-8 px-4 flex-wrap">
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
            onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}
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

      {/* Family Tree */}
      <div className="relative z-10 overflow-x-auto pb-12">
        <div 
          className="flex justify-center px-8 py-4 min-w-max transition-transform duration-300"
          style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
        >
          <FamilyNode 
            node={familyData}
            onSelectPerson={setSelectedPerson}
            selectedPerson={selectedPerson}
            expandedNodes={expandedNodes}
            toggleExpand={toggleExpand}
          />
        </div>
      </div>

      {/* Detail Panel */}
      <DetailPanel 
        person={selectedPerson} 
        onClose={() => setSelectedPerson(null)} 
      />

      {/* Legend */}
      <div className="fixed bottom-4 left-4 z-40">
        <div className="flex items-center gap-4 px-4 py-2 bg-white/90 rounded-full border border-stone-200 shadow-lg text-sm text-stone-600">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-br from-amber-200 to-amber-400" />
            <span>Living</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-stone-300 border-2 border-stone-400" />
            <span>Deceased</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-rose-400">♥</span>
            <span>Married</span>
          </div>
        </div>
      </div>

      {/* Help Text */}
      <div className="fixed bottom-4 right-4 z-40 px-4 py-2 bg-white/90 rounded-full border border-stone-200 shadow-lg text-sm text-stone-500">
        Click any person to view details • Click ▼ to expand
      </div>
    </div>
  );
}
