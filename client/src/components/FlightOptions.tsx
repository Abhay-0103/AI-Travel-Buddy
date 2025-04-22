import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plane, Clock, ArrowRight, Calendar, DollarSign, AlertCircle, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';

// Type definitions
interface FlightDetails {
  airline: string;
  airlineLogo: string;
  flightNumber: string;
  departureAirport: {
    name: string;
    id: string;
    time: string;
  };
  arrivalAirport: {
    name: string;
    id: string;
    time: string;
  };
  duration: number;
  travelClass: string;
}

interface Layover {
  duration: number;
  airport: string;
  airportCode: string;
  overnight: boolean;
}

interface Flight {
  price: number;
  totalDuration: number;
  flights: FlightDetails[];
  layovers: Layover[];
}

interface FlightOptionsProps {
  source: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  numTravelers: number;
  currencyCode?: string;
}

export default function FlightOptions({
  source,
  destination,
  departureDate,
  returnDate,
  numTravelers,
  currencyCode = "USD"
}: FlightOptionsProps) {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFlight, setSelectedFlight] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Function to fetch flight data
    const fetchFlights = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Build query parameters
        const params = new URLSearchParams({
          source,
          destination,
          departureDate
        });
        
        if (returnDate) {
          params.append('returnDate', returnDate);
        }
        
        // Call API to get flight options
        const response = await fetch(`/api/flights?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch flight options');
        }
        
        const data = await response.json();
        
        if (data.flights && Array.isArray(data.flights)) {
          setFlights(data.flights);
        } else {
          setFlights([]);
        }
      } catch (err) {
        console.error('Error fetching flights:', err);
        setError('Could not load flight options. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    // Call the function to fetch flights
    fetchFlights();
  }, [source, destination, departureDate, returnDate]);
  
  // Function to format duration from minutes to hours and minutes
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };
  
  // Function to format price with currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode
    }).format(price * (numTravelers || 1));
  };
  
  // Function to handle flight selection
  const handleSelectFlight = (index: number) => {
    setSelectedFlight(index);
    toast({
      title: "Flight Selected",
      description: "Your flight has been selected. You can proceed to booking.",
      variant: "default",
    });
  };

  // Loading state
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Plane className="mr-2 h-5 w-5" />
            <span>Finding the best flights...</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col space-y-3">
                <div className="flex justify-between">
                  <Skeleton className="h-6 w-[150px]" />
                  <Skeleton className="h-6 w-[100px]" />
                </div>
                <div className="flex justify-between items-center">
                  <Skeleton className="h-12 w-[120px]" />
                  <Skeleton className="h-4 w-[80px]" />
                  <Skeleton className="h-12 w-[120px]" />
                </div>
                <Skeleton className="h-8 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-orange-600 flex items-center">
            <AlertCircle className="mr-2 h-5 w-5" />
            <span>Flight Information Unavailable</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">
            We're unable to retrieve flight options at the moment. You can continue planning your trip
            and check flight availability later.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (flights.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Plane className="mr-2 h-5 w-5" />
            <span>No Flights Found</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            We couldn't find any flights for the selected route and dates. Try different dates or destinations.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Render flights
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Plane className="mr-2 h-5 w-5" />
          <span>Flight Options</span>
        </CardTitle>
        <div className="text-sm text-gray-500 flex items-center mt-1">
          <Calendar className="h-4 w-4 mr-1" />
          <span>
            {format(new Date(departureDate), 'MMM d, yyyy')}
            {returnDate && ` - ${format(new Date(returnDate), 'MMM d, yyyy')}`}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {flights.map((flight, index) => (
            <div 
              key={index} 
              className={`border rounded-lg p-4 ${selectedFlight === index ? 'border-primary bg-primary-50' : 'border-gray-200'}`}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  {flight.flights[0]?.airlineLogo && (
                    <img 
                      src={flight.flights[0].airlineLogo} 
                      alt={flight.flights[0].airline} 
                      className="h-8 w-8 mr-3"
                    />
                  )}
                  <div>
                    <div className="font-medium">{flight.flights[0]?.airline || 'Multiple Airlines'}</div>
                    <div className="text-sm text-gray-500">
                      {flight.flights.map(f => f.flightNumber).join(' · ')}
                    </div>
                  </div>
                </div>
                <div className="text-lg font-semibold text-primary">
                  {formatPrice(flight.price)}
                </div>
              </div>
              
              <div className="my-4 flex justify-between items-center">
                <div className="text-center">
                  <div className="text-lg font-semibold">
                    {flight.flights[0]?.departureAirport.time}
                  </div>
                  <div className="text-sm text-gray-500">
                    {flight.flights[0]?.departureAirport.id}
                  </div>
                </div>
                
                <div className="flex-1 mx-4">
                  <div className="text-xs text-center text-gray-500 mb-1">
                    {formatDuration(flight.totalDuration)}
                  </div>
                  <div className="relative">
                    <div className="absolute left-0 right-0 top-1/2 border-t border-gray-300"></div>
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
                      <ArrowRight className="h-3 w-3 text-gray-400" />
                    </div>
                    {flight.layovers.length > 0 && (
                      <div className="flex justify-center">
                        <Badge variant="outline" className="z-10 bg-white">
                          {flight.layovers.length === 1 ? '1 stop' : `${flight.layovers.length} stops`}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-lg font-semibold">
                    {flight.flights[flight.flights.length - 1]?.arrivalAirport.time}
                  </div>
                  <div className="text-sm text-gray-500">
                    {flight.flights[flight.flights.length - 1]?.arrivalAirport.id}
                  </div>
                </div>
              </div>
              
              {flight.layovers.length > 0 && (
                <Accordion type="single" collapsible className="mb-3">
                  <AccordionItem value="details">
                    <AccordionTrigger className="text-sm text-gray-600 py-1">
                      Flight Details
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 pt-2">
                        {flight.flights.map((segment, i) => (
                          <div key={i} className="border-b border-gray-100 pb-3 last:border-0">
                            <div className="flex justify-between text-sm mb-1">
                              <div className="font-medium">{segment.airline} · {segment.flightNumber}</div>
                              <div className="text-gray-500">{segment.travelClass}</div>
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-sm font-medium">{segment.departureAirport.time}</div>
                                <div className="text-xs text-gray-500">{segment.departureAirport.id}</div>
                              </div>
                              <div className="flex-1 mx-3">
                                <div className="text-xs text-center text-gray-500">
                                  {formatDuration(segment.duration)}
                                </div>
                                <div className="relative h-0.5 bg-gray-200 my-1">
                                  <div className="absolute right-0 transform -translate-y-1/2">
                                    <ArrowRight className="h-2 w-2 text-gray-400" />
                                  </div>
                                </div>
                              </div>
                              <div>
                                <div className="text-sm font-medium">{segment.arrivalAirport.time}</div>
                                <div className="text-xs text-gray-500">{segment.arrivalAirport.id}</div>
                              </div>
                            </div>
                            
                            {i < flight.flights.length - 1 && flight.layovers[i] && (
                              <div className="mt-2 py-1 px-2 bg-gray-50 rounded text-xs text-gray-600 flex items-center">
                                <Clock className="h-3 w-3 mr-1 text-gray-400" />
                                <span>
                                  {formatDuration(flight.layovers[i].duration)} layover in {flight.layovers[i].airport} ({flight.layovers[i].airportCode})
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}
              
              <div className="flex justify-between items-center">
                <div className="text-sm">
                  <span className="text-gray-500">Price for {numTravelers} traveler{numTravelers !== 1 ? 's' : ''}</span>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => handleSelectFlight(index)}
                  variant={selectedFlight === index ? "default" : "outline"}
                >
                  {selectedFlight === index ? (
                    <>
                      <Check className="mr-1 h-4 w-4" />
                      Selected
                    </>
                  ) : "Select Flight"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}