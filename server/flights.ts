import { getJson } from 'serpapi';

/**
 * Search for flights using SerpApi
 * @param source Source airport/city code
 * @param destination Destination airport/city code
 * @param departureDate Departure date in YYYY-MM-DD format
 * @param returnDate Return date in YYYY-MM-DD format (optional for one-way)
 * @returns Flight search results
 */
export async function searchFlights(
  source: string,
  destination: string,
  departureDate: string,
  returnDate?: string
) {
  try {
    const apiKey = process.env.SERPAPI_KEY;
    
    if (!apiKey) {
      throw new Error('SERPAPI_KEY environment variable is not set');
    }

    // Format dates for API
    const formattedDepartureDate = formatDateForSerpApi(departureDate);
    const formattedReturnDate = returnDate ? formatDateForSerpApi(returnDate) : undefined;
    
    const params: any = {
      engine: "google_flights",
      api_key: apiKey,
      departure_id: source,
      arrival_id: destination,
      outbound_date: formattedDepartureDate,
      hl: "en",
      currency: "USD",
      type: returnDate ? "round_trip" : "one_way"
    };
    
    // Add return date if provided
    if (formattedReturnDate) {
      params.return_date = formattedReturnDate;
    }
    
    console.log('Searching flights with params:', JSON.stringify(params, null, 2));
    
    const response = await getJson(params);
    return response;
  } catch (error) {
    console.error('Error searching flights:', error);
    throw new Error('Failed to search for flights');
  }
}

/**
 * Format date from YYYY-MM-DD to format SerpAPI expects (YYYY-MM-DD)
 */
function formatDateForSerpApi(dateString: string): string {
  // SerpAPI already accepts YYYY-MM-DD format, but this function
  // is here in case we need to change the format in the future
  return dateString;
}

/**
 * Get recommended flights for a trip
 * @param source Source city or airport
 * @param destination Destination city or airport
 * @param departureDate Departure date in YYYY-MM-DD format
 * @param returnDate Return date in YYYY-MM-DD format (optional)
 * @returns Top recommended flights
 */
export async function getRecommendedFlights(
  source: string,
  destination: string,
  departureDate: string,
  returnDate?: string
) {
  try {
    // Extract airport codes if full city names are provided
    const sourceCode = extractAirportCode(source);
    const destinationCode = extractAirportCode(destination);
    
    const flightResults = await searchFlights(sourceCode, destinationCode, departureDate, returnDate);
    
    // Extract best flights info
    const bestFlights = flightResults.best_flights || [];
    const otherFlights = flightResults.other_flights || [];
    
    // Combine and limit to top 3 flights
    const allFlights = [...bestFlights, ...otherFlights].slice(0, 3);
    
    // Format the flight data for our frontend
    return {
      flights: allFlights.map(formatFlightData),
      source: flightResults.airports?.[0]?.departure?.[0] || { city: sourceCode },
      destination: flightResults.airports?.[0]?.arrival?.[0] || { city: destinationCode },
      priceInsights: flightResults.price_insights
    };
  } catch (error) {
    console.error('Error getting recommended flights:', error);
    // Return mock data for development and when API fails
    return createFallbackFlightData(source, destination, departureDate, returnDate);
  }
}

/**
 * Format flight data for frontend
 */
function formatFlightData(flight: any) {
  try {
    return {
      price: flight.price,
      totalDuration: flight.total_duration,
      flights: flight.flights.map((f: any) => ({
        airline: f.airline,
        airlineLogo: f.airline_logo,
        flightNumber: f.flight_number,
        departureAirport: f.departure_airport,
        arrivalAirport: f.arrival_airport,
        duration: f.duration,
        travelClass: f.travel_class
      })),
      layovers: flight.layovers?.map((l: any) => ({
        duration: l.duration,
        airport: l.name,
        airportCode: l.id,
        overnight: l.overnight
      })) || []
    };
  } catch (error) {
    console.error('Error formatting flight data:', error);
    return {
      price: 0,
      totalDuration: 0,
      flights: [],
      layovers: []
    };
  }
}

/**
 * Extract airport code from a string
 * This is a simple implementation that assumes the code is in parentheses
 * e.g. "New York (JFK)" -> "JFK"
 */
function extractAirportCode(locationString: string): string {
  // Check if there's a code in parentheses
  const match = locationString.match(/\(([A-Z]{3})\)/);
  if (match && match[1]) {
    return match[1];
  }
  
  // If no code is found, use the first 3 characters of the city name as a fallback
  // This is just for demonstration - in a real app, we would use a proper airport lookup
  const words = locationString.split(/,|\s+/);
  return words[0].substring(0, 3).toUpperCase();
}

/**
 * Create fallback flight data when API fails or for development
 */
function createFallbackFlightData(source: string, destination: string, departureDate: string, returnDate?: string) {
  const sourceCode = extractAirportCode(source);
  const destinationCode = extractAirportCode(destination);
  
  return {
    flights: [
      {
        price: 550,
        totalDuration: 360, // 6 hours in minutes
        flights: [
          {
            airline: "Demo Airlines",
            airlineLogo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Airplane_silhouette.svg/1024px-Airplane_silhouette.svg.png",
            flightNumber: "DA123",
            departureAirport: {
              name: `${source} Airport`,
              id: sourceCode,
              time: "08:00"
            },
            arrivalAirport: {
              name: `${destination} Airport`,
              id: destinationCode,
              time: "14:00"
            },
            duration: 360,
            travelClass: "Economy"
          }
        ],
        layovers: []
      },
      {
        price: 450,
        totalDuration: 420, // 7 hours in minutes
        flights: [
          {
            airline: "Demo Express",
            airlineLogo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Airplane_silhouette.svg/1024px-Airplane_silhouette.svg.png",
            flightNumber: "DE456",
            departureAirport: {
              name: `${source} Airport`,
              id: sourceCode,
              time: "10:30"
            },
            arrivalAirport: {
              name: `${destination} Airport`,
              id: destinationCode,
              time: "17:30"
            },
            duration: 420,
            travelClass: "Economy"
          }
        ],
        layovers: []
      }
    ],
    source: {
      city: source,
      airport: {
        name: `${source} Airport`,
        id: sourceCode
      },
      country: "Unknown"
    },
    destination: {
      city: destination,
      airport: {
        name: `${destination} Airport`,
        id: destinationCode
      },
      country: "Unknown"
    },
    priceInsights: {
      lowestPrice: 450,
      typicalPriceRange: [450, 650]
    }
  };
}