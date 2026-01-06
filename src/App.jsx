import React, { useState, useCallback, useRef, useEffect } from 'react';

// Sample family data - 10 generations for UX testing
const familyData = {
  id: 1,
  name: "Ezekiel Powell",
  birth: "1780",
  death: "1855",
  photo: "👴",
  spouse: { name: "Abigail Powell", birth: "1785", death: "1860", photo: "👵" },
  children: [
    {
      id: 2,
      name: "Josiah Powell",
      birth: "1810",
      death: "1885",
      photo: "👴",
      spouse: { name: "Martha Powell", birth: "1815", death: "1890", photo: "👵" },
      children: [
        {
          id: 5,
          name: "Cornelius Powell",
          birth: "1840",
          death: "1915",
          photo: "👴",
          spouse: { name: "Harriet Powell", birth: "1845", death: "1920", photo: "👵" },
          children: [
            {
              id: 12,
              name: "Walter Powell",
              birth: "1870",
              death: "1945",
              photo: "👴",
              spouse: { name: "Edith Powell", birth: "1875", death: "1950", photo: "👵" },
              children: [
                {
                  id: 25,
                  name: "Harold Powell",
                  birth: "1900",
                  death: "1975",
                  photo: "👴",
                  spouse: { name: "Dorothy Powell", birth: "1905", death: "1980", photo: "👵" },
                  children: [
                    {
                      id: 50,
                      name: "Richard Powell",
                      birth: "1930",
                      death: "2005",
                      photo: "👴",
                      spouse: { name: "Barbara Powell", birth: "1935", death: "2015", photo: "👵" },
                      children: [
                        {
                          id: 100,
                          name: "David Powell",
                          birth: "1955",
                          photo: "👨",
                          spouse: { name: "Linda Powell", birth: "1958", photo: "👩" },
                          children: [
                            {
                              id: 200,
                              name: "Michael Powell",
                              birth: "1980",
                              photo: "👨",
                              spouse: { name: "Jennifer Powell", birth: "1982", photo: "👩" },
                              children: [
                                {
                                  id: 400,
                                  name: "Ethan Powell",
                                  birth: "2005",
                                  photo: "👦",
                                  children: [
                                    { id: 800, name: "Baby Powell", birth: "2024", photo: "👶", children: [] }
                                  ]
                                },
                                { id: 401, name: "Sophia Powell", birth: "2008", photo: "👧", children: [] }
                              ]
                            },
                            {
                              id: 201,
                              name: "Sarah Chen",
                              birth: "1983",
                              photo: "👩",
                              spouse: { name: "Kevin Chen", birth: "1980", photo: "👨" },
                              children: [
                                { id: 402, name: "Emily Chen", birth: "2010", photo: "👧", children: [] },
                                { id: 403, name: "Ryan Chen", birth: "2013", photo: "👦", children: [] }
                              ]
                            }
                          ]
                        },
                        {
                          id: 101,
                          name: "Susan Martinez",
                          birth: "1958",
                          photo: "👩",
                          spouse: { name: "Carlos Martinez", birth: "1955", photo: "👨" },
                          children: [
                            {
                              id: 202,
                              name: "Daniel Martinez",
                              birth: "1985",
                              photo: "👨",
                              spouse: { name: "Rachel Martinez", birth: "1987", photo: "👩" },
                              children: [
                                { id: 404, name: "Lucas Martinez", birth: "2015", photo: "👦", children: [] },
                                { id: 405, name: "Mia Martinez", birth: "2018", photo: "👧", children: [] }
                              ]
                            }
                          ]
                        }
                      ]
                    },
                    {
                      id: 51,
                      name: "Margaret Wilson",
                      birth: "1933",
                      death: "2010",
                      photo: "👵",
                      spouse: { name: "Robert Wilson", birth: "1930", death: "2008", photo: "👴" },
                      children: [
                        {
                          id: 102,
                          name: "James Wilson",
                          birth: "1960",
                          photo: "👨",
                          spouse: { name: "Patricia Wilson", birth: "1962", photo: "👩" },
                          children: [
                            {
                              id: 203,
                              name: "Christopher Wilson",
                              birth: "1988",
                              photo: "👨",
                              spouse: { name: "Amanda Wilson", birth: "1990", photo: "👩" },
                              children: [
                                { id: 406, name: "Oliver Wilson", birth: "2016", photo: "👦", children: [] },
                                { id: 407, name: "Charlotte Wilson", birth: "2019", photo: "👧", children: [] }
                              ]
                            },
                            {
                              id: 204,
                              name: "Jessica Brown",
                              birth: "1990",
                              photo: "👩",
                              spouse: { name: "Matthew Brown", birth: "1988", photo: "👨" },
                              children: [
                                { id: 408, name: "Liam Brown", birth: "2018", photo: "👦", children: [] }
                              ]
                            }
                          ]
                        }
                      ]
                    }
                  ]
                },
                {
                  id: 26,
                  name: "Florence Thompson",
                  birth: "1903",
                  death: "1978",
                  photo: "👵",
                  spouse: { name: "George Thompson", birth: "1900", death: "1975", photo: "👴" },
                  children: [
                    {
                      id: 52,
                      name: "William Thompson",
                      birth: "1935",
                      death: "2020",
                      photo: "👴",
                      spouse: { name: "Eleanor Thompson", birth: "1938", photo: "👵" },
                      children: [
                        {
                          id: 103,
                          name: "Thomas Thompson",
                          birth: "1965",
                          photo: "👨",
                          spouse: { name: "Nancy Thompson", birth: "1967", photo: "👩" },
                          children: [
                            {
                              id: 205,
                              name: "Andrew Thompson",
                              birth: "1992",
                              photo: "👨",
                              children: [
                                { id: 409, name: "Henry Thompson", birth: "2020", photo: "👦", children: [] }
                              ]
                            },
                            { id: 206, name: "Elizabeth Thompson", birth: "1995", photo: "👩", children: [] }
                          ]
                        }
                      ]
                    }
                  ]
                }
              ]
            },
            {
              id: 13,
              name: "Adelaide Brooks",
              birth: "1873",
              death: "1948",
              photo: "👵",
              spouse: { name: "Frederick Brooks", birth: "1870", death: "1945", photo: "👴" },
              children: [
                {
                  id: 27,
                  name: "Arthur Brooks",
                  birth: "1905",
                  death: "1980",
                  photo: "👴",
                  spouse: { name: "Lillian Brooks", birth: "1908", death: "1985", photo: "👵" },
                  children: [
                    {
                      id: 53,
                      name: "Edward Brooks",
                      birth: "1938",
                      photo: "👨",
                      spouse: { name: "Virginia Brooks", birth: "1940", photo: "👩" },
                      children: [
                        {
                          id: 104,
                          name: "Steven Brooks",
                          birth: "1968",
                          photo: "👨",
                          spouse: { name: "Michelle Brooks", birth: "1970", photo: "👩" },
                          children: [
                            {
                              id: 207,
                              name: "Brandon Brooks",
                              birth: "1995",
                              photo: "👨",
                              spouse: { name: "Kayla Brooks", birth: "1996", photo: "👩" },
                              children: [
                                { id: 410, name: "Zoey Brooks", birth: "2022", photo: "👧", children: [] }
                              ]
                            },
                            { id: 208, name: "Brittany Brooks", birth: "1998", photo: "👩", children: [] }
                          ]
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          id: 6,
          name: "Beatrice Adams",
          birth: "1843",
          death: "1918",
          photo: "👵",
          spouse: { name: "Samuel Adams", birth: "1840", death: "1915", photo: "👴" },
          children: [
            {
              id: 14,
              name: "Charles Adams",
              birth: "1875",
              death: "1950",
              photo: "👴",
              spouse: { name: "Clara Adams", birth: "1878", death: "1955", photo: "👵" },
              children: [
                {
                  id: 28,
                  name: "Raymond Adams",
                  birth: "1908",
                  death: "1983",
                  photo: "👴",
                  spouse: { name: "Helen Adams", birth: "1910", death: "1988", photo: "👵" },
                  children: [
                    {
                      id: 54,
                      name: "Donald Adams",
                      birth: "1940",
                      photo: "👨",
                      spouse: { name: "Carol Adams", birth: "1942", photo: "👩" },
                      children: [
                        {
                          id: 105,
                          name: "Kenneth Adams",
                          birth: "1970",
                          photo: "👨",
                          spouse: { name: "Laura Adams", birth: "1972", photo: "👩" },
                          children: [
                            {
                              id: 209,
                              name: "Tyler Adams",
                              birth: "1998",
                              photo: "👨",
                              children: [
                                { id: 411, name: "Luna Adams", birth: "2023", photo: "👶", children: [] }
                              ]
                            },
                            { id: 210, name: "Ashley Adams", birth: "2000", photo: "👩", children: [] }
                          ]
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 3,
      name: "Prudence Clarke",
      birth: "1812",
      death: "1887",
      photo: "👵",
      spouse: { name: "Nathaniel Clarke", birth: "1808", death: "1882", photo: "👴" },
      children: [
        {
          id: 7,
          name: "Edmund Clarke",
          birth: "1845",
          death: "1920",
          photo: "👴",
          spouse: { name: "Louisa Clarke", birth: "1848", death: "1923", photo: "👵" },
          children: [
            {
              id: 15,
              name: "Albert Clarke",
              birth: "1878",
              death: "1953",
              photo: "👴",
              spouse: { name: "Rose Clarke", birth: "1880", death: "1958", photo: "👵" },
              children: [
                {
                  id: 29,
                  name: "Frank Clarke",
                  birth: "1910",
                  death: "1985",
                  photo: "👴",
                  spouse: { name: "Ruth Clarke", birth: "1912", death: "1990", photo: "👵" },
                  children: [
                    {
                      id: 55,
                      name: "Gerald Clarke",
                      birth: "1942",
                      photo: "👨",
                      spouse: { name: "Judith Clarke", birth: "1944", photo: "👩" },
                      children: [
                        {
                          id: 106,
                          name: "Mark Clarke",
                          birth: "1972",
                          photo: "👨",
                          spouse: { name: "Diane Clarke", birth: "1974", photo: "👩" },
                          children: [
                            {
                              id: 211,
                              name: "Justin Clarke",
                              birth: "2000",
                              photo: "👨",
                              children: []
                            },
                            { id: 212, name: "Amber Clarke", birth: "2003", photo: "👩", children: [] }
                          ]
                        },
                        {
                          id: 107,
                          name: "Lisa Garcia",
                          birth: "1975",
                          photo: "👩",
                          spouse: { name: "Antonio Garcia", birth: "1973", photo: "👨" },
                          children: [
                            { id: 213, name: "Isabella Garcia", birth: "2002", photo: "👩", children: [] },
                            { id: 214, name: "Diego Garcia", birth: "2005", photo: "👨", children: [] }
                          ]
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 4,
      name: "Ephraim Powell",
      birth: "1815",
      death: "1890",
      photo: "👴",
      spouse: { name: "Susannah Powell", birth: "1818", death: "1893", photo: "👵" },
      children: [
        {
          id: 8,
          name: "Horace Powell",
          birth: "1848",
          death: "1923",
          photo: "👴",
          spouse: { name: "Matilda Powell", birth: "1850", death: "1925", photo: "👵" },
          children: [
            {
              id: 16,
              name: "Ernest Powell",
              birth: "1880",
              death: "1955",
              photo: "👴",
              spouse: { name: "Mabel Powell", birth: "1882", death: "1960", photo: "👵" },
              children: [
                {
                  id: 30,
                  name: "Howard Powell",
                  birth: "1912",
                  death: "1987",
                  photo: "👴",
                  spouse: { name: "Evelyn Powell", birth: "1915", death: "1992", photo: "👵" },
                  children: [
                    {
                      id: 56,
                      name: "Roger Powell",
                      birth: "1945",
                      photo: "👨",
                      spouse: { name: "Shirley Powell", birth: "1947", photo: "👩" },
                      children: [
                        {
                          id: 108,
                          name: "Timothy Powell",
                          birth: "1975",
                          photo: "👨",
                          spouse: { name: "Heather Powell", birth: "1977", photo: "👩" },
                          children: [
                            {
                              id: 215,
                              name: "Nathan Powell",
                              birth: "2003",
                              photo: "👨",
                              children: []
                            },
                            { id: 216, name: "Samantha Powell", birth: "2006", photo: "👩", children: [] }
                          ]
                        },
                        {
                          id: 109,
                          name: "Rebecca Lee",
                          birth: "1978",
                          photo: "👩",
                          spouse: { name: "Jason Lee", birth: "1976", photo: "👨" },
                          children: [
                            { id: 217, name: "Aiden Lee", birth: "2008", photo: "👦", children: [] },
                            { id: 218, name: "Chloe Lee", birth: "2011", photo: "👧", children: [] }
                          ]
                        }
                      ]
                    },
                    {
                      id: 57,
                      name: "Janet Taylor",
                      birth: "1948",
                      photo: "👩",
                      spouse: { name: "Larry Taylor", birth: "1945", death: "2018", photo: "👴" },
                      children: [
                        {
                          id: 110,
                          name: "Brian Taylor",
                          birth: "1978",
                          photo: "👨",
                          spouse: { name: "Stephanie Taylor", birth: "1980", photo: "👩" },
                          children: [
                            { id: 219, name: "Mason Taylor", birth: "2010", photo: "👦", children: [] },
                            { id: 220, name: "Ella Taylor", birth: "2013", photo: "👧", children: [] }
                          ]
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          id: 9,
          name: "Lucinda Morgan",
          birth: "1850",
          death: "1925",
          photo: "👵",
          spouse: { name: "Theodore Morgan", birth: "1848", death: "1920", photo: "👴" },
          children: [
            {
              id: 17,
              name: "Clarence Morgan",
              birth: "1882",
              death: "1957",
              photo: "👴",
              spouse: { name: "Pearl Morgan", birth: "1885", death: "1962", photo: "👵" },
              children: [
                {
                  id: 31,
                  name: "Vernon Morgan",
                  birth: "1915",
                  death: "1990",
                  photo: "👴",
                  spouse: { name: "Irene Morgan", birth: "1918", death: "1995", photo: "👵" },
                  children: [
                    {
                      id: 58,
                      name: "Dennis Morgan",
                      birth: "1948",
                      photo: "👨",
                      spouse: { name: "Sandra Morgan", birth: "1950", photo: "👩" },
                      children: [
                        {
                          id: 111,
                          name: "Scott Morgan",
                          birth: "1980",
                          photo: "👨",
                          spouse: { name: "Kimberly Morgan", birth: "1982", photo: "👩" },
                          children: [
                            { id: 221, name: "Logan Morgan", birth: "2012", photo: "👦", children: [] },
                            { id: 222, name: "Avery Morgan", birth: "2015", photo: "👧", children: [] }
                          ]
                        }
                      ]
                    }
                  ]
                }
              ]
            }
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
      onClick={(e) => {
        e.stopPropagation();
        onClick(person);
      }}
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

function ChildrenContainer({ children, onSelectPerson, selectedPerson, expandedNodes, toggleExpand, level }) {
  const containerRef = useRef(null);
  const [linePositions, setLinePositions] = useState({ left: 0, right: 0 });

  useEffect(() => {
    const updateLines = () => {
      if (containerRef.current && children.length > 1) {
        const container = containerRef.current;
        const childNodes = container.querySelectorAll(':scope > div');
        
        if (childNodes.length > 0) {
          const containerRect = container.getBoundingClientRect();
          const centers = [];
          
          childNodes.forEach((child) => {
            const rect = child.getBoundingClientRect();
            const center = rect.left + rect.width / 2 - containerRect.left;
            centers.push(center);
          });
          
          setLinePositions({
            left: centers[0],
            right: centers[centers.length - 1]
          });
        }
      }
    };

    updateLines();
    
    // Also update on window resize
    window.addEventListener('resize', updateLines);
    
    // Small delay to ensure DOM is fully rendered
    const timeout = setTimeout(updateLines, 100);
    
    return () => {
      window.removeEventListener('resize', updateLines);
      clearTimeout(timeout);
    };
  }, [children, expandedNodes]);

  return (
    <div className="relative mt-8">
      {/* Vertical line from parent */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-6 -mt-6 bg-stone-400"
      />
      
      {/* Horizontal connecting line */}
      {children.length > 1 && linePositions.right > linePositions.left && (
        <div 
          className="absolute top-0 h-0.5 -mt-2 bg-stone-400"
          style={{
            left: `${linePositions.left}px`,
            width: `${linePositions.right - linePositions.left}px`,
          }}
        />
      )}
      
      {/* Children */}
      <div ref={containerRef} className="flex gap-8 items-start">
        {children.map((child) => (
          <div key={child.id} className="relative flex flex-col items-center">
            {/* Vertical line to each child */}
            <div 
              className="absolute -top-2 left-1/2 -translate-x-1/2 w-0.5 h-4 bg-stone-400"
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
        <ChildrenContainer
          children={node.children}
          onSelectPerson={onSelectPerson}
          selectedPerson={selectedPerson}
          expandedNodes={expandedNodes}
          toggleExpand={toggleExpand}
          level={level}
        />
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

function PannableCanvas({ children, zoom }) {
  const containerRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hasMoved, setHasMoved] = useState(false);

  const handleMouseDown = (e) => {
    // Don't start dragging if clicking on a card or button
    if (e.target.closest('[data-card]') || e.target.closest('button')) return;
    
    setIsDragging(true);
    setHasMoved(false);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    
    if (Math.abs(newX - position.x) > 3 || Math.abs(newY - position.y) > 3) {
      setHasMoved(true);
    }
    
    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    if (e.target.closest('[data-card]') || e.target.closest('button')) return;
    
    const touch = e.touches[0];
    setIsDragging(true);
    setHasMoved(false);
    setDragStart({
      x: touch.clientX - position.x,
      y: touch.clientY - position.y
    });
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    const newX = touch.clientX - dragStart.x;
    const newY = touch.clientY - dragStart.y;
    
    if (Math.abs(newX - position.x) > 3 || Math.abs(newY - position.y) > 3) {
      setHasMoved(true);
    }
    
    setPosition({ x: newX, y: newY });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const resetPosition = () => {
    setPosition({ x: 0, y: 0 });
  };

  useEffect(() => {
    const handleMouseUpGlobal = () => setIsDragging(false);
    window.addEventListener('mouseup', handleMouseUpGlobal);
    window.addEventListener('touchend', handleMouseUpGlobal);
    return () => {
      window.removeEventListener('mouseup', handleMouseUpGlobal);
      window.removeEventListener('touchend', handleMouseUpGlobal);
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
      onTouchEnd={handleTouchEnd}
    >
      <div 
        className="absolute inset-0 flex justify-center items-start pt-8"
        style={{ 
          transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
          transformOrigin: 'top center',
        }}
      >
        <div className="min-w-max px-8 py-4">
          {children}
        </div>
      </div>
      
      {/* Reset position button */}
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
          Ten Generations of Heritage
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

      {/* Pannable Family Tree */}
      <PannableCanvas zoom={zoom}>
        <FamilyNode 
          node={familyData}
          onSelectPerson={setSelectedPerson}
          selectedPerson={selectedPerson}
          expandedNodes={expandedNodes}
          toggleExpand={toggleExpand}
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
        Drag to pan • Click person for details • Click ▼ to expand
      </div>
    </div>
  );
}
