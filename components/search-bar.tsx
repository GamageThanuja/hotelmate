'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Building2, X } from 'lucide-react';

interface Hotel {
  hotelID: number;
  hotelGUID: string;
  finAct: boolean;
  hotelName: string;
  hotelCode: number;
  userGUID_HotelOwner: string;
  hotelType: string;
  hotelAddress: string;
  city: string;
  zipCode: string;
  country: string;
  hotelPhone: string;
  hotelEmail: string;
  hotelWeb: string;
  noOfRooms: number;
  latitude: string;
  longitude: string;
  currencyCode: string;
  languageCode: string;
  createdOn: string;
  createdTimeStamp: string;
  lastUpdatedOn: string | null;
  lastUpdatedTimeStamp: string | null;
  lastUpdatedBy_UserGUID: string;
  starCatgeory: number;
  cM_PropertyID: string;
  isCMActive: boolean;
  hotelDate: string;
  isOnTrial: null;
  planId: null;
  lowestRate: number;
}

interface Suggestion {
  id: string;
  text: string;
  type: 'hotel' | 'destination';
  icon: React.ReactNode;
}

interface SearchBarProps {
  onSearch?: (searchInput: string) => void;
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const [destinationInput, setDestinationInput] = useState('');
  const [hotelNameInput, setHotelNameInput] = useState('');
  const [destinationSuggestions, setDestinationSuggestions] = useState<Suggestion[]>([]);
  const [hotelSuggestions, setHotelSuggestions] = useState<Suggestion[]>([]);
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);
  const [showHotelSuggestions, setShowHotelSuggestions] = useState(false);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [selectedDestinationIndex, setSelectedDestinationIndex] = useState(-1);
  const [selectedHotelIndex, setSelectedHotelIndex] = useState(-1);
  const destinationRef = useRef<HTMLDivElement>(null);
  const hotelRef = useRef<HTMLDivElement>(null);
  const destinationInputRef = useRef<HTMLInputElement>(null);
  const hotelInputRef = useRef<HTMLInputElement>(null);

  // Extract unique destinations from hotels data
  const getUniqueDestinations = (): string[] => {
    const destinations = new Set<string>();
    
    hotels.forEach(hotel => {
      // Add city if available
      if (hotel.city && hotel.city.trim()) {
        destinations.add(hotel.city.trim());
      }
      // Add country if available and different from city
      if (hotel.country && hotel.country.trim() && hotel.country !== hotel.city) {
        destinations.add(hotel.country.trim());
      }
    });
    
    return Array.from(destinations).sort();
  };

  // Fetch hotels for suggestions
  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const response = await fetch('https://api.hotelmate.app/api/Admin/all-hotels', {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoiMTYwN2I5OWMtOTVhMy00YzA2LWEzMjQtOWM4ZmYyZTg0YzJlIiwiaHR0cDovL3NjaGVtYXMubWljcm9zb2Z0LmNvbS93cy8yMDA4LzA2L2lkZW50aXR5L2NsYWltcy9yb2xlIjoiSWJlVXNlciIsImZ1bGxOYW1lIjoiSUJFIFVzZXIiLCJlbWFpbCI6ImliZXVzZXJAc29tZXRoaW5nLmNvbSIsIm5iZiI6MTc0ODc1NjQ2MywiZXhwIjoyNTM0MDIyODEwMDAsImlzcyI6IkhvdGVsTWF0ZUlzc3VlciIsImF1ZCI6IkhvdGVsTWF0ZU1hbmFnZXIifQ.oDMnqcxsVic1Pke47zwo3f4qyA0v6Fu6UnNDbjskST0`,
          },
        });
        if (response.ok) {
          const hotelsData: Hotel[] = await response.json();
          setHotels(hotelsData);
        }
      } catch (error) {
        console.error('Failed to fetch hotels for suggestions:', error);
      }
    };

    fetchHotels();
  }, []);

  // Generate destination suggestions
  useEffect(() => {
    if (!destinationInput.trim()) {
      setDestinationSuggestions([]);
      setShowDestinationSuggestions(false);
      return;
    }

    const input = destinationInput.toLowerCase().trim();
    const newSuggestions: Suggestion[] = [];

    // Get all unique destinations from API data
    const uniqueDestinations = getUniqueDestinations();

    // Filter destinations that start with the input
    const matchingDestinations = uniqueDestinations
      .filter(destination =>
        destination.toLowerCase().startsWith(input)  // Start with input
      )
      .slice(0, 8) // Limit to 8 suggestions
      .map(destination => ({
        id: `destination-${destination}`,
        text: destination,
        type: 'destination' as const,
        icon: <MapPin className="w-4 h-4 text-gray-500" />
      }));

    newSuggestions.push(...matchingDestinations);

    setDestinationSuggestions(newSuggestions);
    setShowDestinationSuggestions(newSuggestions.length > 0);
    setSelectedDestinationIndex(-1);
  }, [destinationInput, hotels]);

  // Generate hotel suggestions
  useEffect(() => {
    if (!hotelNameInput.trim()) {
      setHotelSuggestions([]);
      setShowHotelSuggestions(false);
      return;
    }

    const input = hotelNameInput.toLowerCase().trim();
    const newSuggestions: Suggestion[] = [];

    // Add hotel suggestions
    const hotelSuggestions = hotels
      .filter(hotel =>
        hotel.hotelName.toLowerCase().includes(input) &&
        hotel.finAct === true
      )
      .slice(0, 8)
      .map(hotel => ({
        id: `hotel-${hotel.hotelID}`,
        text: hotel.hotelName,
        type: 'hotel' as const,
        icon: <Building2 className="w-4 h-4 text-gray-500" />
      }));

    newSuggestions.push(...hotelSuggestions);

    setHotelSuggestions(newSuggestions);
    setShowHotelSuggestions(newSuggestions.length > 0);
    setSelectedHotelIndex(-1);
  }, [hotelNameInput, hotels]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (destinationRef.current && !destinationRef.current.contains(event.target as Node)) {
        setShowDestinationSuggestions(false);
      }
      if (hotelRef.current && !hotelRef.current.contains(event.target as Node)) {
        setShowHotelSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation for destination input
  const handleDestinationKeyDown = (e: React.KeyboardEvent) => {
    if (!showDestinationSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedDestinationIndex(prev =>
          prev < destinationSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedDestinationIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedDestinationIndex >= 0) {
          handleDestinationSuggestionSelect(destinationSuggestions[selectedDestinationIndex]);
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        setShowDestinationSuggestions(false);
        setSelectedDestinationIndex(-1);
        break;
    }
  };

  // Handle keyboard navigation for hotel input
  const handleHotelKeyDown = (e: React.KeyboardEvent) => {
    if (!showHotelSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedHotelIndex(prev =>
          prev < hotelSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedHotelIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedHotelIndex >= 0) {
          handleHotelSuggestionSelect(hotelSuggestions[selectedHotelIndex]);
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        setShowHotelSuggestions(false);
        setSelectedHotelIndex(-1);
        break;
    }
  };

  const handleDestinationSuggestionSelect = (suggestion: Suggestion) => {
    setDestinationInput(suggestion.text);
    setShowDestinationSuggestions(false);
    setSelectedDestinationIndex(-1);
    
    // Trigger search with combined input
    const combinedSearch = suggestion.text + (hotelNameInput ? ` ${hotelNameInput}` : '');
    onSearch?.(combinedSearch.trim());
  };

  const handleHotelSuggestionSelect = (suggestion: Suggestion) => {
    setHotelNameInput(suggestion.text);
    setShowHotelSuggestions(false);
    setSelectedHotelIndex(-1);
    
    // Trigger search with combined input
    const combinedSearch = (destinationInput ? `${destinationInput} ` : '') + suggestion.text;
    onSearch?.(combinedSearch.trim());
  };

  const handleSearch = () => {
    const combinedSearch = `${destinationInput} ${hotelNameInput}`.trim();
    if (combinedSearch) {


      // Filter hotels by destination and hotel name, and exclude hotels without a valid city
      const filteredHotels = hotels.filter(hotel =>
        hotel.city && hotel.city.trim() && // Ensure the hotel has a valid city
        (destinationInput ? hotel.city.toLowerCase() === destinationInput.toLowerCase() : true) &&
        (hotelNameInput ? hotel.hotelName.toLowerCase().includes(hotelNameInput.toLowerCase()) : true)
      );
      
      setHotels(filteredHotels);
      setShowDestinationSuggestions(false);
      setShowHotelSuggestions(false);
      onSearch?.(combinedSearch);
    }
  };

  const clearDestination = () => {
    setDestinationInput('');
    setDestinationSuggestions([]);
    setShowDestinationSuggestions(false);
    destinationInputRef.current?.focus();
  };

  const clearHotelName = () => {
    setHotelNameInput('');
    setHotelSuggestions([]);
    setShowHotelSuggestions(false);
    hotelInputRef.current?.focus();
  };

  return (
    <div className="flex items-center bg-white border border-gray-200 rounded-full shadow-sm hover:shadow-md transition-shadow duration-200 w-full max-w-2xl">
      {/* Destination Input */}
      <div ref={destinationRef} className="relative flex-1">
        <div className="flex flex-col px-6 py-3 border-r border-gray-200">
          <label className="text-xs font-medium text-gray-900 mb-1">Where</label>
          <div className="flex items-center">
            <input
              ref={destinationInputRef}
              type="text"
              placeholder="Search destinations"
              value={destinationInput}
              onChange={(e) => setDestinationInput(e.target.value)}
              onKeyDown={handleDestinationKeyDown}
              onFocus={() => destinationInput && setShowDestinationSuggestions(destinationSuggestions.length > 0)}
              className="w-full text-sm placeholder-gray-400 focus:outline-none bg-transparent"
            />
            {destinationInput && (
              <button
                onClick={clearDestination}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors ml-2"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Destination Suggestions Dropdown */}
        {showDestinationSuggestions && destinationSuggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-2xl shadow-lg z-50 overflow-hidden">
            {destinationSuggestions.map((suggestion, index) => (
              <button
                key={suggestion.id}
                onClick={() => handleDestinationSuggestionSelect(suggestion)}
                className={`w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-150 ${
                  index === selectedDestinationIndex ? 'bg-gray-50' : ''
                }`}
              >
                {suggestion.icon}
                <span className="ml-3 text-sm text-gray-900">{suggestion.text}</span>
                <span className="ml-auto text-xs text-gray-500 capitalize">
                  {suggestion.type}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Hotel Name Input */}
      <div ref={hotelRef} className="relative flex-1">
        <div className="flex flex-col px-6 py-3">
          <label className="text-xs font-medium text-gray-900 mb-1">Hotel name</label>
          <div className="flex items-center">
            <input
              ref={hotelInputRef}
              type="text"
              placeholder="Enter hotel name"
              value={hotelNameInput}
              onChange={(e) => setHotelNameInput(e.target.value)}
              onKeyDown={handleHotelKeyDown}
              onFocus={() => hotelNameInput && setShowHotelSuggestions(hotelSuggestions.length > 0)}
              className="w-full text-sm placeholder-gray-400 focus:outline-none bg-transparent"
            />
            {hotelNameInput && (
              <button
                onClick={clearHotelName}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors ml-2"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Hotel Suggestions Dropdown */}
        {showHotelSuggestions && hotelSuggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-2xl shadow-lg z-50 overflow-hidden">
            {hotelSuggestions.map((suggestion, index) => (
              <button
                key={suggestion.id}
                onClick={() => handleHotelSuggestionSelect(suggestion)}
                className={`w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-150 ${
                  index === selectedHotelIndex ? 'bg-gray-50' : ''
                }`}
              >
                {suggestion.icon}
                <span className="ml-3 text-sm text-gray-900">{suggestion.text}</span>
                <span className="ml-auto text-xs text-gray-500 capitalize">
                  {suggestion.type}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Search Button */}
      <button
        onClick={handleSearch}
        className="bg-orange-500 text-white px-8 py-4 rounded-full hover:bg-orange-600 transition-colors duration-200 font-medium text-sm mx-2"
      >
        Search
      </button>
    </div>
  );
}