import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { MapPin, Navigation, Plus, Minus, RotateCcw, List, Download, X } from 'lucide-react';

// Apartment data with latitude and longitude
const apartmentsLocation = [
  { id: 'p1', lat: 14.9669976, lng: 120.9332742, title: "Sunrise Apartments" },
  { id: 'p2', lat: 14.9818237, lng: 120.8761088, title: "Ocean View Residences" },
  { id: 'p3', lat: 14.981909, lng: 120.8761178, title: "Downtown Lofts" },
  { id: 'p4', lat: 14.9519381, lng: 120.8963623, title: "Garden Heights" },
  { id: 'p5', lat: 14.9527304, lng: 120.9027816, title: "Urban Living Complex" }
];
// Custom hook for geolocation
const useGeolocation = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation([latitude, longitude]);
        setLoading(false);
      },
      (err) => {
        setError('Unable to retrieve your location. Please enable location services.');
        setLoading(false);
      }
    );
  }, []);

  return { location, error, loading, getCurrentLocation };
};

// Custom hook for Leaflet map management
const useLeafletMap = (mapCenter, zoom) => {
  const [map, setMap] = useState(null);
  const [L, setL] = useState(null);
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const currentLocationMarkerRef = useRef(null);
  const apartmentMarkersRef = useRef({});

  // Load Leaflet dynamically
  useEffect(() => {
    const loadLeaflet = async () => {
      if (window.L) {
        setL(window.L);
        return;
      }

      try {
        // Load Leaflet CSS
        const cssLink = document.createElement('link');
        cssLink.rel = 'stylesheet';
        cssLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/leaflet.css';
        document.head.appendChild(cssLink);

        // Load Leaflet JS
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/leaflet.js';
        script.onload = () => {
          // Fix for default marker icons
          delete window.L.Icon.Default.prototype._getIconUrl;
          window.L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
            iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
          });
          setL(window.L);
        };
        document.head.appendChild(script);
      } catch (error) {
        console.error('Failed to load Leaflet:', error);
      }
    };

    loadLeaflet();
  }, []);

  const initializeMap = useCallback(() => {
    if (mapRef.current || !mapContainerRef.current || !L) return;

    try {
      const leafletMap = L.map(mapContainerRef.current).setView(mapCenter, zoom);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(leafletMap);

      mapRef.current = leafletMap;
      setMap(leafletMap);

      // Add apartment markers immediately
      const bounds = L.latLngBounds([]);
      
      apartmentsLocation.forEach(apt => {
        const redIcon = L.icon({
          iconUrl: 'https://cdn-icons-png.flaticon.com/512/10751/10751558.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        });

        const marker = L.marker([apt.lat, apt.lng], { icon: redIcon })
          .addTo(leafletMap)
          .bindPopup(`
            <div style="padding: 8px;">
              <h3 style="margin: 0 0 8px 0; color: #dc2626; font-weight: bold;">${apt.title}</h3>
              <p style="margin: 4px 0 0 0; font-size: 10px; color: #666;">Apartment location</p>
              <a href="https://www.google.com/maps?q=${apt.lat},${apt.lng}" style="background: #dc2626; color: white; border: none; padding: 4px 8px; border-radius: 4px; font-size: 12px;">Show Location</a>
            </div>
          `);
        
        apartmentMarkersRef.current[apt.id] = marker;
        bounds.extend([apt.lat, apt.lng]);
      });

      // Fit map to show all apartment markers
      if (bounds.isValid()) {
        leafletMap.fitBounds(bounds.pad(0.1));
      }

    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }, [mapCenter, zoom, L]);

  const updateCurrentLocationMarker = useCallback((coords) => {
    if (!mapRef.current || !L) return;
    
    try {
      if (currentLocationMarkerRef.current) {
        currentLocationMarkerRef.current.setLatLng(coords);
      } else {
        const greenIcon = L.icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        });

        currentLocationMarkerRef.current = L.marker(coords, {
          icon: greenIcon,
          title: 'Your Location',
          zIndexOffset: 1000
        }).addTo(mapRef.current)
          .bindPopup('Your current location');
      }
    } catch (error) {
      console.error('Error updating location marker:', error);
    }
  }, [L]);

  const cleanupMap = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
      setMap(null);
      currentLocationMarkerRef.current = null;
      apartmentMarkersRef.current = {};
    }
  }, []);

  return { 
    map, 
    mapContainerRef, 
    initializeMap, 
    cleanupMap, 
    updateCurrentLocationMarker,
    isLeafletLoaded: !!L
  };
};

