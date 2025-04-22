import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { TravelPlanForm } from "@shared/schema";
import { differenceInDays, format } from "date-fns";

// Initialize Gemini with the API key
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY environment variable is not set, using mock generator");
    return null;
  }
  return new GoogleGenerativeAI(apiKey);
}

export async function generateGeminiResponse(travelPlanData: TravelPlanForm) {
  try {
    // Calculate the number of days for the trip
    const startDate = new Date(travelPlanData.startDate);
    const endDate = new Date(travelPlanData.endDate);
    const tripDuration = differenceInDays(endDate, startDate) + 1;
    
    // Format the interests in a readable way
    const interests = travelPlanData.interests.join(", ");
    
    const genAI = getGeminiClient();
    
    // If no API key is available, use the fallback itinerary
    if (!genAI) {
      console.log("No Gemini API key available, using demo itinerary data");
      return createDemoItinerary(travelPlanData, tripDuration);
    }
    
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash", // Use the requested Gemini 1.5 Flash model
    });
    
    // Create a prompt for Gemini
    const prompt = `You are an expert travel planner. Create a detailed day-by-day travel itinerary for a trip with the following details:

Source: ${travelPlanData.source}
Destination: ${travelPlanData.destination}
Dates: ${format(startDate, 'MMM d, yyyy')} to ${format(endDate, 'MMM d, yyyy')} (${tripDuration} days)
Budget: ${travelPlanData.currency} ${travelPlanData.budget}
Number of Travelers: ${travelPlanData.travelers}
Interests: ${interests}
${travelPlanData.additionalNotes ? `Additional Notes: ${travelPlanData.additionalNotes}` : ''}

For each day, please provide:
1. A day title/theme
2. Morning activities (1-3 activities with descriptions, locations, and recommended times)
3. Afternoon activities (1-3 activities with descriptions, locations, and recommended times)
4. Evening activities (1-3 activities with descriptions, locations, and recommended times)

Also include:
- 5-7 practical travel tips specific to the destination
- 5 must-see locations that shouldn't be missed
- 5 food recommendations typical of the destination

Generate the response in a structured JSON format with the following schema:
{
  "days": [
    {
      "title": "Day title/theme",
      "morning": {
        "activities": [
          {
            "title": "Activity name",
            "description": "Detailed description",
            "location": "Specific location name",
            "time": "Recommended time"
          }
        ]
      },
      "afternoon": {
        "activities": [...]
      },
      "evening": {
        "activities": [...]
      }
    }
  ],
  "tips": ["tip 1", "tip 2", ...],
  "mustSeeLocations": ["location 1", "location 2", ...],
  "foodRecommendations": ["food 1", "food 2", ...]
}

Ensure all recommendations stay within the specified budget and match the travelers' interests.`;

    // Configure safety settings
    const generationConfig = {
      temperature: 0.7,
      topP: 0.9,
      topK: 40,
    };

    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ];

    // Generate content with Gemini
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig,
      safetySettings,
    });

    const response = result.response;
    const textResponse = response.text();
    
    // Extract the JSON part of the response
    let jsonStartIndex = textResponse.indexOf('{');
    let jsonEndIndex = textResponse.lastIndexOf('}');
    
    if (jsonStartIndex !== -1 && jsonEndIndex !== -1 && jsonEndIndex > jsonStartIndex) {
      const jsonStr = textResponse.substring(jsonStartIndex, jsonEndIndex + 1);
      try {
        return JSON.parse(jsonStr);
      } catch (error) {
        console.error("Error parsing JSON from Gemini response:", error);
        throw new Error("Failed to parse itinerary data");
      }
    } else {
      // If we couldn't find JSON, attempt to structure the response
      // This is a fallback in case Gemini doesn't return proper JSON
      return createFallbackItinerary(textResponse, tripDuration);
    }
  } catch (error) {
    console.error("Error generating travel plan with Gemini:", error);
    throw new Error("Failed to generate travel plan");
  }
}

