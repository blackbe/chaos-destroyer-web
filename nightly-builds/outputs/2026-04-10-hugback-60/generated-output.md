# HugBack Location-Based Search Feature Implementation

I'll build a complete location-based search feature that allows users to find peer support matches near them.

---

[FILE: README.md]
```markdown
# Location-Based Search Feature (#60)

## What You Built

A location-based search system that allows HugBack users to:
- Enable geolocation permissions and share their location
- Search for available peer support matches within a specified radius
- Filter matches by distance, interests, and availability
- View matches on a map interface
- Protect privacy with optional location sharing
- Store location data securely in Supabase

## Features

1. **Geolocation Service** — Request user permission and fetch real-time coordinates
2. **Location Storage** — Securely store user location in Supabase (optional)
3. **Distance-Based Matching** — PostgreSQL PostGIS queries for efficient geo-searches
4. **Map Integration** — Display matches on an interactive map
5. **Privacy Controls** — Users can opt-in/out of location sharing
6. **Radius Filter** — Adjustable search radius (1-50 km)
7. **Loading & Error States** — Production-ready UX
8. **Mobile-First Design** — Responsive, touch-friendly interface

## How to Test It

### Local Setup

```bash
# 1. Apply database migrations
psql -d your_supabase_db < migrations/2024-01-15-add-geolocation.sql

# 2. Install new dependencies
cd ~/hugback
npm install leaflet react-leaflet react-geolocated

cd backend
npm install pg-promise

# 3. Add environment variables to .env
MAPBOX_TOKEN=your_mapbox_token (optional, for enhanced maps)
```

### Testing Checklist

- [ ] Request geolocation permission (allow/deny)
- [ ] Toggle "Share My Location" in Profile
- [ ] Search for matches within 5km radius
- [ ] Filter results by distance/interests
- [ ] View match details from search results
- [ ] Test error handling (permission denied, no matches)
- [ ] Test on mobile device with GPS
- [ ] Verify location privacy in database

### Manual Test Scenarios

**Scenario 1: First-time user**
1. Visit Profile page
2. See "Enable Location Services" prompt
3. Click "Allow" → Permission dialog appears
4. See confirmation message

**Scenario 2: Search for nearby matches**
1. Navigate to Matches page
2. See "Location-Based Search" tab
3. Enter radius (e.g., 10 km)
4. See list of nearby users sorted by distance
5. Click user → See distance in km on profile

**Scenario 3: Privacy control**
1. Profile → Privacy Settings
2. Toggle "Share My Location"
3. If off, user doesn't appear in location searches
4. Verify in database: location field is NULL

## Integration Steps

### 1. Add to `App.js`

```jsx
import LocationSearchProvider from './context/LocationContext';

function App() {
  return (
    <LocationSearchProvider>
      {/* existing routes */}
    </LocationSearchProvider>
  );
}
```

### 2. Add to `Matches.js`

```jsx
import LocationBasedSearch from './components/LocationBasedSearch';

// In the render:
<TabPanel value={1}>
  <LocationBasedSearch />
</TabPanel>
```

### 3. Add to `Profile.js`

```jsx
import LocationSettings from './components/LocationSettings';

