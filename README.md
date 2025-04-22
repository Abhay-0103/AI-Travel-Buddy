# AI Travel Planner
AI Travel Planner is a modern web application that generates personalized travel itineraries using artificial intelligence. By leveraging Google's Gemini 1.5 Flash API, the application creates detailed day-by-day travel plans tailored to the user's preferences, complete with flight options powered by SerpAPI.

This full-stack JavaScript application features a responsive UI built with React, TypeScript, and Tailwind CSS with the shadcn/ui component library. The backend is powered by Express and provides API endpoints for AI-generated itineraries and flight search capabilities.

Key Features
🌍 AI-Generated Itineraries: Create personalized travel plans with specific recommendations for morning, afternoon, and evening activities
✈️ Flight Options: Search and compare flights between your source and destination using real flight data
💰 Budget-Aware Planning: Generate travel plans that respect your specified budget
📅 Date-Based Planning: Set specific travel dates to get a day-by-day itinerary
👥 Group Travel Support: Specify the number of travelers for appropriate recommendations
🏷️ Interest-Based Suggestions: Select interests to receive tailored activity recommendations
💾 Save & Book Functionality: Save your itineraries and proceed to booking
Technologies Used
Frontend: React, TypeScript, Tailwind CSS, shadcn/ui, React Query
Backend: Node.js, Express
APIs:
Google Gemini 1.5 Flash for AI-generated itineraries
SerpAPI for flight search capabilities
Google Places API for location autocomplete
State Management: React Query, React Context
Styling: Tailwind CSS with custom components
Form Handling: React Hook Form with Zod validation
Getting Started
Prerequisites
Node.js (v16 or later)
NPM or Yarn
API keys for:
Google Gemini API
SerpAPI
Google Places API (optional for location autocomplete)
Installation
Clone the repository

git clone https://github.com/yourusername/ai-travel-planner.git
cd ai-travel-planner
Install dependencies

npm install
# If using Windows, also install cross-env
npm install --save-dev cross-env
Create an environment file

cp .env.example .env
# Edit .env to add your API keys
Start the development server

# For non-Windows:
npm run dev
# For Windows:
# Either install cross-env and use npm run dev
# Or use: set NODE_ENV=development&& tsx server/index.ts
Open your browser and navigate to http://localhost:5000

Project Structure
client/: Frontend React application
src/components/: UI components including form and itinerary display
src/hooks/: Custom React hooks
src/pages/: Application pages
server/: Backend Express server
gemini.ts: Integration with Google's Gemini AI
flights.ts: Flight search functionality using SerpAPI
routes.ts: API endpoints
shared/: Shared types and schemas used by both frontend and backend


Future Enhancements
Weather integration for travel dates
Hotel and accommodation recommendations
Public transportation options between activities
User accounts to save and retrieve past itineraries
Social sharing functionality
Mobile application
Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

License
This project is licensed under the MIT License - see the LICENSE file for details.

Acknowledgements
Google Gemini AI for powering the itinerary generation
SerpAPI for flight search capabilities
shadcn/ui for the beautiful UI components
Tailwind CSS for styling
