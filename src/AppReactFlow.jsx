import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Handle,
  Position
} from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';
import { parseGedcom, buildAncestryTree, findPersonByName } from './gedcomParser';
import { SearchBar } from './components/SearchBar';
import { Breadcrumbs } from './components/Breadcrumbs';
import { GenerationControl } from './components/GenerationControl';

// User configuration
const userConfig = {
  william_theodore: { name: 'William Theodore Powell', label: 'William Theodore Powell' },
  kristen: { name: 'Kristen Elizabeth Powell', label: 'Kristen Elizabeth Powell' },
  victoria: { name: 'Victoria Maria Powell', label: 'Victoria Maria Powell' },
  william_jordan: { name: 'William Jordan Powell', label: 'William Jordan Powell' },
};

// Dagre layout configuration
const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 220;
const nodeHeight = 80;

// Calculate layout using dagre
const getLayoutedElements = (nodes, edges) => {
  dagreGraph.setGraph({ rankdir: 'LR', nodesep: 100, ranksep: 250 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = 'left';
    node.sourcePosition = 'right';
    // Shift to use top-left as anchor (dagre uses center)
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };
    return node;
  });

  return { nodes, edges };
};

// Convert tree structure to React Flow nodes and edges
function convertTreeToNodesAndEdges(treeNode, expandedNodes, maxDepth, depth = 0, parentId = null) {
  if (!treeNode || depth >= maxDepth) return { nodes: [], edges: [] };

  const isExpanded = expandedNodes.has(treeNode.id);
  const hasParents = (treeNode.father || treeNode.mother) && depth < maxDepth - 1;

  const nodes = [{
    id: treeNode.id,
    type: 'personCard',
    data: {
      ...treeNode,
      isExpanded,
      hasParents,
      isRoot: depth === 0,
      depth,
    },
    position: { x: 0, y: 0 }, // Will be calculated by dagre
    sourcePosition: 'right',
    targetPosition: 'left',
  }];

  const edges = [];

  // Add edge from parent to this node
  if (parentId) {
    edges.push({
      id: `${parentId}-${treeNode.id}`,
      source: parentId,
      target: treeNode.id,
      type: 'step',  // PERFORMANCE: step is faster than smoothstep
      animated: false,
      style: { stroke: '#a89968', strokeWidth: 2.5, opacity: 0.7 },  // Heritage gold border color
    });
  }

  // Add children if expanded
  if (isExpanded && hasParents) {
    if (treeNode.father) {
      const fatherData = convertTreeToNodesAndEdges(
        treeNode.father,
        expandedNodes,
        maxDepth,
        depth + 1,
        treeNode.id
      );
      nodes.push(...fatherData.nodes);
      edges.push(...fatherData.edges);
    }

    if (treeNode.mother) {
      const motherData = convertTreeToNodesAndEdges(
        treeNode.mother,
        expandedNodes,
        maxDepth,
        depth + 1,
        treeNode.id
      );
      nodes.push(...motherData.nodes);
      edges.push(...motherData.edges);
    }
  }

  return { nodes, edges };
}

