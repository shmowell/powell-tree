import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import Tree from 'react-d3-tree';
import { parseGedcom, buildAncestryTree, findPersonByName } from './gedcomParser';
import { SearchBar } from './components/SearchBar';
import { Breadcrumbs } from './components/Breadcrumbs';
import { GenerationControl } from './components/GenerationControl';

// User configuration - maps user keys to their names in the GEDCOM
const userConfig = {
  william_theodore: { name: 'William Theodore Powell', label: 'William Theodore Powell' },
  kristen: { name: 'Kristen Elizabeth Powell', label: 'Kristen Elizabeth Powell' },
  victoria: { name: 'Victoria Maria Powell', label: 'Victoria Maria Powell' },
  william_jordan: { name: 'William Jordan Powell', label: 'William Jordan Powell' },
  katharine: { name: 'Katharine Hunt Powell', label: 'Katharine Hunt Powell' },
};

// Convert our tree structure to react-d3-tree format
function convertToD3TreeFormat(node, expandedNodes, maxDepth, depth = 0) {
  if (!node || depth >= maxDepth) return null;

  const isExpanded = expandedNodes.has(node.id);
  const hasParents = node.father || node.mother;

  const d3Node = {
    name: node.name,
    attributes: {
      id: node.id,
      birth: node.birth,
      death: node.death,
      photo: node.photo,
      birthPlace: node.birthPlace,
      isExpanded: isExpanded,
      hasParents: hasParents && depth < maxDepth - 1,
    },
    children: [],
  };

  // Only add children if expanded and within depth limit
  if (isExpanded && hasParents && depth < maxDepth - 1) {
    if (node.father) {
      const fatherNode = convertToD3TreeFormat(node.father, expandedNodes, maxDepth, depth + 1);
      if (fatherNode) d3Node.children.push(fatherNode);
    }
    if (node.mother) {
      const motherNode = convertToD3TreeFormat(node.mother, expandedNodes, maxDepth, depth + 1);
      if (motherNode) d3Node.children.push(motherNode);
    }
  }

  return d3Node;
}


// Custom node renderer for react-d3-tree
function renderCustomNode({ nodeDatum, toggleNode, foreignObjectProps }) {
  const { attributes } = nodeDatum;
  const isDeceased = attributes.death && attributes.death !== 'null';
  const isRoot = nodeDatum.__rd3t && nodeDatum.__rd3t.depth === 0;

  return (
    <g>
      <foreignObject {...foreignObjectProps} width="220" height="80" x="-110" y="-40">
        <div
          xmlns="http://www.w3.org/1999/xhtml"
          onClick={(e) => {
            e.stopPropagation();
            if (window.handlePersonCardClick) {
              window.handlePersonCardClick(attributes.id);
            }
          }}
          className={`
            relative cursor-pointer transition-all duration-300 ease-out
            hover:scale-105
          `}
        >
          <div
            className={`
              relative px-4 py-3 rounded-2xl border-2 transition-all duration-300
              ${isRoot
                ? 'border-amber-500 bg-gradient-to-br from-amber-50 to-orange-50 shadow-lg shadow-amber-200/50'
                : 'border-stone-300 bg-white/90 hover:border-amber-400 hover:shadow-lg'
              }
              ${isDeceased && !isRoot ? 'opacity-80' : ''}
            `}
            style={{
              backdropFilter: 'blur(8px)',
              minWidth: '200px',
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
                {attributes.photo}
              </div>
              <div className="text-left">
                <div className="font-semibold text-stone-800 leading-tight font-display text-sm">
                  {nodeDatum.name}
                </div>
                <div className="text-xs text-stone-500 mt-0.5">
                  {attributes.birth}{attributes.death ? ` — ${attributes.death}` : ''}
                </div>
              </div>
            </div>

            {attributes.hasParents && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleNode();
                }}
                className={`
                  absolute -right-2 top-1/2 -translate-y-1/2 w-6 h-6
                  rounded-full border-2 bg-white flex items-center justify-center
                  text-xs font-bold transition-all duration-300
                  hover:scale-110 hover:shadow-md
                  ${attributes.isExpanded
                    ? 'border-amber-500 text-amber-600'
                    : 'border-stone-300 text-stone-500 hover:border-amber-400 hover:text-amber-500'
                  }
                `}
              >
                {attributes.isExpanded ? '−' : '+'}
              </button>
            )}
          </div>
        </div>
      </foreignObject>
    </g>
  );
}