// Fallback function that attempts to structure non-JSON responses
function createFallbackItinerary(text: string, numDays: number) {
  // Simple fallback structure
  const fallbackItinerary = {
    days: Array.from({ length: numDays }, (_, i) => ({
      title: `Day ${i + 1} - Exploration`,
      morning: {
        activities: [
          {
            title: "Breakfast & Planning",
            description: "Start your day with a local breakfast and plan the day's adventures.",
            location: "Hotel/Accommodation",
            time: "8:00 AM - 10:00 AM"
          }
        ]
      },
      afternoon: {
        activities: [
          {
            title: "Sightseeing",
            description: "Explore the main attractions of the destination.",
            location: "City Center",
            time: "12:00 PM - 4:00 PM"
          }
        ]
      },
      evening: {
        activities: [
          {
            title: "Dinner Experience",
            description: "Enjoy local cuisine for dinner.",
            location: "Local Restaurant",
            time: "7:00 PM - 9:00 PM"
          }
        ]
      }
    })),
    tips: [
      "Research local customs before your trip",
      "Keep important documents in a safe place",
      "Try to learn a few phrases in the local language",
      "Check the weather forecast before packing",
      "Notify your bank about your travel plans"
    ],
    mustSeeLocations: [
      "Main city square",
      "Local museum",
      "Historical landmark",
      "Popular viewpoint",
      "Local market"
    ],
    foodRecommendations: [
      "Local specialty dish",
      "Traditional dessert",
      "Popular street food",
      "Regional beverage",
      "Famous restaurant dish"
    ]
  };
  
  return fallbackItinerary;
}

