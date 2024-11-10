import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const lat = url.searchParams.get('lat');
  const lon = url.searchParams.get('lon');
  const apiKey = process.env.GOOGLE_PLACES_API_KEY; // Use your secure API key

  if (!lat || !lon) {
    return NextResponse.json({ error: 'Latitude and longitude are required' }, { status: 400 });
  }

  try {
    const apiUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lon}&radius=10000&type=restaurant|park|tourist_attraction&key=${apiKey}`;
    console.log('Fetching data from:', apiUrl);

    const response = await fetch(apiUrl);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response from Google API: ${response.status} ${response.statusText}`);
      console.error('Response text:', errorText);
      return NextResponse.json({ error: 'Failed to fetch nearby places', details: errorText }, { status: response.status });
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      console.warn('No results found in the response');
      return NextResponse.json({ message: 'No nearby places found' }, { status: 404 });
    }

    return NextResponse.json(data.results);
  } catch (error) {
    console.error('Error fetching nearby places:', error);
    return NextResponse.json({ error: 'Failed to fetch nearby places' }, { status: 500 });
  }
}
