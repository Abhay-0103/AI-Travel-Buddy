import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TravelPlanForm, travelPlanFormSchema } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useMutation } from '@tanstack/react-query';
import { usePlaceAutocomplete } from '@/hooks/usePlaceAutocomplete';
import { useCurrencySymbol } from '@/hooks/useCurrencySymbol';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CalendarIcon, MapPin, User, ArrowRight, ArrowLeft, WandSparkles, Map, Check, ChevronsUpDown } from 'lucide-react';
import { Loader2 } from "lucide-react";

interface TravelPlannerFormProps {
  onGeneratePlan: (plan: any) => void;
  isGenerating: boolean;
  onGeneratingStateChange: (state: boolean) => void;
}

type FormStep = 1 | 2 | 3 | 4;

const interests = [
  { value: 'food', label: 'Food & Culinary', icon: '🍽️' },
  { value: 'culture', label: 'Culture & History', icon: '🏛️' },
  { value: 'adventure', label: 'Adventure & Outdoors', icon: '🏞️' },
  { value: 'relaxation', label: 'Relaxation & Wellness', icon: '🧘' },
  { value: 'nightlife', label: 'Nightlife', icon: '🎭' },
  { value: 'shopping', label: 'Shopping', icon: '🛍️' },
  { value: 'family', label: 'Family-friendly', icon: '👨‍👩‍👧‍👦' },
  { value: 'art', label: 'Art & Museums', icon: '🎨' },
  { value: 'wildlife', label: 'Wildlife & Nature', icon: '🦁' },
  { value: 'photography', label: 'Photography', icon: '📸' },
  { value: 'architecture', label: 'Architecture', icon: '🏙️' },
  { value: 'beaches', label: 'Beaches', icon: '🏖️' },
];

const currencies = [
  { value: 'USD', label: 'US Dollar ($)', symbol: '$' },
  { value: 'EUR', label: 'Euro (€)', symbol: '€' },
  { value: 'GBP', label: 'British Pound (£)', symbol: '£' },
  { value: 'JPY', label: 'Japanese Yen (¥)', symbol: '¥' },
  { value: 'AUD', label: 'Australian Dollar (A$)', symbol: 'A$' },
  { value: 'CAD', label: 'Canadian Dollar (C$)', symbol: 'C$' },
  { value: 'INR', label: 'Indian Rupee (₹)', symbol: '₹' },
  { value: 'CNY', label: 'Chinese Yuan (¥)', symbol: '¥' },
];