// Function to create a demo itinerary based on the selected destination
function createDemoItinerary(travelData: TravelPlanForm, numDays: number) {
  const destination = travelData.destination.toLowerCase();
  let demoData;
  
  // Some basic destination-specific data
  if (destination.includes('paris') || destination.includes('france')) {
    demoData = {
      days: Array.from({ length: numDays }, (_, i) => ({
        title: i === 0 ? "Day 1 - Welcome to Paris" : 
               i === 1 ? "Day 2 - Art and Culture" : 
               i === 2 ? "Day 3 - Parisian Lifestyle" : 
               `Day ${i + 1} - Exploring Paris`,
        morning: {
          activities: [
            {
              title: i === 0 ? "Eiffel Tower Visit" : 
                     i === 1 ? "Louvre Museum" : 
                     i === 2 ? "Montmartre Walk" : 
                     "Café and Croissants",
              description: "Experience the iconic symbol of Paris with breathtaking views of the city.",
              location: i === 0 ? "Champ de Mars, 5 Avenue Anatole France" : 
                        i === 1 ? "Rue de Rivoli, 75001 Paris" : 
                        i === 2 ? "Montmartre, 75018 Paris" : 
                        "Local Parisian Café",
              time: "9:00 AM - 12:00 PM"
            }
          ]
        },
        afternoon: {
          activities: [
            {
              title: i === 0 ? "Seine River Cruise" : 
                     i === 1 ? "Notre-Dame Cathedral" : 
                     i === 2 ? "Luxembourg Gardens" : 
                     "Shopping at Champs-Élysées",
              description: "Enjoy Paris from a different perspective with a scenic river cruise.",
              location: i === 0 ? "Seine River, Departure near Eiffel Tower" : 
                        i === 1 ? "6 Parvis Notre-Dame - Pl. Jean-Paul II, 75004" : 
                        i === 2 ? "6e Arrondissement, 75006 Paris" : 
                        "Avenue des Champs-Élysées, 75008 Paris",
              time: "2:00 PM - 5:00 PM"
            }
          ]
        },
        evening: {
          activities: [
            {
              title: i === 0 ? "Dinner at Montparnasse" : 
                     i === 1 ? "Evening at Moulin Rouge" : 
                     i === 2 ? "Fine Dining Experience" : 
                     "Parisian Night Walk",
              description: "Enjoy authentic French cuisine with a view of the illuminated Eiffel Tower.",
              location: i === 0 ? "Avenue du Maine, 75015 Paris" : 
                        i === 1 ? "82 Boulevard de Clichy, 75018 Paris" : 
                        i === 2 ? "Le Marais district" : 
                        "Along the Seine River",
              time: "7:00 PM - 10:00 PM"
            }
          ]
        }
      })),
      tips: [
        "Learn a few basic French phrases - locals appreciate the effort",
        "Many museums are free on the first Sunday of each month",
        "The Paris Museum Pass can save you money if you plan to visit multiple sites",
        "Be aware of pickpockets, especially in crowded tourist areas",
        "Restaurants often have fixed price menus (prix fixe) which offer good value",
        "Consider buying a carnet of 10 metro tickets to save money on transportation"
      ],
      mustSeeLocations: [
        "Eiffel Tower - Iconic symbol of Paris",
        "Louvre Museum - Home to thousands of works of art, including the Mona Lisa",
        "Notre-Dame Cathedral - Masterpiece of French Gothic architecture",
        "Champs-Élysées and Arc de Triomphe - Famous avenue and monument",
        "Montmartre and Sacré-Cœur - Artistic neighborhood with stunning basilica"
      ],
      foodRecommendations: [
        "Croissants and Pain au Chocolat - Must try from a local bakery",
        "Boeuf Bourguignon - Classic French beef stew",
        "Escargot - Snails prepared with garlic and butter",
        "Macarons - Try these colorful confections from Ladurée or Pierre Hermé",
        "Cheese and Wine - Experience a traditional French cheese board with local wine"
      ]
    };
  } else if (destination.includes('new york') || destination.includes('nyc')) {
    demoData = {
      days: Array.from({ length: numDays }, (_, i) => ({
        title: i === 0 ? "Day 1 - Manhattan Highlights" : 
               i === 1 ? "Day 2 - Arts and Culture" : 
               i === 2 ? "Day 3 - New York Neighborhoods" : 
               `Day ${i + 1} - Exploring NYC`,
        morning: {
          activities: [
            {
              title: i === 0 ? "Empire State Building" : 
                     i === 1 ? "Metropolitan Museum of Art" : 
                     i === 2 ? "Brooklyn Bridge Walk" : 
                     "New York Bagels and Coffee",
              description: "Experience panoramic views from one of New York's most iconic buildings.",
              location: i === 0 ? "350 Fifth Avenue, Manhattan" : 
                        i === 1 ? "1000 Fifth Avenue, Manhattan" : 
                        i === 2 ? "Brooklyn Bridge, Start at City Hall Park" : 
                        "Local NYC Café",
              time: "9:00 AM - 12:00 PM"
            }
          ]
        },
        afternoon: {
          activities: [
            {
              title: i === 0 ? "Central Park Exploration" : 
                     i === 1 ? "American Museum of Natural History" : 
                     i === 2 ? "High Line and Chelsea Market" : 
                     "Shopping in SoHo",
              description: "Enjoy the green heart of Manhattan with various attractions inside the park.",
              location: i === 0 ? "Central Park, Manhattan" : 
                        i === 1 ? "200 Central Park West, Manhattan" : 
                        i === 2 ? "The High Line, Start at Gansevoort Street" : 
                        "SoHo, Manhattan",
              time: "2:00 PM - 5:00 PM"
            }
          ]
        },
        evening: {
          activities: [
            {
              title: i === 0 ? "Times Square Night Experience" : 
                     i === 1 ? "Broadway Show" : 
                     i === 2 ? "Dinner in Little Italy" : 
                     "Rooftop Bar Experience",
              description: "Be dazzled by the bright lights and energy of Times Square at night.",
              location: i === 0 ? "Times Square, Manhattan" : 
                        i === 1 ? "Broadway Theatre District, Manhattan" : 
                        i === 2 ? "Little Italy, Manhattan" : 
                        "Manhattan Rooftop Bar",
              time: "7:00 PM - 10:00 PM"
            }
          ]
        }
      })),
      tips: [
        "Purchase a MetroCard for unlimited subway and bus trips during your stay",
        "Many museums have 'pay what you wish' times - check their websites",
        "Consider the New York CityPASS if you plan to visit multiple attractions",
        "Comfortable walking shoes are essential - New Yorkers walk everywhere",
        "Tipping 15-20% is customary in restaurants",
        "Take advantage of free Staten Island Ferry for views of the Statue of Liberty"
      ],
      mustSeeLocations: [
        "Empire State Building - Iconic Art Deco skyscraper with observation deck",
        "Central Park - Urban oasis with walking paths, lakes, and attractions",
        "Statue of Liberty and Ellis Island - Symbols of American freedom and immigration",
        "Times Square - The bright and bustling heart of Manhattan",
        "Metropolitan Museum of Art - One of the world's largest and finest art museums"
      ],
      foodRecommendations: [
        "New York Pizza - Fold it like a local when eating a slice",
        "Bagel with Lox and Cream Cheese - Breakfast classic",
        "Pastrami on Rye from a classic deli like Katz's",
        "Food cart hot dogs and pretzels - Street food staples",
        "Cheesecake from Junior's or another famous bakery"
      ]
    };
  } else {
    // Generic destination
    demoData = {
      days: Array.from({ length: numDays }, (_, i) => ({
        title: `Day ${i + 1} - ${travelData.destination} Exploration`,
        morning: {
          activities: [
            {
              title: i === 0 ? "City Introduction Tour" : 
                     i === 1 ? "Local Museum Visit" : 
                     i === 2 ? "Landmark Exploration" : 
                     "Morning Cultural Activity",
              description: "Start your trip with an overview of the main attractions and history.",
              location: i === 0 ? "City Center" : 
                        i === 1 ? "National Museum" : 
                        i === 2 ? "Famous Landmark" : 
                        "Cultural District",
              time: "9:00 AM - 12:00 PM"
            }
          ]
        },
        afternoon: {
          activities: [
            {
              title: i === 0 ? "Local Market Visit" : 
                     i === 1 ? "Park and Gardens" : 
                     i === 2 ? "Shopping District" : 
                     "Afternoon Leisure",
              description: "Experience local life and cuisine at the central market.",
              location: i === 0 ? "Central Market" : 
                        i === 1 ? "City Park" : 
                        i === 2 ? "Shopping Area" : 
                        "Leisure District",
              time: "2:00 PM - 5:00 PM"
            }
          ]
        },
        evening: {
          activities: [
            {
              title: i === 0 ? "Welcome Dinner" : 
                     i === 1 ? "Cultural Performance" : 
                     i === 2 ? "Local Cuisine Experience" : 
                     "Evening Entertainment",
              description: "Enjoy authentic local cuisine in a traditional setting.",
              location: i === 0 ? "Restaurant District" : 
                        i === 1 ? "Cultural Center" : 
                        i === 2 ? "Famous Restaurant" : 
                        "Entertainment District",
              time: "7:00 PM - 10:00 PM"
            }
          ]
        }
      })),
      tips: [
        "Research local customs before your trip",
        "Learn a few basic phrases in the local language",
        "Check if your destination requires special travel insurance",
        "Keep a copy of important documents separate from originals",
        "Try to explore beyond just the tourist areas",
        "Use public transportation when possible to experience local life"
      ],
      mustSeeLocations: [
        "Historical City Center",
        "National Museum",
        "Local Market",
        "Famous Religious Site",
        "Natural Landmark"
      ],
      foodRecommendations: [
        "National signature dish",
        "Local street food specialty",
        "Regional dessert",
        "Traditional beverage",
        "Famous restaurant dish"
      ]
    };
  }
  
  return demoData;
}
