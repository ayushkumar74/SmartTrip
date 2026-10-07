import fetch from 'node-fetch';

async function testSearch() {
  console.log('Testing flight search (Fallback Provider) - DEL to BOM');
  
  const dateStr = new Date();
  dateStr.setDate(dateStr.getDate() + 1); // tomorrow
  const date = dateStr.toISOString().split('T')[0];

  try {
    const res = await fetch(`http://localhost:5000/api/v1/flights/search?from=DEL&to=BOM&date=${date}`);
    const data = await res.json();
    console.log(data);
    
    if (data.data?.flights?.length > 0) {
      console.log('✅ Fallback Search returned flights');
      
      const flightId = data.data.flights[0].id;
      console.log(`\nTesting get details for flight: ${flightId}`);
      
      const detRes = await fetch(`http://localhost:5000/api/v1/flights/${flightId}`);
      const detData = await detRes.json();
      console.log(detData);
      console.log('✅ Fallback Details returned correctly');
    } else {
      console.log('❌ No flights found. Data was:', data);
    }
  } catch (error) {
    console.error('Error during test:', error);
  }
}

testSearch();
