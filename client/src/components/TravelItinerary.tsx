import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TravelPlan } from "@shared/schema";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { 
  AlertCircle,
  CalendarCheck, 
  Edit2, 
  Save, 
  Download, 
  Share2, 
  CheckCircle, 
  MapPin, 
  Clock,
  Landmark,
  Coffee,
  Sunset,
  Info,
  Flag,
  Utensils,
  DollarSign,
  Tag
} from "lucide-react";
import { format, parseISO, differenceInDays } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface TravelItineraryProps {
  plan: TravelPlan;
  onModifyPlan: () => void;
}

export default function TravelItinerary({ plan, onModifyPlan }: TravelItineraryProps) {
  const { toast } = useToast();
  const formattedStartDate = format(parseISO(plan.startDate.toString()), 'MMM d, yyyy');
  const formattedEndDate = format(parseISO(plan.endDate.toString()), 'MMM d, yyyy');
  const numDays = differenceInDays(parseISO(plan.endDate.toString()), parseISO(plan.startDate.toString())) + 1;
  
  const [activeDay, setActiveDay] = useState(1);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isBooking, setIsBooking] = useState(false);

  if (!plan.itinerary) {
    return <div>No itinerary available</div>;
  }

  // Parse the itinerary
  const itinerary = plan.itinerary as any;
  const days = itinerary.days || [];
  const tips = itinerary.tips || [];
  const mustSeeLocations = itinerary.mustSeeLocations || [];
  const foodRecommendations = itinerary.foodRecommendations || [];
  
  // Function to handle saving the itinerary
  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Itinerary Saved",
        description: "Your travel plan has been saved successfully.",
        variant: "default",
      });
    }, 1000);
  };
  
  // Function to handle booking the trip
  const handleBookNow = () => {
    setShowBookingDialog(true);
  };
  
  // Function to confirm booking
  const confirmBooking = () => {
    setIsBooking(true);
    // Simulate API call
    setTimeout(() => {
      setIsBooking(false);
      setShowBookingDialog(false);
      toast({
        title: "Booking Confirmed",
        description: "Your booking request has been sent. Check your email for details.",
        variant: "default",
      });
    }, 1500);
  };

  return (
    <div>
      {/* Header with summary */}
      <Card className="mb-6 overflow-hidden">
        <div className="md:flex">
          <div className="md:flex-shrink-0">
            <div 
              className="h-48 w-full object-cover md:w-48 bg-cover bg-center"
              style={{ 
                backgroundImage: `url(https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80)` 
              }}
            />
          </div>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                <CheckCircle className="h-3 w-3 mr-1" />
                Plan Ready
              </Badge>
              <div className="ml-auto flex space-x-2">
                <Button variant="ghost" size="icon">
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <h2 className="text-2xl font-display font-bold text-gray-900 mt-4">
              {numDays}-Day Adventure in {plan.destination}
            </h2>
            <p className="mt-2 text-gray-600">
              From {plan.source} • {formattedStartDate}-{formattedEndDate} • {plan.travelers} Travelers
            </p>
            <div className="mt-4 flex items-center flex-wrap gap-3">
              <div className="flex items-center text-primary">
                <DollarSign className="h-4 w-4" />
                <span className="ml-1 font-medium">
                  Estimated Budget: {plan.currency} {plan.budget}
                </span>
              </div>
              <span className="text-gray-300">|</span>
              <div className="flex items-center text-gray-700">
                <Tag className="h-4 w-4" />
                <span className="ml-1">
                  {plan.interests.join(', ')}
                </span>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>

      {/* Daily Itinerary */}
      <div className="space-y-6">
        {days.map((day: any, index: number) => (
          <Card key={index} className={`overflow-hidden ${activeDay === index + 1 ? 'ring-2 ring-primary' : ''}`}>
            <CardHeader className="bg-primary text-white p-4">
              <h3 className="text-lg font-medium">
                Day {index + 1} - {format(parseISO(plan.startDate.toString()), 'MMM d')}: {day.title}
              </h3>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {/* Morning */}
                {day.morning && day.morning.activities && day.morning.activities.length > 0 && (
                  <div>
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                        <Coffee className="text-primary h-5 w-5" />
                      </div>
                      <h4 className="ml-3 text-lg font-medium text-gray-900">Morning</h4>
                    </div>
                    <div className="ml-13 pl-5 border-l-2 border-gray-200">
                      {day.morning.activities.map((activity: any, activityIndex: number) => (
                        <div key={activityIndex} className="mb-4">
                          <div className="flex items-start">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-white text-xs font-medium text-primary">
                              {activityIndex + 1}
                            </span>
                            <div className="ml-3">
                              <h5 className="text-base font-medium text-gray-900">{activity.title}</h5>
                              <p className="mt-1 text-sm text-gray-600">{activity.description}</p>
                              
                              {activity.location && (
                                <div className="mt-2 flex items-center text-sm text-gray-500">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  <span>{activity.location}</span>
                                </div>
                              )}
                              
                              {activity.time && (
                                <div className="mt-1 flex items-center text-sm text-gray-500">
                                  <Clock className="h-3 w-3 mr-1" />
                                  <span>{activity.time}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Afternoon */}
                {day.afternoon && day.afternoon.activities && day.afternoon.activities.length > 0 && (
                  <div>
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                        <Landmark className="text-amber-600 h-5 w-5" />
                      </div>
                      <h4 className="ml-3 text-lg font-medium text-gray-900">Afternoon</h4>
                    </div>
                    <div className="ml-13 pl-5 border-l-2 border-gray-200">
                      {day.afternoon.activities.map((activity: any, activityIndex: number) => (
                        <div key={activityIndex} className="mb-4">
                          <div className="flex items-start">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-amber-500 bg-white text-xs font-medium text-amber-600">
                              {activityIndex + 1}
                            </span>
                            <div className="ml-3">
                              <h5 className="text-base font-medium text-gray-900">{activity.title}</h5>
                              <p className="mt-1 text-sm text-gray-600">{activity.description}</p>
                              
                              {activity.location && (
                                <div className="mt-2 flex items-center text-sm text-gray-500">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  <span>{activity.location}</span>
                                </div>
                              )}
                              
                              {activity.time && (
                                <div className="mt-1 flex items-center text-sm text-gray-500">
                                  <Clock className="h-3 w-3 mr-1" />
                                  <span>{activity.time}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Evening */}
                {day.evening && day.evening.activities && day.evening.activities.length > 0 && (
                  <div>
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                        <Sunset className="text-indigo-600 h-5 w-5" />
                      </div>
                      <h4 className="ml-3 text-lg font-medium text-gray-900">Evening</h4>
                    </div>
                    <div className="ml-13 pl-5 border-l-2 border-gray-200">
                      {day.evening.activities.map((activity: any, activityIndex: number) => (
                        <div key={activityIndex} className="mb-4">
                          <div className="flex items-start">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-indigo-500 bg-white text-xs font-medium text-indigo-600">
                              {activityIndex + 1}
                            </span>
                            <div className="ml-3">
                              <h5 className="text-base font-medium text-gray-900">{activity.title}</h5>
                              <p className="mt-1 text-sm text-gray-600">{activity.description}</p>
                              
                              {activity.location && (
                                <div className="mt-2 flex items-center text-sm text-gray-500">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  <span>{activity.location}</span>
                                </div>
                              )}
                              
                              {activity.time && (
                                <div className="mt-1 flex items-center text-sm text-gray-500">
                                  <Clock className="h-3 w-3 mr-1" />
                                  <span>{activity.time}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional Information */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Info className="h-5 w-5 text-primary" />
              <h3 className="ml-2 text-lg font-medium text-gray-900">Travel Tips</h3>
            </div>
            <ul className="mt-4 space-y-3">
              {tips.map((tip: string, index: number) => (
                <li key={index} className="flex">
                  <CheckCircle className="text-green-500 h-4 w-4 mt-1 flex-shrink-0" />
                  <span className="ml-2 text-sm text-gray-600">{tip}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Flag className="h-5 w-5 text-primary" />
              <h3 className="ml-2 text-lg font-medium text-gray-900">Must-See Locations</h3>
            </div>
            <ul className="mt-4 space-y-3">
              {mustSeeLocations.map((location: string, index: number) => (
                <li key={index} className="flex">
                  <MapPin className="text-amber-500 h-4 w-4 mt-1 flex-shrink-0" />
                  <span className="ml-2 text-sm text-gray-600">{location}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Utensils className="h-5 w-5 text-primary" />
              <h3 className="ml-2 text-lg font-medium text-gray-900">Food Recommendations</h3>
            </div>
            <ul className="mt-4 space-y-3">
              {foodRecommendations.map((food: string, index: number) => (
                <li key={index} className="flex">
                  <Utensils className="text-amber-500 h-4 w-4 mt-1 flex-shrink-0" />
                  <span className="ml-2 text-sm text-gray-600">{food}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="mt-8 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
        <Button 
          variant="outline" 
          onClick={onModifyPlan}
          className="w-full sm:w-auto"
        >
          <Edit2 className="h-4 w-4 mr-2" />
          Modify Plan
        </Button>
        <div className="w-full sm:w-auto flex space-x-4">
          <Button 
            variant="secondary"
            className="flex-1 sm:flex-none"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <div className="h-4 w-4 mr-2 animate-spin border-2 border-current border-t-transparent rounded-full" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save
              </>
            )}
          </Button>
          <Button 
            variant="default"
            className="flex-1 sm:flex-none bg-primary hover:bg-primary-700"
            onClick={handleBookNow}
          >
            <CalendarCheck className="h-4 w-4 mr-2" />
            Book Now
          </Button>
        </div>
      </div>
      
      {/* Booking Dialog */}
      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Book Your Trip to {plan.destination}</DialogTitle>
            <DialogDescription>
              You're about to book a {numDays}-day adventure from {formattedStartDate} to {formattedEndDate} for {plan.travelers} travelers.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <h4 className="font-medium">Trip Summary</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>From: {plan.source}</p>
                <p>To: {plan.destination}</p>
                <p>Dates: {formattedStartDate} - {formattedEndDate}</p>
                <p>Travelers: {plan.travelers}</p>
                <p>Budget: {plan.currency} {plan.budget}</p>
              </div>
            </div>
            <div className="rounded-md bg-amber-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-amber-500" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-amber-800">Booking Information</h3>
                  <div className="mt-2 text-sm text-amber-700">
                    <p>
                      By proceeding, our travel specialists will start arranging your trip based on the itinerary. You will receive detailed booking information and payment options by email.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowBookingDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={confirmBooking}
              disabled={isBooking}
              className="bg-primary hover:bg-primary-700"
            >
              {isBooking ? (
                <>
                  <div className="h-4 w-4 mr-2 animate-spin border-2 border-current border-t-transparent rounded-full" />
                  Processing...
                </>
              ) : (
                "Confirm Booking"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
