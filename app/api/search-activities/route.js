import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { location, category, budget, radius = '25', searchTerm = '' } = await request.json()
    
    console.log('Search request:', { location, category, budget, radius, searchTerm })

    // Build Google Places search query based on category
    const categoryMappings = {
      'all': 'point_of_interest',
      'dining': 'restaurant',
      'entertainment': 'night_club|movie_theater|amusement_park',
      'outdoors': 'park|tourist_attraction',
      'culture': 'museum|art_gallery|library',
      'wellness': 'spa|gym|beauty_salon',
      'shopping': 'shopping_mall|store',
      'nightlife': 'bar|night_club|casino'
    }

    const placeType = categoryMappings[category] || 'point_of_interest'
    let searchQuery = searchTerm || getDefaultSearchTerm(category)
    
    // Add location to search query
    if (location) {
      searchQuery += ` in ${location}`
    }

    // Convert radius from miles to meters (Google Places uses meters)
    const radiusInMeters = parseInt(radius) * 1609.34

    console.log('Google Places query:', searchQuery)

    // Search Google Places
    const placesResponse = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&radius=${radiusInMeters}&key=${process.env.GOOGLE_PLACES_API_KEY}`
    )

    const placesData = await placesResponse.json()
    console.log('Places API status:', placesData.status)

    if (placesData.status !== 'OK' && placesData.status !== 'ZERO_RESULTS') {
      console.error('Places API error:', placesData)
      // Fall back to sample data
      return NextResponse.json({
        success: true,
        activities: generateFallbackActivities(category, location)
      })
    }

    // Process and format the results
    const activities = (placesData.results || []).slice(0, 12).map(place => {
      return {
        name: place.name,
        category: category,
        description: generateDescription(place.name, place.types, category),
        rating: place.rating || 4.0,
        priceLevel: formatPriceLevel(place.price_level),
        address: place.formatted_address || 'Address not available',
        phone: place.formatted_phone_number || '',
        hours: getOpeningHours(place.opening_hours),
        image: getCategoryEmoji(category, place.types),
        features: generateFeatures(place.types, category),
        photoUrl: place.photos && place.photos[0] ? 
          `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${process.env.GOOGLE_PLACES_API_KEY}` 
          : null,
        googleUrl: `https://www.google.com/maps/place/?q=place_id:${place.place_id}`,
        placeId: place.place_id
      }
    })

    // Filter by budget if specified
    const filteredActivities = filterByBudget(activities, budget)

    console.log(`Returning ${filteredActivities.length} activities`)

    return NextResponse.json({
      success: true,
      activities: filteredActivities,
      location: location,
      resultsCount: filteredActivities.length
    })

  } catch (error) {
    console.error('Search activities error:', error)
    
    // Return fallback data on error
    const { location, category } = await request.json().catch(() => ({ location: 'Your Area', category: 'all' }))
    
    return NextResponse.json({
      success: true,
      activities: generateFallbackActivities(category, location),
      location: location,
      resultsCount: 6,
      note: 'Showing sample results - API temporarily unavailable'
    })
  }
}

function getDefaultSearchTerm(category) {
  const searchTerms = {
    'all': 'activities couples things to do',
    'dining': 'restaurants romantic dinner',
    'entertainment': 'entertainment shows movies',
    'outdoors': 'parks trails outdoor activities',
    'culture': 'museums galleries cultural attractions',
    'wellness': 'spa massage wellness couples',
    'shopping': 'shopping centers markets',
    'nightlife': 'bars lounges nightlife'
  }
  return searchTerms[category] || 'activities'
}

function formatPriceLevel(priceLevel) {
  const priceLevels = {
    0: 'Free',
    1: '$',
    2: '$$',
    3: '$$$',
    4: '$$$$'
  }
  return priceLevels[priceLevel] || '$$'
}

function getOpeningHours(openingHours) {
  if (!openingHours) return 'Hours vary'
  if (openingHours.open_now === false) return 'Currently closed'
  if (openingHours.open_now === true) return 'Currently open'
  return 'See Google for hours'
}

function getCategoryEmoji(category, types = []) {
  // Try to get specific emoji based on Google place types
  if (types.includes('restaurant')) return '🍽️'
  if (types.includes('bar')) return '🍸'
  if (types.includes('museum')) return '🏛️'
  if (types.includes('park')) return '🌳'
  if (types.includes('spa')) return '🧘'
  if (types.includes('shopping_mall')) return '🛍️'
  if (types.includes('movie_theater')) return '🎬'
  if (types.includes('art_gallery')) return '🎨'
  
  // Fallback to category emojis
  const categoryEmojis = {
    'dining': '🍽️',
    'entertainment': '🎭',
    'outdoors': '🌳',
    'culture': '🎨',
    'wellness': '🧘',
    'shopping': '🛍️',
    'nightlife': '🌙',
    'all': '📍'
  }
  return categoryEmojis[category] || '📍'
}

