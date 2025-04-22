import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { TravelPlanForm } from "@shared/schema";
import { differenceInDays, format } from "date-fns";

// Initialize Gemini with the API key
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is required");
  }
  return new GoogleGenerativeAI(apiKey);
}

export async function generateGeminiResponse(travelPlanData: TravelPlanForm) {
  try {
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash", // Use the requested Gemini 1.5 Flash model
    });
    
    // Calculate the number of days for the trip
    const startDate = new Date(travelPlanData.startDate);
    const endDate = new Date(travelPlanData.endDate);
    const tripDuration = differenceInDays(endDate, startDate) + 1;
    
    // Format the interests in a readable way
    const interests = travelPlanData.interests.join(", ");
    
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