// Custom hook for marker management
const useMarkers = (map, L) => {
  const [markers, setMarkers] = useState([]);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const markersRef = useRef({});

  const addMarker = useCallback((lat, lng) => {
    if (!map || !L) return;

    const newMarker = {
      id: `user-${Date.now()}`,
      lat,
      lng,
      title: `Marker ${markers.length + 1}`,
      description: 'Click to edit this marker'
    };

    try {
      const blueIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      const leafletMarker = L.marker([lat, lng], { icon: blueIcon })
        .addTo(map)
        .bindPopup(`
          <div style="padding: 8px;">
            <h3 style="margin: 0 0 8px 0; color: #2563eb; font-weight: bold;">${newMarker.title}</h3>
            <p style="margin: 0; font-size: 12px;">Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}</p>
            <p style="margin: 4px 0 8px 0; font-size: 12px; color: #666;">${newMarker.description}</p>
            <button onclick="editMarker('${newMarker.id}')" style="background: #2563eb; color: white; border: none; padding: 4px 8px; margin-right: 4px; border-radius: 4px; font-size: 12px;">Edit</button>
            <button onclick="deleteMarker('${newMarker.id}')" style="background: #dc2626; color: white; border: none; padding: 4px 8px; border-radius: 4px; font-size: 12px;">Delete</button>
          </div>
        `);

      markersRef.current[newMarker.id] = leafletMarker;
      setMarkers(prev => [...prev, newMarker]);
    } catch (error) {
      console.error('Error adding marker:', error);
    }
  }, [map, L, markers.length]);

  const editMarker = useCallback((id, updates) => {
    setMarkers(prev => prev.map(marker => 
      marker.id === id ? { ...marker, ...updates } : marker
    ));
  }, []);

  const deleteMarker = useCallback((id) => {
    if (markersRef.current[id]) {
      markersRef.current[id].remove();
      delete markersRef.current[id];
    }
    setMarkers(prev => prev.filter(marker => marker.id !== id));
  }, []);

  const clearMarkers = useCallback(() => {
    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};
    setMarkers([]);
    setSelectedMarker(null);
  }, []);

  const fitMapToMarkers = useCallback(() => {
    if (!map || !L) return;
    
    const bounds = L.latLngBounds([
      ...apartmentsLocation.map(apt => [apt.lat, apt.lng]),
      ...markers.map(marker => [marker.lat, marker.lng])
    ]);
    
    if (bounds.isValid()) {
      map.fitBounds(bounds.pad(0.1));
    }
  }, [map, L, markers]);

  // Expose functions globally for popup buttons
  useEffect(() => {
    window.editMarker = (id) => {
      const marker = markers.find(m => m.id === id);
      if (marker) {
        const newTitle = prompt('Enter new title:', marker.title);
        const newDescription = prompt('Enter new description:', marker.description);
        if (newTitle !== null && newDescription !== null) {
          editMarker(id, { title: newTitle, description: newDescription });
        }
      }
    };

    window.deleteMarker = (id) => {
      if (confirm('Are you sure you want to delete this marker?')) {
        deleteMarker(id);
      }
    };

    return () => {
      delete window.editMarker;
      delete window.deleteMarker;
    };
  }, [markers, editMarker, deleteMarker]);

  return {
    markers,
    selectedMarker,
    setSelectedMarker,
    addMarker,
    editMarker,
    deleteMarker,
    clearMarkers,
    fitMapToMarkers
  };
};