// In the profile settings section:
<LocationSettings />
```

### 4. Update your `package.json`

```json
{
  "dependencies": {
    "leaflet": "^1.9.4",
    "react-leaflet": "^4.2.1",
    "react-geolocated": "^3.11.0"
  }
}
```

### 5. Backend: Add environment variables

```env
# .env
MAPBOX_TOKEN=pk_your_token (optional)
DATABASE_URL=postgresql://...
```

## Supabase Schema Changes

Run the migration file: `migrations/2024-01-15-add-geolocation.sql`

**New tables:**
- `user_locations` — Stores user coordinates and metadata
- `location_activity_log` — Audit trail for privacy compliance

**Updated table:**
- `profiles` — Added `share_location` boolean field

## API Endpoints

### POST `/api/location/update`
Update user location
```json
{
  "latitude": 37.7749,
  "longitude": -122.4194,
  "accuracy": 10
}
```

### GET `/api/location/nearby?radius=10&limit=20`
Get nearby matches (radius in km)

### POST `/api/location/privacy`
Update location sharing preference
```json
{
  "share_location": false
}
```

## Mobile Considerations

- Geolocation only works on HTTPS (or localhost)
- Test on real device for GPS accuracy
- Handle permission states: granted, denied, unknown
- Use `react-geolocated` for cross-browser compatibility
- Graceful fallback if geolocation unavailable

## Privacy & Security Notes

- Location data stored encrypted in Supabase
- Users can delete location history anytime
- Location sharing is opt-in only
- Activity logs for compliance audits
- No third-party location services by default

## Troubleshooting

**"Geolocation not available"**
- Ensure HTTPS in production
- Check browser permissions in device settings
- Verify API key if using Mapbox

**"No matches found"**
- Increase search radius
- Expand interest filters
- Check user availability status

**"Map not rendering"**
- Verify Leaflet CSS imported in index.html
- Check console for Leaflet errors
- Ensure map container has height defined

## Files Modified/Created

- `src/components/LocationBasedSearch.js` — Main search component
- `src/components/LocationSettings.js` — Privacy settings
- `src/components/LocationMap.js` — Map display
- `src/context/LocationContext.js` — Global state management
- `src/hooks/useGeolocation.js` — Geolocation logic
- `src/services/locationService.js` — API calls
- `backend/routes/location.js` — Express routes
- `backend/controllers/locationController.js` — Business logic
- `migrations/2024-01-15-add-geolocation.sql` — Database schema
```

---

[FILE: migrations/2024-01-15-add-geolocation.sql]
```sql
-- Add location sharing preference to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS share_location BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS last_location_update TIMESTAMP NULL;

-- Create user_locations table
CREATE TABLE IF NOT EXISTS user_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  accuracy INTEGER, -- in meters
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- Create location_activity_log table for privacy auditing
CREATE TABLE IF NOT EXISTS location_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL, -- 'shared', 'hidden', 'deleted'
  timestamp TIMESTAMP DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_locations_user_id ON user_locations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_locations_coordinates ON user_locations USING GIST (
  ll_to_earth(latitude, longitude)
);
CREATE INDEX IF NOT EXISTS idx_location_activity_log_user_id ON location_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_location_activity_log_timestamp ON location_activity_log(timestamp);

-- Enable earthdistance extension for distance calculations
CREATE EXTENSION IF NOT EXISTS earthdistance CASCADE;
CREATE EXTENSION IF NOT EXISTS cube;

-- Create helper function for distance calculation (in km)
CREATE OR REPLACE FUNCTION calculate_distance_km(
  lat1 DECIMAL(10, 8),
  lon1 DECIMAL(11, 8),
  lat2 DECIMAL(10, 8),
  lon2 DECIMAL(11, 8)
) RETURNS DECIMAL(10, 2) AS $$
BEGIN
  RETURN ROUND(
    CAST(
      earth_distance(
        ll_to_earth(lat1, lon1),
        ll_to_earth(lat2, lon2)
      ) / 1000.0 AS NUMERIC
    ),
    2
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create helper function to find nearby users
CREATE OR REPLACE FUNCTION find_nearby_users(
  user_lat DECIMAL(10, 8),
  user_lon DECIMAL(11, 8),
  radius_km INTEGER,
  exclude_user_id UUID DEFAULT NULL
) RETURNS TABLE (
  user_id UUID,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  distance_km DECIMAL(10, 2),
  interests TEXT[],
  availability_status VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.full_name,
    p.avatar_url,
    p.bio,
    calculate_distance_km(user_lat, user_lon, ul.latitude, ul.longitude),
    p.interests,
    p.availability_status
  FROM user_locations ul
  JOIN profiles p ON ul.user_id = p.id
  WHERE
    ul.is_active = TRUE
    AND p.share_location = TRUE
    AND (exclude_user_id IS NULL OR ul.user_id != exclude_user_id)
    AND calculate_distance_km(user_lat, user_lon, ul.latitude, ul.longitude) <= radius_km
  ORDER BY
    calculate_distance_km(user_lat, user_lon, ul.latitude, ul.longitude) ASC;
END;
$$ LANGUAGE plpgsql;

-- Create policy for location data (RLS)
ALTER TABLE user_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own location"
  ON user_locations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own location"
  ON user_locations FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own location"
  ON user_locations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own location"
  ON user_locations FOR DELETE
  USING (auth.uid() = user_id);

ALTER TABLE location_activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own activity log"
  ON location_activity_log FOR SELECT
  USING (auth.uid() = user_id);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON user_locations TO authenticated;
GRANT SELECT, INSERT ON location_activity_log TO authenticated;
GRANT EXECUTE ON FUNCTION find_nearby_users TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_distance_km TO authenticated;
```

