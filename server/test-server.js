/**
 * Test script for genealogy server
 *
 * Usage: node test-server.js
 */

const API_URL = 'http://localhost:3001';

async function testHealth() {
  console.log('🏥 Testing health endpoint...');

  try {
    const response = await fetch(`${API_URL}/api/health`);
    const data = await response.json();
    console.log('✅ Health check:', data);
    return true;
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    return false;
  }
}

async function testSearch() {
  console.log('\n🔍 Testing genealogy search...');

  const testPerson = {
    name: 'John Watson',
    birth: '1845',
    death: '1920',
    birthPlace: 'Scotland'
  };

  try {
    const response = await fetch(`${API_URL}/api/genealogy/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ person: testPerson })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const matches = await response.json();
    console.log(`✅ Search successful! Found ${matches.length} matches`);

    if (matches.length > 0) {
      console.log('\n📊 Top match:');
      console.log(`  Name: ${matches[0].externalPerson.name}`);
      console.log(`  Confidence: ${matches[0].confidence}%`);
      console.log(`  Source: ${matches[0].source}`);
    }

    return true;
  } catch (error) {
    console.error('❌ Search failed:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting server tests...\n');

  const healthOk = await testHealth();

  if (!healthOk) {
    console.log('\n⚠️  Server appears to be down. Make sure it\'s running on port 3001');
    console.log('   Run: cd server && npm run dev');
    process.exit(1);
  }

  await testSearch();

  console.log('\n✨ Tests complete!');
}

runTests();