function DetailPanel({ person, onClose }) {
  const panelRef = useRef(null);
  
  useEffect(() => {
    if (!person) return;
    
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose();
      }
    };
    
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
      className="fixed right-0 top-0 h-full w-80 bg-white/95 shadow-2xl border-l border-stone-200 p-6 overflow-y-auto z-50"
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


export default function App() {
  const [currentUser, setCurrentUser] = useState('william_theodore');
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [familyTrees, setFamilyTrees] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [parsedData, setParsedData] = useState({ individuals: {}, families: {} });
  const [maxGenerations, setMaxGenerations] = useState(5);
  const treeContainerRef = useRef(null);

  // Load and parse GEDCOM file on mount
  useEffect(() => {
    async function loadGedcom() {
      try {
        setLoading(true);
        const response = await fetch('/family.ged');
        if (!response.ok) {
          throw new Error('Failed to load family.ged file');
        }
        const gedcomText = await response.text();
        const { individuals, families } = parseGedcom(gedcomText);

        // Save parsed data for search
        setParsedData({ individuals, families });

        // Build trees for each user
        const trees = {};
        for (const [key, config] of Object.entries(userConfig)) {
          const personId = findPersonByName(config.name, individuals);
          if (personId) {
            trees[key] = buildAncestryTree(personId, individuals, families);
          }
        }
        
        setFamilyTrees(trees);
        setLoading(false);
      } catch (err) {
        console.error('Error loading GEDCOM:', err);
        setError(err.message);
        setLoading(false);
      }
    }
    
    loadGedcom();
  }, []);

  const familyData = familyTrees?.[currentUser];

  // Convert tree data to react-d3-tree format
  const d3TreeData = useMemo(() => {
    if (!familyData) return null;
    return convertToD3TreeFormat(familyData, expandedNodes, maxGenerations);
  }, [familyData, expandedNodes, maxGenerations]);

  // Setup global callback for person card clicks
  useEffect(() => {
    window.handlePersonCardClick = (personId) => {
      // Find person in tree
      const findPerson = (node) => {
        if (!node) return null;
        if (node.id === personId) return node;
        return findPerson(node.father) || findPerson(node.mother);
      };
      const person = findPerson(familyData);
      if (person) {
        setSelectedPerson(person);
      }
    };
    return () => {
      delete window.handlePersonCardClick;
    };
  }, [familyData]);

  // Reset expanded nodes when user changes
  useEffect(() => {
    if (familyData) {
      setExpandedNodes(new Set([familyData.id]));
      setSelectedPerson(null);
    }
  }, [currentUser, familyData?.id]);

  // Prune expanded nodes when maxGenerations changes
  useEffect(() => {
    if (!familyData) return;

    const getValidIds = (node, depth = 0) => {
      if (!node || depth >= maxGenerations) return [];
      let ids = [node.id];
      if (node.father && depth + 1 < maxGenerations) {
        ids = [...ids, ...getValidIds(node.father, depth + 1)];
      }
      if (node.mother && depth + 1 < maxGenerations) {
        ids = [...ids, ...getValidIds(node.mother, depth + 1)];
      }
      return ids;
    };

    const validIds = new Set(getValidIds(familyData));
    setExpandedNodes(prev => {
      const pruned = new Set([...prev].filter(id => validIds.has(id)));
      return pruned;
    });
  }, [maxGenerations, familyData]);

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

  // Handle node toggle from react-d3-tree
  const handleNodeToggle = useCallback((nodeDatum) => {
    const nodeId = nodeDatum.attributes.id;
    toggleExpand(nodeId);
  }, [toggleExpand]);

  // Helper function: Find path from root to target person
  const findPathInTree = useCallback((node, targetId, currentPath = []) => {
    if (!node) return null;

    const newPath = [...currentPath, node.id];
    if (node.id === targetId) return newPath;

    const fatherPath = node.father ? findPathInTree(node.father, targetId, newPath) : null;
    if (fatherPath) return fatherPath;

    const motherPath = node.mother ? findPathInTree(node.mother, targetId, newPath) : null;
    if (motherPath) return motherPath;

    return null;
  }, []);

  // Navigate to a person by expanding path and optionally selecting
  const navigateToPerson = useCallback((personId) => {
    if (!familyData) return;

    const path = findPathInTree(familyData, personId);
    if (path) {
      setExpandedNodes(new Set(path));
      // Find person in tree for detail panel
      const findPerson = (node) => {
        if (!node) return null;
        if (node.id === personId) return node;
        return findPerson(node.father) || findPerson(node.mother);
      };
      const person = findPerson(familyData);
      if (person) {
        setSelectedPerson(person);
      }
    }
  }, [familyData, findPathInTree]);

  // Build breadcrumb path with person details
  const buildPathToSelected = useCallback((targetId) => {
    if (!targetId || !familyData) return [];

    const idPath = findPathInTree(familyData, targetId);
    if (!idPath) return [];

    const detailPath = [];
    let currentNode = familyData;

    for (let i = 0; i < idPath.length; i++) {
      const id = idPath[i];
      if (currentNode && currentNode.id === id) {
        detailPath.push({
          id: currentNode.id,
          name: currentNode.name,
          photo: currentNode.photo
        });

        // Navigate to next node
        const nextId = idPath[i + 1];
        if (nextId) {
          if (currentNode.father?.id === nextId) {
            currentNode = currentNode.father;
          } else if (currentNode.mother?.id === nextId) {
            currentNode = currentNode.mother;
          }
        }
      }
    }

    return detailPath;
  }, [familyData, findPathInTree]);

  // Compute breadcrumb path when selection changes
  const ancestryPath = useMemo(() =>
    selectedPerson ? buildPathToSelected(selectedPerson.id) : [],
    [selectedPerson, buildPathToSelected]
  );

  const expandAll = () => {
    const getAllIds = (node, depth = 0) => {
      if (!node || depth >= maxGenerations) return [];
      let ids = [node.id];
      if (node.father && depth + 1 < maxGenerations) ids = [...ids, ...getAllIds(node.father, depth + 1)];
      if (node.mother && depth + 1 < maxGenerations) ids = [...ids, ...getAllIds(node.mother, depth + 1)];
      return ids;
    };
    if (familyData) {
      setExpandedNodes(new Set(getAllIds(familyData)));
    }
  };

  const collapseAll = () => {
    if (familyData) {
      setExpandedNodes(new Set([familyData.id]));
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-amber-50">
        <div className="text-center">
          <div className="text-4xl mb-4">🌳</div>
          <p className="text-stone-600">Loading family tree...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-amber-50">
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-stone-600">Error: {error}</p>
          <p className="text-stone-500 text-sm mt-2">Make sure family.ged is in the public folder</p>
        </div>
      </div>
    );
  }

  if (!familyData) {
    return (
      <div className="h-screen flex items-center justify-center bg-amber-50">
        <div className="text-center">
          <div className="text-4xl mb-4">❓</div>
          <p className="text-stone-600">User not found in family tree</p>
        </div>
      </div>
    );
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
      
      {/* Compact Header/Navbar */}
      <header className="relative z-10 flex-shrink-0 bg-white/80 backdrop-blur-sm border-b border-stone-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          {/* Top Row: Title + User Selector */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="text-amber-600 text-xl">🌳</span>
              <div>
                <h1 className="text-xl font-bold text-stone-800">The Powell Family</h1>
                <p className="text-xs text-stone-500">Ancestry Explorer</p>
              </div>
            </div>
            <select
              value={currentUser}
              onChange={(e) => setCurrentUser(e.target.value)}
              className="px-3 py-1.5 bg-white rounded-full border border-stone-300 text-stone-700 text-sm font-medium shadow-sm hover:shadow transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              {Object.entries(userConfig).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.label}
                </option>
              ))}
            </select>
          </div>

          {/* Bottom Row: Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <SearchBar
              individuals={parsedData.individuals}
              onSelectPerson={navigateToPerson}
            />
            <div className="flex-1 min-w-0" />
            <button
              onClick={expandAll}
              className="px-3 py-1.5 bg-white hover:bg-stone-50 rounded-full border border-stone-200 text-stone-700 text-xs font-medium shadow-sm transition-all"
              title="Expand All"
            >
              📖
            </button>
            <button
              onClick={collapseAll}
              className="px-3 py-1.5 bg-white hover:bg-stone-50 rounded-full border border-stone-200 text-stone-700 text-xs font-medium shadow-sm transition-all"
              title="Collapse All"
            >
              📕
            </button>
            <GenerationControl
              maxGenerations={maxGenerations}
              setMaxGenerations={setMaxGenerations}
            />
          </div>
        </div>
      </header>

      {/* Breadcrumbs */}
      {ancestryPath.length > 0 && (
        <div className="relative z-10 flex justify-center py-2 px-4 flex-shrink-0 bg-amber-50/50">
          <Breadcrumbs
            path={ancestryPath}
            onNavigate={navigateToPerson}
            rootName={userConfig[currentUser].label}
          />
        </div>
      )}

      {/* Pannable Ancestry Tree */}
      <div ref={treeContainerRef} className="flex-1 relative bg-transparent">
        {d3TreeData && (
          <Tree
            data={d3TreeData}
            orientation="horizontal"
            pathFunc="step"
            translate={{ x: 100, y: treeContainerRef.current?.clientHeight / 2 || 400 }}
            nodeSize={{ x: 300, y: 150 }}
            separation={{ siblings: 1, nonSiblings: 1.5 }}
            renderCustomNodeElement={(rd3tProps) =>
              renderCustomNode({
                ...rd3tProps,
                toggleNode: () => handleNodeToggle(rd3tProps.nodeDatum),
              })
            }
            pathClassFunc={() => 'tree-link'}
            enableLegacyTransitions
            transitionDuration={500}
            collapsible={false}
            zoom={0.8}
            scaleExtent={{ min: 0.1, max: 2 }}
            styles={{
              links: {
                stroke: '#a8a29e',
                strokeWidth: 2,
              },
            }}
          />
        )}
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
        Scroll to zoom • Drag to pan • Click + for ancestors
      </div>
    </div>
  );
}