export default function TravelPlannerForm({ onGeneratePlan, isGenerating, onGeneratingStateChange }: TravelPlannerFormProps) {
  const [currentStep, setCurrentStep] = useState<FormStep>(1);
  const { toast } = useToast();
  const { sourceResults, destinationResults, searchSource, searchDestination, isLoadingSource, isLoadingDestination } = usePlaceAutocomplete();
  const { symbol: currencySymbol } = useCurrencySymbol('USD');

  const form = useForm<TravelPlanForm>({
    resolver: zodResolver(travelPlanFormSchema),
    defaultValues: {
      source: '',
      destination: '',
      startDate: '',
      endDate: '',
      budget: '',
      currency: 'USD',
      travelers: '2',
      interests: [],
      additionalNotes: '',
    },
  });

  const generatePlanMutation = useMutation({
    mutationFn: async (data: TravelPlanForm) => {
      const response = await apiRequest('POST', '/api/travel-plan', data);
      return response.json();
    },
    onMutate: () => {
      onGeneratingStateChange(true);
    },
    onSuccess: (data) => {
      onGeneratePlan(data);
    },
    onError: (error) => {
      toast({
        title: 'Error generating travel plan',
        description: error instanceof Error ? error.message : 'Please try again later',
        variant: 'destructive',
      });
      onGeneratingStateChange(false);
    }
  });

  const handleSubmit = (data: TravelPlanForm) => {
    generatePlanMutation.mutate(data);
  };

  const goToNextStep = () => {
    // Validate the current step fields
    if (currentStep === 1) {
      form.trigger(['source', 'destination', 'travelers']);
      if (form.formState.errors.source || form.formState.errors.destination || form.formState.errors.travelers) {
        return;
      }
    } else if (currentStep === 2) {
      form.trigger(['startDate', 'endDate']);
      if (form.formState.errors.startDate || form.formState.errors.endDate) {
        return;
      }
    } else if (currentStep === 3) {
      form.trigger(['budget', 'currency']);
      if (form.formState.errors.budget || form.formState.errors.currency) {
        return;
      }
    }
    
    if (currentStep < 4) {
      setCurrentStep((prev) => (prev + 1) as FormStep);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as FormStep);
    }
  };

  // Update currency symbol when currency changes
  const watchCurrency = form.watch('currency');
  const { symbol } = useCurrencySymbol(watchCurrency);

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden mb-10">
      <div className="p-6 md:p-8">
        <h2 className="text-2xl font-display font-semibold text-gray-900 mb-6">Plan Your Journey</h2>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
            {/* Step Indicator */}
            <div className="relative">
              <div className="flex items-center justify-between mb-8">
                <StepIndicator 
                  stepNumber={1} 
                  label="Locations" 
                  isActive={currentStep === 1} 
                  isCompleted={currentStep > 1} 
                />
                <StepIndicator 
                  stepNumber={2} 
                  label="Dates" 
                  isActive={currentStep === 2} 
                  isCompleted={currentStep > 2} 
                />
                <StepIndicator 
                  stepNumber={3} 
                  label="Budget" 
                  isActive={currentStep === 3} 
                  isCompleted={currentStep > 3} 
                />
                <StepIndicator 
                  stepNumber={4} 
                  label="Interests" 
                  isActive={currentStep === 4} 
                  isCompleted={false} 
                />
                
                <div className="absolute top-5 left-10 right-10 h-1 bg-gray-200 -z-10">
                  <div 
                    className="h-full bg-primary transition-all duration-300" 
                    style={{ width: `${(currentStep / 4) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Step 1: Location Details */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Source Location */}
                  <FormField
                    control={form.control}
                    name="source"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Where are you starting from?</FormLabel>
                        <div className="relative">
                          <div className="relative">
                            <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                            <FormControl>
                              <Input
                                placeholder="Enter city or airport"
                                className="pl-10 pr-10"
                                value={field.value}
                                onChange={(e) => {
                                  field.onChange(e.target.value);
                                  searchSource(e.target.value);
                                }}
                                autoComplete="off"
                              />
                            </FormControl>
                            {(sourceResults.length > 0 && field.value) && (
                              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                                {isLoadingSource ? (
                                  <div className="flex justify-center items-center h-20">
                                    <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                                  </div>
                                ) : (
                                  <ul className="py-1">
                                    {sourceResults.map((location) => (
                                      <li 
                                        key={location.place_id}
                                        className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${field.value === location.description ? 'bg-gray-50' : ''}`}
                                        onClick={() => {
                                          field.onChange(location.description);
                                          // Clear results after selection
                                          searchSource("");
                                        }}
                                      >
                                        {location.description}
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            )}
                          </div>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  {/* Destination */}
                  <FormField
                    control={form.control}
                    name="destination"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Where would you like to go?</FormLabel>
                        <div className="relative">
                          <div className="relative">
                            <Map className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                            <FormControl>
                              <Input
                                placeholder="Dream destination"
                                className="pl-10 pr-10"
                                value={field.value}
                                onChange={(e) => {
                                  field.onChange(e.target.value);
                                  searchDestination(e.target.value);
                                }}
                                autoComplete="off"
                              />
                            </FormControl>
                            {(destinationResults.length > 0 && field.value) && (
                              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                                {isLoadingDestination ? (
                                  <div className="flex justify-center items-center h-20">
                                    <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                                  </div>
                                ) : (
                                  <ul className="py-1">
                                    {destinationResults.map((location) => (
                                      <li 
                                        key={location.place_id}
                                        className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${field.value === location.description ? 'bg-gray-50' : ''}`}
                                        onClick={() => {
                                          field.onChange(location.description);
                                          // Clear results after selection
                                          searchDestination("");
                                        }}
                                      >
                                        {location.description}
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            )}
                          </div>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Travelers */}
                <FormField
                  control={form.control}
                  name="travelers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Travelers</FormLabel>
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        <Select 
                          value={field.value} 
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger className="pl-10">
                              <SelectValue placeholder="Select number of travelers" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1">1 traveler</SelectItem>
                            <SelectItem value="2">2 travelers</SelectItem>
                            <SelectItem value="3">3 travelers</SelectItem>
                            <SelectItem value="4">4 travelers</SelectItem>
                            <SelectItem value="5">5 travelers</SelectItem>
                            <SelectItem value="6">6 travelers</SelectItem>
                            <SelectItem value="7">7+ travelers</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end">
                  <Button 
                    type="button" 
                    onClick={goToNextStep}
                    className="bg-primary hover:bg-primary-700"
                  >
                    Next: Pick Dates
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Date Selection */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">When do you plan to travel?</h3>
                  
                  <div className="flex flex-wrap items-center gap-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="rounded-full"
                      onClick={() => {
                        const today = new Date();
                        const nextWeekend = new Date(today);
                        nextWeekend.setDate(today.getDate() + (5 + 7 - today.getDay()) % 7);
                        const endDate = new Date(nextWeekend);
                        endDate.setDate(nextWeekend.getDate() + 2);
                        
                        form.setValue('startDate', format(nextWeekend, 'yyyy-MM-dd'));
                        form.setValue('endDate', format(endDate, 'yyyy-MM-dd'));
                      }}
                    >
                      Next Weekend
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="rounded-full"
                      onClick={() => {
                        const today = new Date();
                        const nextMonth = new Date(today);
                        nextMonth.setMonth(today.getMonth() + 1);
                        nextMonth.setDate(1);
                        const endDate = new Date(nextMonth);
                        endDate.setDate(nextMonth.getDate() + 6);
                        
                        form.setValue('startDate', format(nextMonth, 'yyyy-MM-dd'));
                        form.setValue('endDate', format(endDate, 'yyyy-MM-dd'));
                      }}
                    >
                      Next Month
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="rounded-full"
                      onClick={() => {
                        const today = new Date();
                        const currentYear = today.getFullYear();
                        const summer = new Date(currentYear, 5, 21); // June 21
                        if (today > summer) {
                          summer.setFullYear(currentYear + 1);
                        }
                        const endDate = new Date(summer);
                        endDate.setDate(summer.getDate() + 7);
                        
                        form.setValue('startDate', format(summer, 'yyyy-MM-dd'));
                        form.setValue('endDate', format(endDate, 'yyyy-MM-dd'));
                      }}
                    >
                      Summer Vacation
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="rounded-full"
                      onClick={() => {
                        const today = new Date();
                        const currentYear = today.getFullYear();
                        const winterHoliday = new Date(currentYear, 11, 24); // December 24
                        if (today > winterHoliday) {
                          winterHoliday.setFullYear(currentYear + 1);
                        }
                        const endDate = new Date(winterHoliday);
                        endDate.setDate(winterHoliday.getDate() + 7);
                        
                        form.setValue('startDate', format(winterHoliday, 'yyyy-MM-dd'));
                        form.setValue('endDate', format(endDate, 'yyyy-MM-dd'));
                      }}
                    >
                      Winter Holidays
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Start Date */}
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Departure Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(new Date(field.value), "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value ? new Date(field.value) : undefined}
                              onSelect={(date) => {
                                if (date) {
                                  field.onChange(format(date, 'yyyy-MM-dd'));
                                  
                                  // Auto-set end date to a week later if not set
                                  const currentEndDate = form.getValues('endDate');
                                  if (!currentEndDate) {
                                    const endDate = new Date(date);
                                    endDate.setDate(date.getDate() + 7);
                                    form.setValue('endDate', format(endDate, 'yyyy-MM-dd'));
                                  }
                                }
                              }}
                              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* End Date */}
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Return Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(new Date(field.value), "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value ? new Date(field.value) : undefined}
                              onSelect={(date) => {
                                if (date) {
                                  field.onChange(format(date, 'yyyy-MM-dd'));
                                }
                              }}
                              disabled={(date) => {
                                const startDate = form.getValues('startDate');
                                if (startDate) {
                                  return date < new Date(startDate);
                                }
                                return date < new Date(new Date().setHours(0, 0, 0, 0));
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-between">
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={goToPreviousStep}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button 
                    type="button"
                    className="bg-primary hover:bg-primary-700"
                    onClick={goToNextStep}
                  >
                    Next: Set Budget
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Budget */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">What's your budget?</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Budget Amount */}
                    <FormField
                      control={form.control}
                      name="budget"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Total Budget Amount</FormLabel>
                          <div className="relative rounded-lg shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-gray-500 sm:text-sm">{symbol}</span>
                            </div>
                            <FormControl>
                              <Input
                                placeholder="0.00"
                                className="pl-8 pr-20"
                                {...field}
                                type="number"
                                min="0"
                              />
                            </FormControl>
                            <div className="absolute inset-y-0 right-0 flex items-center">
                              <FormField
                                control={form.control}
                                name="currency"
                                render={({ field }) => (
                                  <FormItem className="h-full">
                                    <Select 
                                      value={field.value} 
                                      onValueChange={field.onChange}
                                    >
                                      <FormControl>
                                        <SelectTrigger className="h-full py-0 pl-2 pr-1 border-0 bg-transparent text-gray-500 rounded-none focus:ring-0 focus:ring-offset-0">
                                          <SelectValue placeholder="USD" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {currencies.map((currency) => (
                                          <SelectItem key={currency.value} value={currency.value}>
                                            {currency.label}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Budget Priority */}
                    <FormField
                      control={form.control}
                      name="budgetPriority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Budget Priority</FormLabel>
                          <div className="grid grid-cols-3 gap-3">
                            <div className="relative">
                              <input 
                                type="radio" 
                                id="economy" 
                                value="economy" 
                                className="sr-only peer" 
                                checked={field.value === "economy"} 
                                onChange={() => field.onChange("economy")}
                              />
                              <label 
                                htmlFor="economy"
                                className="flex flex-col items-center justify-center p-3 border rounded-lg cursor-pointer border-gray-300 peer-checked:border-primary peer-checked:bg-primary-50"
                              >
                                <span className="mt-2 text-sm font-medium text-gray-900">Economy</span>
                              </label>
                            </div>
                            <div className="relative">
                              <input 
                                type="radio" 
                                id="balanced" 
                                value="balanced" 
                                className="sr-only peer" 
                                checked={field.value === "balanced"} 
                                onChange={() => field.onChange("balanced")}
                              />
                              <label 
                                htmlFor="balanced"
                                className="flex flex-col items-center justify-center p-3 border rounded-lg cursor-pointer border-gray-300 peer-checked:border-primary peer-checked:bg-primary-50"
                              >
                                <span className="mt-2 text-sm font-medium text-gray-900">Balanced</span>
                              </label>
                            </div>
                            <div className="relative">
                              <input 
                                type="radio" 
                                id="luxury" 
                                value="luxury" 
                                className="sr-only peer" 
                                checked={field.value === "luxury"} 
                                onChange={() => field.onChange("luxury")}
                              />
                              <label 
                                htmlFor="luxury"
                                className="flex flex-col items-center justify-center p-3 border rounded-lg cursor-pointer border-gray-300 peer-checked:border-primary peer-checked:bg-primary-50"
                              >
                                <span className="mt-2 text-sm font-medium text-gray-900">Luxury</span>
                              </label>
                            </div>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={goToPreviousStep}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button 
                    type="button"
                    className="bg-primary hover:bg-primary-700"
                    onClick={goToNextStep}
                  >
                    Next: Your Interests
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: Interests */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">What are you interested in?</h3>
                  <p className="text-sm text-gray-600">Select all that apply. This helps our AI build a personalized itinerary.</p>
                  
                  <FormField
                    control={form.control}
                    name="interests"
                    render={() => (
                      <FormItem>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                          {interests.map((interest) => (
                            <FormField
                              key={interest.value}
                              control={form.control}
                              name="interests"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={interest.value}
                                    className="flex flex-row items-start space-x-2 space-y-0"
                                  >
                                    <div className="w-full">
                                      <div className="relative">
                                        <FormControl>
                                          <Checkbox
                                            checked={field.value?.includes(interest.value)}
                                            onCheckedChange={(checked) => {
                                              return checked
                                                ? field.onChange([...field.value, interest.value])
                                                : field.onChange(
                                                    field.value?.filter(
                                                      (value) => value !== interest.value
                                                    )
                                                  )
                                            }}
                                            id={`interest-${interest.value}`}
                                            className="sr-only peer"
                                          />
                                        </FormControl>
                                        <label
                                          htmlFor={`interest-${interest.value}`}
                                          className="flex flex-col items-center justify-center p-4 border rounded-lg cursor-pointer border-gray-300 peer-checked:border-primary peer-checked:bg-primary-50"
                                        >
                                          <span className="text-xl mb-2">{interest.icon}</span>
                                          <span className="mt-2 text-sm font-medium text-gray-900 text-center">{interest.label}</span>
                                        </label>
                                      </div>
                                    </div>
                                  </FormItem>
                                )
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="mt-6">
                    <FormField
                      control={form.control}
                      name="additionalNotes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Any special requests or considerations?</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="e.g., Accessibility needs, dietary restrictions, specific activities..."
                              className="resize-none"
                              rows={3}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={goToPreviousStep}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button 
                    type="submit"
                    className="bg-primary hover:bg-primary-700"
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Travel Plan...
                      </>
                    ) : (
                      <>
                        <WandSparkles className="mr-2 h-4 w-4" />
                        Generate Your Travel Plan
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </form>
        </Form>
      </div>
    </div>
  );
}

interface StepIndicatorProps {
  stepNumber: number;
  label: string;
  isActive: boolean;
  isCompleted: boolean;
}

function StepIndicator({ stepNumber, label, isActive, isCompleted }: StepIndicatorProps) {
  return (
    <div className="flex flex-col items-center">
      <div 
        className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors",
          isActive && "bg-primary text-white",
          isCompleted && "bg-primary text-white",
          !isActive && !isCompleted && "bg-primary-200 text-primary-800"
        )}
      >
        {isCompleted ? <Check className="h-5 w-5" /> : stepNumber}
      </div>
      <span className={cn(
        "text-sm mt-2", 
        isActive || isCompleted ? "text-gray-700" : "text-gray-500"
      )}>{label}</span>
    </div>
  );
}