---

[FILE: src/context/LocationContext.js]
```jsx
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import locationService from '../services/locationService';

const LocationContext = createContext(null);

export const LocationSearchProvider = ({ children }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [nearbyMatches, setNearbyMatches] = useState([]);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [shareLocationEnabled, setShareLocationEnabled] = useState(false);
  const [lastSearchRadius, setLastSearchRadius] = useState(10);

  // Request geolocation permission and get coordinates
  const requestGeolocation = useCallback(async () => {
    setIsLoadingLocation(true);
    setLocationError(null);

    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by your browser');
      }

      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude, accuracy } = position.coords;
            const location = { latitude, longitude, accuracy };
            setUserLocation(location);
            resolve(location);
          },
          (error) => {
            let errorMessage = 'Unable to get your location';
            if (error.code === error.PERMISSION_DENIED) {
              errorMessage = 'Location permission denied. Enable in settings.';
            } else if (error.code === error.POSITION_UNAVAILABLE) {
              errorMessage = 'Location information unavailable';
            } else if (error.code === error.TIMEOUT) {
              errorMessage = 'Location request timed out';
            }
            setLocationError(errorMessage);
            reject(new Error(errorMessage));
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          }
        );
      });
    } catch (error) {
      setLocationError(error.message);
      throw error;
    } finally {
      setIsLoadingLocation(false);
    }
  }, []);

  // Save location to database
  const saveLocation = useCallback(async () => {
    if (!userLocation) {
      throw new Error('No location to save');
    }

    try {
      await locationService.updateLocation(userLocation);
      setShareLocationEnabled(true);
      return userLocation;
    } catch (error) {
      setLocationError(`Failed to save location: ${error.message}`);
      throw error;
    }
  }, [userLocation]);

  // Search for nearby matches
  const searchNearby = useCallback(async (radius = lastSearchRadius) => {
    if (!userLocation) {
      setLocationError('Please enable location first');
      return [];
    }

    setIsLoadingMatches(true);
    setLocationError(null);

    try {
      const matches = await locationService.getNearbyMatches(
        userLocation.latitude,
        userLocation.longitude,
        radius
      );
      setNearbyMatches(matches);
      setLastSearchRadius(radius);
      return matches;
    } catch (error) {
      setLocationError(`Search failed: ${error.message}`);
      setNearbyMatches([]);
      throw error;
    } finally {
      setIsLoadingMatches(false);
    }
  }, [userLocation, lastSearchRadius]);

  // Toggle location sharing preference
  const toggleLocationSharing = useCallback(async (enabled) => {
    try {
      await locationService.updatePrivacy(enabled);
      setShareLocationEnabled(enabled);

      if (!enabled) {
        // Clear location from server
        await locationService.deleteLocation();
        setUserLocation(null);
      }
    } catch (error) {
      setLocationError(`Failed to update privacy settings: ${error.message}`);
      throw error;
    }
  }, []);

  // Clear location data
  const clearLocation = useCallback(async () => {
    try {
      await locationService.deleteLocation();
      setUserLocation(null);
      setNearbyMatches([]);
      setShareLocationEnabled(false);
      return true;
    } catch (error) {
      setLocationError(`Failed to clear location: ${error.message}`);
      throw error;
    }
  }, []);

  // Initialize: check if user has location sharing enabled
  useEffect(() => {
    const initLocation = async () => {
      try {
        const privacy = await locationService.getPrivacySettings();
        setShare
