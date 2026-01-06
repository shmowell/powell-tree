import React, { useState, useCallback, useRef, useEffect } from 'react';

// Ancestry data - tracking heritage of Jordan Powell
const familyData = {
  id: 1,
  name: "Jordan Powell",
  birth: "2000",
  photo: "🧑",
  father: {
    id: 2,
    name: "Michael Powell",
    birth: "1972",
    photo: "👨",
    father: {
      id: 4,
      name: "Richard Powell",
      birth: "1945",
      death: "2020",
      photo: "👴",
      father: {
        id: 8,
        name: "Harold Powell",
        birth: "1918",
        death: "1995",
        photo: "👴",
        father: {
          id: 16,
          name: "Walter Powell",
          birth: "1890",
          death: "1968",
          photo: "👴",
          father: {
            id: 32,
            name: "Cornelius Powell",
            birth: "1862",
            death: "1940",
            photo: "👴",
            father: {
              id: 64,
              name: "Josiah Powell",
              birth: "1834",
              death: "1912",
              photo: "👴",
              father: {
                id: 128,
                name: "Ezekiel Powell",
                birth: "1806",
                death: "1884",
                photo: "👴",
                father: {
                  id: 256,
                  name: "Nathaniel Powell",
                  birth: "1778",
                  death: "1856",
                  photo: "👴",
                  father: { id: 512, name: "Samuel Powell", birth: "1750", death: "1828", photo: "👴" },
                  mother: { id: 513, name: "Abigail Whitmore", birth: "1755", death: "1833", photo: "👵" }
                },
                mother: {
                  id: 257,
                  name: "Prudence Ashford",
                  birth: "1782",
                  death: "1860",
                  photo: "👵",
                  father: { id: 514, name: "Elijah Ashford", birth: "1754", death: "1832", photo: "👴" },
                  mother: { id: 515, name: "Mercy Blackwell", birth: "1758", death: "1836", photo: "👵" }
                }
              },
              mother: {
                id: 129,
                name: "Hannah Mercer",
                birth: "1810",
                death: "1888",
                photo: "👵",
                father: {
                  id: 258,
                  name: "Tobias Mercer",
                  birth: "1782",
                  death: "1860",
                  photo: "👴",
                  father: { id: 516, name: "Jonas Mercer", birth: "1754", death: "1832", photo: "👴" },
                  mother: { id: 517, name: "Lydia Crane", birth: "1758", death: "1836", photo: "👵" }
                },
                mother: {
                  id: 259,
                  name: "Patience Holloway",
                  birth: "1786",
                  death: "1864",
                  photo: "👵",
                  father: { id: 518, name: "Silas Holloway", birth: "1758", death: "1836", photo: "👴" },
                  mother: { id: 519, name: "Faith Goodwin", birth: "1762", death: "1840", photo: "👵" }
                }
              }
            },
            mother: {
              id: 65,
              name: "Adelaide Thompson",
              birth: "1838",
              death: "1916",
              photo: "👵",
              father: {
                id: 130,
                name: "Edmund Thompson",
                birth: "1810",
                death: "1888",
                photo: "👴",
                father: {
                  id: 260,
                  name: "Reuben Thompson",
                  birth: "1782",
                  death: "1860",
                  photo: "👴",
                  father: { id: 520, name: "Caleb Thompson", birth: "1754", death: "1832", photo: "👴" },
                  mother: { id: 521, name: "Bethany Shaw", birth: "1758", death: "1836", photo: "👵" }
                },
                mother: {
                  id: 261,
                  name: "Susannah Wentworth",
                  birth: "1786",
                  death: "1864",
                  photo: "👵",
                  father: { id: 522, name: "Amos Wentworth", birth: "1758", death: "1836", photo: "👴" },
                  mother: { id: 523, name: "Charity Osgood", birth: "1762", death: "1840", photo: "👵" }
                }
              },
              mother: {
                id: 131,
                name: "Harriet Sinclair",
                birth: "1814",
                death: "1892",
                photo: "👵",
                father: {
                  id: 262,
                  name: "Malcolm Sinclair",
                  birth: "1786",
                  death: "1864",
                  photo: "👴",
                  father: { id: 524, name: "Archibald Sinclair", birth: "1758", death: "1836", photo: "👴" },
                  mother: { id: 525, name: "Flora MacLeod", birth: "1762", death: "1840", photo: "👵" }
                },
                mother: {
                  id: 263,
                  name: "Elspeth Campbell",
                  birth: "1790",
                  death: "1868",
                  photo: "👵",
                  father: { id: 526, name: "Duncan Campbell", birth: "1762", death: "1840", photo: "👴" },
                  mother: { id: 527, name: "Moira Fraser", birth: "1766", death: "1844", photo: "👵" }
                }
              }
            }
          },
          mother: {
            id: 33,
            name: "Clara Bennett",
            birth: "1866",
            death: "1944",
            photo: "👵",
            father: {
              id: 66,
              name: "George Bennett",
              birth: "1838",
              death: "1916",
              photo: "👴",
              father: {
                id: 132,
                name: "William Bennett",
                birth: "1810",
                death: "1888",
                photo: "👴",
                father: {
                  id: 264,
                  name: "John Bennett",
                  birth: "1782",
                  death: "1860",
                  photo: "👴",
                  father: { id: 528, name: "Thomas Bennett", birth: "1754", death: "1832", photo: "👴" },
                  mother: { id: 529, name: "Mary Aldrich", birth: "1758", death: "1836", photo: "👵" }
                },
                mother: {
                  id: 265,
                  name: "Elizabeth Thorne",
                  birth: "1786",
                  death: "1864",
                  photo: "👵",
                  father: { id: 530, name: "Henry Thorne", birth: "1758", death: "1836", photo: "👴" },
                  mother: { id: 531, name: "Anne Prescott", birth: "1762", death: "1840", photo: "👵" }
                }
              },
              mother: {
                id: 133,
                name: "Margaret Hale",
                birth: "1814",
                death: "1892",
                photo: "👵",
                father: {
                  id: 266,
                  name: "Nathan Hale",
                  birth: "1786",
                  death: "1864",
                  photo: "👴",
                  father: { id: 532, name: "Enoch Hale", birth: "1758", death: "1836", photo: "👴" },
                  mother: { id: 533, name: "Sarah Whiting", birth: "1762", death: "1840", photo: "👵" }
                },
                mother: {
                  id: 267,
                  name: "Catherine Brewster",
                  birth: "1790",
                  death: "1868",
                  photo: "👵",
                  father: { id: 534, name: "Joseph Brewster", birth: "1762", death: "1840", photo: "👴" },
                  mother: { id: 535, name: "Ruth Standish", birth: "1766", death: "1844", photo: "👵" }
                }
              }
            },
            mother: {
              id: 67,
              name: "Louisa Carrington",
              birth: "1842",
              death: "1920",
              photo: "👵",
              father: {
                id: 134,
                name: "Frederick Carrington",
                birth: "1814",
                death: "1892",
                photo: "👴",
                father: {
                  id: 268,
                  name: "Charles Carrington",
                  birth: "1786",
                  death: "1864",
                  photo: "👴",
                  father: { id: 536, name: "Edward Carrington", birth: "1758", death: "1836", photo: "👴" },
                  mother: { id: 537, name: "Dorothy Langley", birth: "1762", death: "1840", photo: "👵" }
                },
                mother: {
                  id: 269,
                  name: "Victoria Ashworth",
                  birth: "1790",
                  death: "1868",
                  photo: "👵",
                  father: { id: 538, name: "Alfred Ashworth", birth: "1762", death: "1840", photo: "👴" },
                  mother: { id: 539, name: "Georgiana Blackwood", birth: "1766", death: "1844", photo: "👵" }
                }
              },
              mother: {
                id: 135,
                name: "Amelia Waverly",
                birth: "1818",
                death: "1896",
                photo: "👵",
                father: {
                  id: 270,
                  name: "Arthur Waverly",
                  birth: "1790",
                  death: "1868",
                  photo: "👴",
                  father: { id: 540, name: "Richard Waverly", birth: "1762", death: "1840", photo: "👴" },
                  mother: { id: 541, name: "Frances Pemberton", birth: "1766", death: "1844", photo: "👵" }
                },
                mother: {
                  id: 271,
                  name: "Isabella Thornton",
                  birth: "1794",
                  death: "1872",
                  photo: "👵",
                  father: { id: 542, name: "Robert Thornton", birth: "1766", death: "1844", photo: "👴" },
                  mother: { id: 543, name: "Eleanor Whitfield", birth: "1770", death: "1848", photo: "👵" }
                }
              }
            }
          }
        },
        mother: {
          id: 9,
          name: "Dorothy Clarke",
          birth: "1922",
          death: "2010",
          photo: "👵",
          father: {
            id: 18,
            name: "Albert Clarke",
            birth: "1894",
            death: "1972",
            photo: "👴",
            father: {
              id: 36,
              name: "Ernest Clarke",
              birth: "1866",
              death: "1944",
              photo: "👴",
              father: { id: 72, name: "Samuel Clarke", birth: "1838", death: "1916", photo: "👴" },
              mother: { id: 73, name: "Emma Sullivan", birth: "1842", death: "1920", photo: "👵" }
            },
            mother: { id: 37, name: "Rose Moretti", birth: "1870", death: "1948", photo: "👵" }
          },
          mother: { id: 19, name: "Edith Montgomery", birth: "1898", death: "1980", photo: "👵" }
        }
      },
      mother: {
        id: 5,
        name: "Barbara Williams",
        birth: "1948",
        photo: "👩",
        father: {
          id: 10,
          name: "Robert Williams",
          birth: "1920",
          death: "2005",
          photo: "👴",
          father: { id: 20, name: "James Williams", birth: "1892", death: "1970", photo: "👴" },
          mother: { id: 21, name: "Helen Foster", birth: "1896", death: "1978", photo: "👵" }
        },
        mother: {
          id: 11,
          name: "Mary O'Brien",
          birth: "1924",
          death: "2012",
          photo: "👵",
          father: { id: 22, name: "Patrick O'Brien", birth: "1896", death: "1974", photo: "👴" },
          mother: { id: 23, name: "Kathleen Brennan", birth: "1900", death: "1982", photo: "👵" }
        }
      }
    },
    mother: {
      id: 3,
      name: "Jennifer Chen",
      birth: "1975",
      photo: "👩",
      father: {
        id: 6,
        name: "David Chen",
        birth: "1948",
        photo: "👨",
        father: {
          id: 12,
          name: "Wei Chen",
          birth: "1920",
          death: "2008",
          photo: "👴",
          father: { id: 24, name: "Liang Chen", birth: "1892", death: "1970", photo: "👴" },
          mother: { id: 25, name: "Mei Lin Zhang", birth: "1896", death: "1978", photo: "👵" }
        },
        mother: {
          id: 13,
          name: "Hua Wang",
          birth: "1924",
          death: "2015",
          photo: "👵",
          father: { id: 26, name: "Jun Wang", birth: "1896", death: "1974", photo: "👴" },
          mother: { id: 27, name: "Xiu Li", birth: "1900", death: "1982", photo: "👵" }
        }
      },
      mother: {
        id: 7,
        name: "Susan Park",
        birth: "1952",
        photo: "👩",
        father: {
          id: 14,
          name: "Jin Park",
          birth: "1924",
          death: "2010",
          photo: "👴",
          father: { id: 28, name: "Sung Park", birth: "1896", death: "1974", photo: "👴" },
          mother: { id: 29, name: "Young Kim", birth: "1900", death: "1982", photo: "👵" }
        },
        mother: {
          id: 15,
          name: "Hana Lee",
          birth: "1928",
          death: "2018",
          photo: "👵",
          father: { id: 30, name: "Min Lee", birth: "1900", death: "1978", photo: "👴" },
          mother: { id: 31, name: "Soo Choi", birth: "1904", death: "1986", photo: "👵" }
        }
      }
    }
  }
};

