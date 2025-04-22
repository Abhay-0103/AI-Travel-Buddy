import { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/use-debounce';

interface PlaceResult {
  description: string;
  place_id: string;
}

export function usePlaceAutocomplete() {
  const [sourceQuery, setSourceQuery] = useState('');
  const [destinationQuery, setDestinationQuery] = useState('');
  const [sourceResults, setSourceResults] = useState<PlaceResult[]>([]);
  const [destinationResults, setDestinationResults] = useState<PlaceResult[]>([]);
  const [isLoadingSource, setIsLoadingSource] = useState(false);
  const [isLoadingDestination, setIsLoadingDestination] = useState(false);
  
  const debouncedSourceQuery = useDebounce(sourceQuery, 300);
  const debouncedDestinationQuery = useDebounce(destinationQuery, 300);

  useEffect(() => {
    async function fetchSourceSuggestions() {
      if (!debouncedSourceQuery) {
        setSourceResults([]);
        return;
      }
      
      setIsLoadingSource(true);
      try {
        const response = await fetch(`/api/places?query=${encodeURIComponent(debouncedSourceQuery)}`);
        if (!response.ok) throw new Error('Failed to fetch suggestions');
        const data = await response.json();
        setSourceResults(data.predictions || []);
      } catch (error) {
        console.error('Error fetching source suggestions:', error);
        setSourceResults([]);
      } finally {
        setIsLoadingSource(false);
      }
    }
    
    fetchSourceSuggestions();
  }, [debouncedSourceQuery]);

  useEffect(() => {
    async function fetchDestinationSuggestions() {
      if (!debouncedDestinationQuery) {
        setDestinationResults([]);
        return;
      }
      
      setIsLoadingDestination(true);
      try {
        const response = await fetch(`/api/places?query=${encodeURIComponent(debouncedDestinationQuery)}`);
        if (!response.ok) throw new Error('Failed to fetch suggestions');
        const data = await response.json();
        setDestinationResults(data.predictions || []);
      } catch (error) {
        console.error('Error fetching destination suggestions:', error);
        setDestinationResults([]);
      } finally {
        setIsLoadingDestination(false);
      }
    }
    
    fetchDestinationSuggestions();
  }, [debouncedDestinationQuery]);

  function searchSource(query: string) {
    setSourceQuery(query);
  }

  function searchDestination(query: string) {
    setDestinationQuery(query);
  }

  return {
    sourceResults,
    destinationResults,
    searchSource,
    searchDestination,
    isLoadingSource,
    isLoadingDestination,
  };
}

// Add this hook to make useDebounce available
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