const InteractiveMap = ({ onClose }) => {
  const [mapCenter, setMapCenter] = useState([14.5995, 120.9842]); // Default to Manila
  const [zoom, setZoom] = useState(13);
  const [showMarkersPanel, setShowMarkersPanel] = useState(false);
  
  const { location, error, loading, getCurrentLocation } = useGeolocation();
  const { 
    map, 
    mapContainerRef, 
    initializeMap, 
    cleanupMap,
    updateCurrentLocationMarker,
    isLeafletLoaded
  } = useLeafletMap(mapCenter, zoom);
  
  const { 
    markers, 
    selectedMarker, 
    setSelectedMarker, 
    addMarker, 
    editMarker, 
    deleteMarker, 
    clearMarkers,
    fitMapToMarkers 
  } = useMarkers(map, window.L);

  // Initialize map when Leaflet is loaded
  useEffect(() => {
    if (isLeafletLoaded) {
      initializeMap();
    }
    return cleanupMap;
  }, [isLeafletLoaded, initializeMap, cleanupMap]);

  // Get location on mount
  useEffect(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

  // Update map view when location changes
  useEffect(() => {
    if (location && map) {
      setMapCenter(location);
      map.setView(location, 15);
      updateCurrentLocationMarker(location);
    }
  }, [location, map, updateCurrentLocationMarker]);

  // Handle map click events
  useEffect(() => {
    if (!map) return;

    // const handleMapClick = (e) => {
    //   addMarker(e.latlng.lat, e.latlng.lng);
    // };

    // map.on('click', handleMapClick);

    return () => {
      // map.off('click', handleMapClick);
    };
  }, [map, addMarker]);

  // Map control functions
  const handleZoomIn = useCallback(() => {
    if (map) map.zoomIn();
  }, [map]);

  const handleZoomOut = useCallback(() => {
    if (map) map.zoomOut();
  }, [map]);

  const handleReset = useCallback(() => {
    clearMarkers();
    if (map) {
      fitMapToMarkers();
    }
  }, [map, clearMarkers, fitMapToMarkers]);

  const handleLocationClick = useCallback(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

  const toggleMarkersPanel = useCallback(() => {
    setShowMarkersPanel(prev => !prev);
  }, []);

  const exportMarkers = useCallback(() => {
    const data = {
      currentLocation: location,
      markers: markers,
      apartments: apartmentsLocation
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'map-data.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [location, markers]);

  // Memoized stats
  const stats = useMemo(() => ({
    markerCount: markers.length,
    apartmentCount: apartmentsLocation.length,
    hasLocation: !!location
  }), [markers.length, location]);

  return (
    <div className="w-full h-screen bg-gray-100 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white shadow-md p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
          <MapPin className="text-blue-600" />
          UPAHAN MAP
        </h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto mr-14 mt-2 sm:mt-0">
          <button
            onClick={handleLocationClick}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 w-full sm:w-auto"
          >
            <Navigation size={16} />
            {loading ? 'Locating...' : 'My Location'}
          </button>
          <button
            onClick={toggleMarkersPanel}
            className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors w-full sm:w-auto"
          >
            <List size={16} />
            Apartments
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors w-full sm:w-auto"
          >
            <RotateCcw size={16} />
            Reset
          </button>
        </div>
      </div>

      {/* Loading message */}
      {!isLeafletLoaded && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 mx-4 mt-2 rounded">
          Loading map...
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mx-4 mt-2 rounded">
          {error}
        </div>
      )}

      {/* Map container */}
      <div className="flex-1 relative">
        <div 
          id="map" 
          ref={mapContainerRef}
          className="absolute inset-0 w-full h-full"
        ></div>
        
        {/* Zoom controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-[1000]">
          <button
            onClick={handleZoomIn}
            className="w-10 h-10 bg-white shadow-lg rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <Plus size={24} />
          </button>
          <button
            onClick={handleZoomOut}
            className="w-10 h-10 bg-white shadow-lg rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <Minus size={16} />
          </button>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 right-4 bg-white p-3 rounded-lg shadow-lg z-[1000]">
          <div className="flex items-center mb-1">
            <div className="w-4 h-4 bg-red-600 mr-2 rounded-full"></div>
            <span className="text-sm">Apartments</span>
          </div>

          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-600 mr-2 rounded-full"></div>
            <span className="text-sm">Your Location</span>
          </div>
        </div>

        {/* Markers panel */}
        {showMarkersPanel && (
          <div className="absolute top-4 left-4 bg-white p-4 rounded-lg shadow-lg max-w-sm max-h-[70vh] overflow-y-auto z-[1000]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">Apartments</h3>
              <button 
                onClick={exportMarkers}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
              >
                <Download size={16} />
                Export
              </button>
            </div>
            
            {location && (
              <div className="mb-4 p-2 bg-blue-50 rounded">
                <h4 className="font-medium text-blue-800">Your Location</h4>
                <p className="text-sm text-gray-600">
                  Lat: {location[0].toFixed(6)}, Lng: {location[1].toFixed(6)}
                </p>
              </div>
            )}
            
            <div className="mb-4">
              <h4 className="font-medium">Apartments ({stats.apartmentCount})</h4>
              <ul className="space-y-2 mt-2">
                {apartmentsLocation.map(apt => (
                  <li 
                    key={apt.id} 
                    className="p-2 rounded hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      if (map) {
                        map.setView([apt.lat, apt.lng], 15);
                        setSelectedMarker({
                          ...apt,
                          isApartment: true
                        });
                      }
                    }}
                  >
                    <div className="font-medium text-red-600">{apt.title}</div>
                    <div className="text-sm text-gray-600">
                      Lat: {apt.lat.toFixed(6)}, Lng: {apt.lng.toFixed(6)}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              {markers.length > 0 ? (
                <ul className="space-y-2 mt-2">
                  {markers.map(marker => (
                    <li 
                      key={marker.id} 
                      className={`p-2 rounded cursor-pointer ${selectedMarker?.id === marker.id ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                      onClick={() => {
                        setSelectedMarker(marker);
                        if (map) {
                          map.setView([marker.lat, marker.lng], 15);
                        }
                      }}
                    >
                      <div className="font-medium text-blue-600">{marker.title}</div>
                      <div className="text-sm text-gray-600">
                        Lat: {marker.lat.toFixed(6)}, Lng: {marker.lng.toFixed(6)}
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteMarker(marker.id);
                        }}
                        className="mt-1 text-xs text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No markers added yet</p>
              )}
            </div>
          </div>
        )}

        {/* Stats */}
        {!showMarkersPanel && (
          <div className="absolute top-4 left-4 bg-white p-3 rounded-lg shadow-lg z-[1000]">
            <div className="text-sm text-gray-600">
              <div>Apartments: <span className="text-red-600">{stats.apartmentCount}</span></div>
              {stats.hasLocation && (
                <div className="text-green-600 mt-1">📍 Location enabled</div>
              )}
              {selectedMarker && (
                <div className={`mt-1 ${selectedMarker.isApartment ? 'text-red-600' : 'text-blue-600'}`}>
                  Selected: {selectedMarker.title}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InteractiveMap;