function generateDescription(name, types = [], category) {
  // Generate a description based on the place name and types
  const typeDescriptions = {
    'restaurant': 'Delicious dining experience',
    'bar': 'Great drinks and atmosphere',
    'museum': 'Cultural and educational experience',
    'park': 'Beautiful outdoor space perfect for couples',
    'spa': 'Relaxing and rejuvenating experience',
    'shopping_mall': 'Shopping and entertainment destination',
    'art_gallery': 'Inspiring art and cultural exhibits',
    'tourist_attraction': 'Popular local attraction'
  }

  // Find the best description from types
  for (const type of types) {
    if (typeDescriptions[type]) {
      return typeDescriptions[type]
    }
  }

  // Fallback descriptions by category
  const categoryDescriptions = {
    'dining': 'Perfect spot for a romantic meal together',
    'entertainment': 'Fun entertainment for couples',
    'outdoors': 'Beautiful outdoor experience to share',
    'culture': 'Cultural experience to explore together',
    'wellness': 'Relaxing wellness experience for couples',
    'shopping': 'Great shopping experience',
    'nightlife': 'Perfect for an evening out',
    'all': 'Great local spot for couples'
  }

  return categoryDescriptions[category] || 'Wonderful local experience for couples'
}

function generateFeatures(types = [], category) {
  const features = []
  
  // Add features based on Google place types
  if (types.includes('restaurant')) features.push('Dining')
  if (types.includes('takeout')) features.push('Takeout Available')
  if (types.includes('delivery')) features.push('Delivery')
  if (types.includes('wheelchair_accessible')) features.push('Accessible')
  if (types.includes('outdoor_seating')) features.push('Outdoor Seating')
  if (types.includes('live_music')) features.push('Live Music')
  if (types.includes('romantic')) features.push('Romantic')
  
  // Add category-specific features
  const categoryFeatures = {
    'dining': ['Romantic', 'Date Night'],
    'entertainment': ['Fun', 'Evening Out'],
    'outdoors': ['Scenic', 'Active'],
    'culture': ['Educational', 'Inspiring'],
    'wellness': ['Relaxing', 'Couples Friendly'],
    'shopping': ['Variety', 'Local'],
    'nightlife': ['Atmosphere', 'Drinks']
  }

  if (categoryFeatures[category]) {
    features.push(...categoryFeatures[category])
  }

  // Ensure we have at least 2-3 features
  if (features.length < 2) {
    features.push('Couples Friendly', 'Local Favorite')
  }

  return features.slice(0, 3) // Limit to 3 features
}

function filterByBudget(activities, budget) {
  if (budget === 'all') return activities

  const budgetFilters = {
    'free': (activity) => activity.priceLevel === 'Free',
    'budget': (activity) => ['Free', '$', '$$'].includes(activity.priceLevel),
    'moderate': (activity) => ['$$', '$$$'].includes(activity.priceLevel),
    'upscale': (activity) => ['$$$', '$$$$'].includes(activity.priceLevel)
  }

  const filter = budgetFilters[budget]
  return filter ? activities.filter(filter) : activities
}

function generateFallbackActivities(category, location) {
  const fallbackData = {
    'dining': [
      {
        name: "The Garden Bistro",
        category: "dining",
        description: "Romantic farm-to-table dining with intimate ambiance",
        rating: 4.7,
        priceLevel: "$$$",
        address: `Downtown ${location || 'Your City'}`,
        phone: "(555) 123-4567",
        hours: "5:00 PM - 10:00 PM",
        image: "🍽️",
        features: ["Romantic", "Farm-to-Table", "Wine Bar"]
      },
      {
        name: "Waterfront Café",
        category: "dining",
        description: "Casual dining with beautiful water views",
        rating: 4.4,
        priceLevel: "$$",
        address: `Waterfront District, ${location || 'Your City'}`,
        phone: "(555) 234-5678",
        hours: "11:00 AM - 9:00 PM",
        image: "🍽️",
        features: ["Water Views", "Casual", "Outdoor Seating"]
      }
    ],
    'outdoors': [
      {
        name: "Sunset Trail",
        category: "outdoors",
        description: "Beautiful 2-mile walking trail perfect for couples",
        rating: 4.6,
        priceLevel: "Free",
        address: `City Park, ${location || 'Your City'}`,
        phone: "",
        hours: "Dawn to Dusk",
        image: "🌳",
        features: ["Scenic Views", "Easy Walk", "Sunset Views"]
      },
      {
        name: "Riverside Gardens",
        category: "outdoors",
        description: "Peaceful botanical gardens with romantic pathways",
        rating: 4.5,
        priceLevel: "$",
        address: `Garden District, ${location || 'Your City'}`,
        phone: "(555) 345-6789",
        hours: "9:00 AM - 6:00 PM",
        image: "🌳",
        features: ["Botanical", "Romantic", "Photography"]
      }
    ],
    'culture': [
      {
        name: "Local Art Museum",
        category: "culture",
        description: "Contemporary and classical art collections",
        rating: 4.3,
        priceLevel: "$$",
        address: `Arts District, ${location || 'Your City'}`,
        phone: "(555) 456-7890",
        hours: "10:00 AM - 6:00 PM",
        image: "🎨",
        features: ["Art Collection", "Educational", "Rotating Exhibits"]
      }
    ],
    'entertainment': [
      {
        name: "Historic Theater",
        category: "entertainment",
        description: "Live performances and classic movie screenings",
        rating: 4.8,
        priceLevel: "$$",
        address: `Theater District, ${location || 'Your City'}`,
        phone: "(555) 567-8901",
        hours: "Box office: 12:00 PM - 8:00 PM",
        image: "🎭",
        features: ["Live Shows", "Historic", "Date Night"]
      }
    ]
  }

  // Return category-specific data or mix of all categories
  if (category === 'all') {
    return Object.values(fallbackData).flat().slice(0, 6)
  }

  return fallbackData[category] || fallbackData['dining']
}

export async function GET(request) {
  return NextResponse.json({
    message: 'Search Activities API is working',
    endpoints: ['POST /api/search-activities'],
    timestamp: new Date().toISOString()
  })
}