// PERFORMANCE: Memoize PersonCard component to prevent unnecessary re-renders
const PersonCardNode = React.memo(function PersonCardNode({ data, selected }) {
  const isDeceased = data.death && data.death !== 'null';

  return (
    <>
      <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
      <div
        className={`
          relative cursor-pointer transition-all duration-300
          ${selected ? 'scale-105 z-10' : 'hover:scale-105'}
        `}
        onClick={() => {
          if (window.handleReactFlowPersonClick) {
            window.handleReactFlowPersonClick(data);
          }
        }}
      >
        <div
          className={`
            relative px-4 py-3 rounded-xl border-2 transition-all duration-300
            ${data.isRoot
              ? 'bg-gradient-to-br from-[#f0e8d5] to-[#ebe2ce] shadow-lg border-[#d97706]'
              : selected
                ? 'bg-[#f5eed8] border-[#2d5016] shadow-xl'
                : 'border-[#c4b59a] bg-[#f5eed8]/95 hover:border-[#4a7c2c] hover:shadow-lg'
            }
            ${isDeceased && !data.isRoot ? 'opacity-75' : ''}
          `}
          style={{
            backdropFilter: 'blur(8px)',
            minWidth: '200px',
            boxShadow: data.isRoot
              ? '0 4px 6px rgba(124, 45, 18, 0.15), 0 2px 4px rgba(124, 45, 18, 0.1)'
              : selected
                ? '0 8px 12px rgba(45, 80, 22, 0.2), 0 4px 6px rgba(45, 80, 22, 0.15)'
                : undefined,
          }}
        >
        {isDeceased && (
          <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#7c2d12] border-2 border-[#f5eed8]"
            title="Deceased"
            style={{
              boxShadow: '0 2px 4px rgba(124, 45, 18, 0.3)'
            }}
          />
        )}

        <div className="flex items-center gap-3">
          <div
            className={`text-2xl w-10 h-10 rounded-full flex items-center justify-center ${data.isRoot ? 'ring-2 ring-[#d97706] ring-offset-2 ring-offset-[#e8e0d0]' : ''}`}
            style={{
              background: data.isRoot
                ? 'linear-gradient(135deg, #d97706 0%, #b45309 100%)'
                : 'linear-gradient(135deg, #d4c5a9 0%, #c4b59a 100%)',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.15)',
            }}
          >
            {data.photo}
          </div>
          <div className="text-left">
            <div className="font-semibold text-[#1c1917] leading-tight text-sm"
              style={{ fontFamily: 'EB Garamond, Lora, Georgia, serif' }}
            >
              {data.name}
            </div>
            <div className="text-xs text-[#78716c] mt-0.5"
              style={{ fontFamily: 'EB Garamond, Georgia, serif' }}
            >
              {data.birth}{data.death ? ` — ${data.death}` : ''}
            </div>
          </div>
        </div>

        {data.hasParents && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (window.handleReactFlowToggleExpand) {
                window.handleReactFlowToggleExpand(data.id);
              }
            }}
            className={`
              absolute -right-2 top-1/2 -translate-y-1/2 w-6 h-6
              rounded-full border-2 flex items-center justify-center
              text-xs font-bold transition-all duration-300
              hover:scale-110 hover:shadow-md
              ${data.isExpanded
                ? 'border-[#2d5016] text-[#2d5016] bg-[#f0e8d5]'
                : 'border-[#c4b59a] text-[#78716c] bg-[#f5eed8] hover:border-[#4a7c2c] hover:text-[#2d5016]'
              }
            `}
          >
            {data.isExpanded ? '−' : '+'}
          </button>
        )}
        </div>
      </div>
    </>
  );
}, (prevProps, nextProps) => {
  // Only re-render if these props change
  return (
    prevProps.data.id === nextProps.data.id &&
    prevProps.data.isExpanded === nextProps.data.isExpanded &&
    prevProps.selected === nextProps.selected
  );
});

const nodeTypes = {
  personCard: PersonCardNode,
};

// Detail Panel component
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

