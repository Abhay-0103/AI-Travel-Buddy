import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateGeminiResponse } from "./gemini";

export async function registerRoutes(app: Express): Promise<Server> {
  // Put application routes here
  // Prefix all routes with /api
  
  // Google Places API for location autocomplete
  app.get('/api/places', async (req, res) => {
    try {
      const query = req.query.query as string;
      
      if (!query) {
        return res.status(400).json({ error: 'Query parameter is required' });
      }
      
      const PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY || "";
      
      if (!PLACES_API_KEY) {
        console.warn('GOOGLE_PLACES_API_KEY is not set');
        // Return mock data for development
        return res.json({
          predictions: [
            { place_id: '1', description: 'New York, USA' },
            { place_id: '2', description: 'New Delhi, India' },
            { place_id: '3', description: 'London, UK' },
            { place_id: '4', description: 'Tokyo, Japan' },
            { place_id: '5', description: 'Paris, France' }
          ]
        });
      }
      
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&types=(cities)&key=${PLACES_API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch places from Google API');
      }
      
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('Error fetching places:', error);
      res.status(500).json({ error: 'Failed to fetch places' });
    }
  });

  // Generate travel plan with Gemini AI
  app.post('/api/travel-plan', async (req, res) => {
    try {
      const planRequest = req.body;
      
      if (!planRequest.source || !planRequest.destination || !planRequest.startDate || !planRequest.endDate) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      // Generate AI travel plan
      const itinerary = await generateGeminiResponse(planRequest);
      
      // Create travel plan with the AI-generated itinerary
      const travelPlan = {
        ...planRequest,
        itinerary,
        createdAt: new Date()
      };
      
      res.json(travelPlan);
    } catch (error) {
      console.error('Error generating travel plan:', error);
      res.status(500).json({ error: 'Failed to generate travel plan' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
