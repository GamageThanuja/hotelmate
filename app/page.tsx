'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/header';
import { SearchBar } from '@/components/search-bar';
import { useCurrency } from "@/components/currency-context"
import { CurrencySelector } from "@/components/currency-selector"

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

interface PropertyListing {
  id: number;
  type: string;
  location: string;
  rating: number;
  image: string;
  hotelCode: number;
  lowestRate: number;
}

interface SearchParams {
  destination: string;
  hotelName: string;
  searchType: 'destination' | 'hotel' | 'both' | 'none';
}

// Your exact UI PropertyListings component with click functionality
function PropertyListings({
  title,
  destination,
  properties,
  onHotelClick
}: {
  title: string;
  destination: string;
  properties: PropertyListing[];
  onHotelClick: (hotelCode: number) => void;
}) {
  return (
    <div className="px-6 py-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        <span className="text-gray-400">›</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
        {properties.map((property) => {
          console.log({
            hotelName: property.type,
            lowestRate: property.lowestRate,
            location: property.location,
            starRating: property.rating
          });

          return (
            <div
              key={property.id}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
              onClick={() => onHotelClick(property.hotelCode)}
            >
              <div className="aspect-[4/3] bg-gray-100 flex items-center justify-center p-8">
                {property.image ? (
                  <img
                    src={property.image}
                    alt={property.type}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100"></div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1">{property.type}</h3>
                <div className="flex items-center gap-1 mb-2">
                  <span className="text-orange-400"></span>
                </div>
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`w-4 h-4 ${star <= property.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                {property.location && (
                  <p className="text-gray-600 text-sm mt-2">{property.location}</p>
                )}
                <div className="text-right text-lg">
                  {/* Display lowest rate */}
                  <span className="notranslate">${property.lowestRate}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const { convertPrice, formatPrice, currency } = useCurrency()
  const [sriLankanProperties, setSriLankanProperties] = useState<PropertyListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useState<SearchParams>({
    destination: '',
    hotelName: '',
    searchType: 'none'
  });
  const [displayTitle, setDisplayTitle] = useState('Featured hotels');

  useEffect(() => {
    fetchHotels();
  }, []);

  const parseSearchInput = (searchInput: string): SearchParams => {
    if (!searchInput.trim()) {
      return { destination: '', hotelName: '', searchType: 'none' };
    }

    const input = searchInput.trim().toLowerCase();

    // Check if input contains location keywords (cities/countries)
    const locationKeywords = ['sri lanka', 'colombo', 'kandy', 'galle', 'bentota', 'negombo', 'ella', 'nuwara eliya'];
    const hasLocation = locationKeywords.some(location => input.includes(location.toLowerCase()));

    // Check if input might be a hotel name (if it doesn't contain common location words)
    const isLikelyHotelName = !hasLocation || (hasLocation && input.split(' ').length <= 3);

    if (hasLocation && isLikelyHotelName) {
      // Both hotel name and location
      const locationPart = locationKeywords.find(loc => input.includes(loc.toLowerCase())) || '';
      const hotelPart = input.replace(locationPart.toLowerCase(), '').trim();
      return {
        destination: locationPart,
        hotelName: hotelPart,
        searchType: 'both'
      };
    } else if (hasLocation) {
      // Location only
      return {
        destination: input,
        hotelName: '',
        searchType: 'destination'
      };
    } else {
      // Hotel name only
      return {
        destination: '',
        hotelName: input,
        searchType: 'hotel'
      };
    }
  };

  const updateDisplayTitle = (params: SearchParams) => {
    switch (params.searchType) {
      case 'destination':
        setDisplayTitle(`Featured Hotels in ${params.destination}`);
        break;
      case 'hotel':
        setDisplayTitle(`Featured Hotels related to "${params.hotelName}"`);
        break;
      case 'both':
        setDisplayTitle(`${params.hotelName}, ${params.destination}`);
        break;
      default:
        setDisplayTitle('Featured hotels');
    }
  };

  const filterHotels = (hotels: Hotel[], params: SearchParams): Hotel[] => {
    if (params.searchType === 'none') {
      return hotels.slice(0, 6);
    }

    let filtered = hotels;

    if (params.searchType === 'destination') {
      // Destination only - filter by location
      filtered = filtered.filter(hotel => {
        const location = `${hotel.city} ${hotel.country}`.toLowerCase();
        return location.includes(params.destination.toLowerCase());
      });
    } else if (params.searchType === 'hotel') {
      // Hotel name only - filter by name
      filtered = filtered.filter(hotel =>
        hotel.hotelName.toLowerCase().includes(params.hotelName.toLowerCase())
      );
    } else if (params.searchType === 'both') {
      // Both criteria - hotel must match name AND (have matching location OR have no location data)
      filtered = filtered.filter(hotel => {
        const location = `${hotel.city} ${hotel.country}`.toLowerCase();
        const locationMatches = location.includes(params.destination.toLowerCase());
        const nameMatches = hotel.hotelName.toLowerCase().includes(params.hotelName.toLowerCase());

        // For BOTH search: hotel must match name AND (have matching location OR have no location data)
        const hasLocationData = hotel.city && hotel.country;
        return nameMatches && (!hasLocationData || locationMatches);
      });
    }

    return filtered;
  };

  const fetchHotels = async (searchInput?: string) => {
    try {
      setLoading(true);
      const response = await fetch('https://api.hotelmate.app/api/Admin/all-hotels', {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoiMTYwN2I5OWMtOTVhMy00YzA2LWEzMjQtOWM4ZmYyZTg0YzJlIiwiaHR0cDovL3NjaGVtYXMubWljcm9zb2Z0LmNvbS93cy8yMDA4LzA2L2lkZW50aXR5L2NsYWltcy9yb2xlIjoiSWJlVXNlciIsImZ1bGxOYW1lIjoiSUJFIFVzZXIiLCJlbWFpbCI6ImliZXVzZXJAc29tZXRoaW5nLmNvbSIsIm5iZiI6MTc0ODc1NjQ2MywiZXhwIjoyNTM0MDIyODEwMDAsImlzcyI6IkhvdGVsTWF0ZUlzc3VlciIsImF1ZCI6IkhvdGVsTWF0ZU1hbmFnZXIifQ.oDMnqcxsVic1Pke47zwo3f4qyA0v6Fu6UnNDbjskST0`,
        },
      });

      if (!response.ok) {
        console.error('Failed to fetch hotels:', response.status, response.statusText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const hotels: Hotel[] = await response.json();

      // Parse search parameters
      const params = searchInput ? parseSearchInput(searchInput) : { destination: '', hotelName: '', searchType: 'none' as const };
      setSearchParams(params);
      updateDisplayTitle(params);

      // Filter hotels based on search parameters
      const filteredHotels = filterHotels(hotels, params);

      const transformedProperties: PropertyListing[] = filteredHotels.map((hotel) => ({
        id: hotel.hotelID,
        type: hotel.hotelName,
        location: hotel.city || hotel.hotelAddress,
        price: "",
        nights: 2,
        rating: hotel.starCatgeory,
        occupancy: "",
        amenities: [],
        image: (hotel as any).hotelImage?.imageFileName || '',
        hotelCode: hotel.hotelCode,
        lowestRate: hotel.lowestRate || 0,
      }));

      setSriLankanProperties(transformedProperties);
    } catch (error) {
      console.error('Failed to fetch hotels:', error);
      setSriLankanProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const handleHotelClick = (hotelCode: number) => {
    console.log('Navigating to hotel with code:', hotelCode); // Debug log
    router.push(`/hotel?hotelCode=${hotelCode}`);
  };

  const handleSearch = (searchInput: string) => {
    fetchHotels(searchInput);
  };

  return (
    <main className="min-h-screen">
      <Header />
      <div className="max-w-[1760px] mx-auto">
        <div className="flex justify-center items-center p-4 gap-4">
          <SearchBar onSearch={handleSearch} />
          <CurrencySelector />
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-lg text-gray-600">Loading hotels...</div>
          </div>
        ) : (
          <PropertyListings
            title={displayTitle}
            destination="sri-lanka"
            properties={sriLankanProperties}
            onHotelClick={handleHotelClick}
          />
        )}
      </div>
    </main>
  );
}