export default function AppReactFlow() {
  const [currentUser, setCurrentUser] = useState('william_theodore');
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [familyTrees, setFamilyTrees] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [parsedData, setParsedData] = useState({ individuals: {}, families: {} });
  const [maxGenerations, setMaxGenerations] = useState(5);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Load GEDCOM
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

        setParsedData({ individuals, families });

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

  // PERFORMANCE: Memoize tree data conversion (expensive operation)
  const { rawNodes, rawEdges } = useMemo(() => {
    if (!familyData) return { rawNodes: [], rawEdges: [] };

    const { nodes, edges } = convertTreeToNodesAndEdges(
      familyData,
      expandedNodes,
      maxGenerations
    );
    return { rawNodes: nodes, rawEdges: edges };
  }, [familyData, expandedNodes, maxGenerations]);

  // PERFORMANCE: Memoize layout calculation (expensive operation)
  const { layoutedNodes, layoutedEdges } = useMemo(() => {
    if (rawNodes.length === 0) return { layoutedNodes: [], layoutedEdges: [] };

    const { nodes, edges } = getLayoutedElements(rawNodes, rawEdges);
    return { layoutedNodes: nodes, layoutedEdges: edges };
  }, [rawNodes, rawEdges]);

  // Update nodes and edges when layout changes
  useEffect(() => {
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [layoutedNodes, layoutedEdges, setNodes, setEdges]);

  // Setup global callbacks
  useEffect(() => {
    window.handleReactFlowPersonClick = (person) => {
      setSelectedPerson(person);
    };

    window.handleReactFlowToggleExpand = (nodeId) => {
      setExpandedNodes(prev => {
        const next = new Set(prev);
        if (next.has(nodeId)) {
          next.delete(nodeId);
        } else {
          next.add(nodeId);
        }
        return next;
      });
    };

    return () => {
      delete window.handleReactFlowPersonClick;
      delete window.handleReactFlowToggleExpand;
    };
  }, []);

  // Reset on user change
  useEffect(() => {
    if (familyData) {
      setExpandedNodes(new Set([familyData.id]));
      setSelectedPerson(null);
    }
  }, [currentUser, familyData?.id]);

  // Helper functions for search and breadcrumbs
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

  const navigateToPerson = useCallback((personId) => {
    if (!familyData) return;
    const path = findPathInTree(familyData, personId);
    if (path) {
      setExpandedNodes(new Set(path));
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
    <div className="h-screen flex flex-col relative overflow-hidden"
      style={{
        background: `
          radial-gradient(ellipse at top left, rgba(124, 45, 18, 0.08) 0%, transparent 45%),
          radial-gradient(ellipse at bottom right, rgba(217, 151, 6, 0.06) 0%, transparent 45%),
          linear-gradient(135deg, #e8e0d0 0%, #ddd4c0 50%, #e8e0d0 100%)
        `,
      }}
    >
      {/* Heritage Ornamental Pattern */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%232d5016' fill-opacity='0.18'%3E%3Cpath d='M40 38L38 40L40 42L42 40L40 38M40 8L38 10L40 12L42 10L40 8M40 68L38 70L40 72L42 70L40 68M10 38L8 40L10 42L12 40L10 38M70 38L68 40L70 42L72 40L70 38'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Header */}
      <header className="relative z-10 flex-shrink-0 bg-white/80 backdrop-blur-sm border-b border-stone-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="text-amber-600 text-xl">🌳</span>
              <div>
                <h1 className="text-xl font-bold text-stone-800">The Powell Family <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full ml-2">React Flow</span></h1>
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

      {/* React Flow Tree */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.1}
          maxZoom={2}
          defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={true}

          // PERFORMANCE: Critical optimizations for large trees (20+ generations)
          onlyRenderVisibleElements={true}  // Only render nodes in viewport
          selectNodesOnDrag={false}         // Disable selection on drag
          snapToGrid={false}                // No snapping needed
          defaultEdgeOptions={{
            type: 'step',                   // Simpler than smoothstep (faster)
            animated: false,                // No animation = faster
          }}
          panOnScroll={false}               // Zoom on scroll instead
          zoomOnScroll={true}
          zoomOnPinch={true}
          panOnDrag={true}
        >
          <Background color="#a89968" gap={20} size={1} style={{ opacity: 0.4 }} />
          <Controls className="bg-[#f5eed8]/95 border-2 border-[#c4b59a] rounded-lg shadow-md" />
          <MiniMap
            nodeColor={(node) => {
              if (node.data.isRoot) return '#d97706';
              if (node.data.death) return '#7c2d12';
              return '#4a7c2c';
            }}
            className="bg-[#f5eed8]/95 border-2 border-[#c4b59a] rounded-lg shadow-md"
            maskColor="rgba(232, 224, 208, 0.7)"
          />
        </ReactFlow>
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
    </div>
  );
}