function PersonCard({ person, onCardClick, onExpandClick, isSelected, isExpanded, hasParents, isRoot }) {
  const isDeceased = person.death;
  
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
            <div className="font-semibold text-stone-800 leading-tight font-display">
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
  const hasBothParents = node.father && node.mother;
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
      let minX = Infinity;
      let maxX = -Infinity;
      
      // Get center top point (where curves start)
      const startX = containerRect.width / 2;
      
      if (fatherRef.current) {
        const fatherRect = fatherRef.current.getBoundingClientRect();
        const fatherCenterX = fatherRect.left + fatherRect.width / 2 - containerRect.left;
        minX = Math.min(minX, fatherCenterX);
        maxX = Math.max(maxX, fatherCenterX);
        
        // Cubic bezier from top-center to father
        paths.push(`M ${startX} 0 C ${startX} 25, ${fatherCenterX} 25, ${fatherCenterX} ${height}`);
      }
      
      if (motherRef.current) {
        const motherRect = motherRef.current.getBoundingClientRect();
        const motherCenterX = motherRect.left + motherRect.width / 2 - containerRect.left;
        minX = Math.min(minX, motherCenterX);
        maxX = Math.max(maxX, motherCenterX);
        
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

function PannableCanvas({ children, zoom }) {
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
      if (node.father) ids = [...ids, ...getAllIds(node.father)];
      if (node.mother) ids = [...ids, ...getAllIds(node.mother)];
      return ids;
    };
    setExpandedNodes(new Set(getAllIds(familyData)));
  };

  const collapseAll = () => {
    setExpandedNodes(new Set([1]));
  };

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
        <p className="text-stone-500 text-lg">
          Ancestry of Jordan Powell
        </p>
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
            onClick={() => setZoom(z => Math.max(0.3, z - 0.1))}
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
      <PannableCanvas zoom={zoom}>
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
            <span>Subject</span>
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
        Drag to pan • Click card for details • Click ▼ for ancestors
      </div>
    </div>
  );
}
