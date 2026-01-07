// GEDCOM Parser - parses .ged files and builds ancestry trees

export function parseGedcom(gedcomText) {
  const lines = gedcomText.split(/\r?\n/);
  
  const individuals = {};
  const families = {};
  
  let currentEntity = null;
  let currentId = null;
  let currentSubRecord = null;
  
  for (const line of lines) {
    const match = line.match(/^(\d+)\s+(@[\w]+@)?\s*(\w+)?\s*(.*)?$/);
    if (!match) continue;
    
    const [, level, id, tag, value] = match;
    const lvl = parseInt(level);
    
    if (lvl === 0) {
      if (tag === 'INDI') {
        currentEntity = 'INDI';
        currentId = id;
        individuals[id] = { 
          id, 
          name: '', 
          givenName: '', 
          surname: '', 
          sex: '', 
          birth: '', 
          death: '', 
          birthPlace: '', 
          deathPlace: '',
          famc: null, 
          fams: [] 
        };
      } else if (tag === 'FAM') {
        currentEntity = 'FAM';
        currentId = id;
        families[id] = { id, husb: null, wife: null, children: [] };
      } else {
        currentEntity = null;
        currentId = null;
      }
      currentSubRecord = null;
    } else if (lvl === 1 && currentEntity === 'INDI') {
      if (tag === 'NAME') {
        const nameMatch = value.match(/(.+?)\s*\/(.+?)\//);
        if (nameMatch) {
          let givenName = nameMatch[1].trim();
          // Fix camelCase names like "WilliamTheodore" -> "William Theodore"
          givenName = givenName.replace(/([a-z])([A-Z])/g, '$1 $2');
          const surname = nameMatch[2].trim();
          individuals[currentId].givenName = givenName;
          individuals[currentId].surname = surname;
          individuals[currentId].name = `${givenName} ${surname}`;
        } else {
          individuals[currentId].name = value.replace(/\//g, '').trim();
        }
      } else if (tag === 'SEX') {
        individuals[currentId].sex = value;
      } else if (tag === 'BIRT') {
        currentSubRecord = 'BIRT';
      } else if (tag === 'DEAT') {
        currentSubRecord = 'DEAT';
      } else if (tag === 'FAMC') {
        individuals[currentId].famc = value;
      } else if (tag === 'FAMS') {
        individuals[currentId].fams.push(value);
      } else {
        currentSubRecord = null;
      }
    } else if (lvl === 2 && currentEntity === 'INDI') {
      if (currentSubRecord === 'BIRT' && tag === 'DATE') {
        individuals[currentId].birth = value;
      } else if (currentSubRecord === 'BIRT' && tag === 'PLAC') {
        individuals[currentId].birthPlace = value;
      } else if (currentSubRecord === 'DEAT' && tag === 'DATE') {
        individuals[currentId].death = value;
      } else if (currentSubRecord === 'DEAT' && tag === 'PLAC') {
        individuals[currentId].deathPlace = value;
      }
    } else if (lvl === 1 && currentEntity === 'FAM') {
      if (tag === 'HUSB') {
        families[currentId].husb = value;
      } else if (tag === 'WIFE') {
        families[currentId].wife = value;
      } else if (tag === 'CHIL') {
        families[currentId].children.push(value);
      }
    }
  }
  
  return { individuals, families };
}

// Extract year from various date formats
function getYear(dateStr) {
  if (!dateStr) return '';
  const match = dateStr.match(/(\d{4})/);
  return match ? match[1] : dateStr;
}

// Get emoji based on sex and living status
function getPhoto(person) {
  if (!person) return '👤';
  const hasDeathDate = person.death && person.death.length > 0;
  if (person.sex === 'M') {
    return hasDeathDate ? '👴' : '👨';
  } else if (person.sex === 'F') {
    return hasDeathDate ? '👵' : '👩';
  }
  return '👤';
}

// Build ancestry tree recursively for a given person
export function buildAncestryTree(personId, individuals, families, depth = 0, maxDepth = 20) {
  if (!personId || depth > maxDepth) return null;
  
  const person = individuals[personId];
  if (!person) return null;
  
  const node = {
    id: personId,
    name: person.name || 'Unknown',
    birth: getYear(person.birth),
    death: getYear(person.death) || null,
    birthPlace: person.birthPlace || '',
    deathPlace: person.deathPlace || '',
    photo: getPhoto(person),
  };
  
  // Find parents through FAMC (family as child)
  if (person.famc) {
    const family = families[person.famc];
    if (family) {
      if (family.husb) {
        const father = buildAncestryTree(family.husb, individuals, families, depth + 1, maxDepth);
        if (father) node.father = father;
      }
      if (family.wife) {
        const mother = buildAncestryTree(family.wife, individuals, families, depth + 1, maxDepth);
        if (mother) node.mother = mother;
      }
    }
  }
  
  return node;
}

// Find a person by name (case-insensitive, partial match)
export function findPersonByName(name, individuals) {
  const searchName = name.toLowerCase().replace(/\s+/g, ' ').trim();
  
  for (const [id, person] of Object.entries(individuals)) {
    const personName = person.name.toLowerCase().replace(/\s+/g, ' ').trim();
    if (personName === searchName || personName.includes(searchName)) {
      return id;
    }
  }
  return null;
}

// Get list of all individuals for searching
export function getAllIndividuals(individuals) {
  return Object.entries(individuals).map(([id, person]) => ({
    id,
    name: person.name,
    birth: getYear(person.birth),
    death: getYear(person.death),
  }));
}
