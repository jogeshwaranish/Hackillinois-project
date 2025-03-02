import React, { useRef, useEffect, useState } from 'react';
import * as maptilersdk from '@maptiler/sdk';
import '@maptiler/sdk/dist/maptiler-sdk.css';
import configData from '../config';
import './Map.css';

export default function SuggestedRoute() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [routeData, setRouteData] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState(null);
  const center = { lng: -110.75954, lat: 43.72874 };
  const zoom = 14;

  // Initialize map
  useEffect(() => {
    maptilersdk.config.apiKey = configData.MAPTILER_API_KEY;

    if (map.current) return;

    map.current = new maptilersdk.Map({
      container: mapContainer.current,
      style: maptilersdk.MapStyle.STREETS,
      center: [center.lng, center.lat],
      zoom: zoom,
      hash: true,
    });

    map.current.on('load', () => {
      console.log('Map loaded');
      setMapLoaded(true);
    });

    return () => {
      if (map.current) map.current.remove();
    };
  }, [center.lng, center.lat, zoom]);

  // Fetch route data
  useEffect(() => {
    console.log('Fetching route data...');

    fetch('/optimal')
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log('Received route data:', data);
        if (!data || !data.features || data.features.length === 0) {
          throw new Error('Invalid or empty route data');
        }
        setRouteData(data);
      })
      .catch((error) => {
        console.error('Error loading route data:', error);
        setError(`Failed to load route data: ${error.message}`);
      });
  }, []);

  // Add route to map when both map is loaded AND we have route data
  useEffect(() => {
    if (!mapLoaded || !routeData) {
      console.log('Waiting for map to load and route data to be available...');
      return;
    }

    console.log('Adding route to map');

    try {
      // Check that routeData has the expected structure
      if (!routeData.features?.[0]?.geometry?.coordinates) {
        setError('Route data is missing coordinates');
        return;
      }

      // Add the polyline to the map
      maptilersdk.helpers
        .addPolyline(map.current, {
          data: routeData,
          outline: true,
          lineColor: 'purple',
          lineWidth: 6,
          outlineColor: '#D3DBEC',
          outlineWidth: 10,
        })
        .then(() => {
          console.log('Polyline added successfully');

          // Fit map to route bounds
          const coordinates = routeData.features[0].geometry.coordinates;

          if (coordinates.length > 0) {
            const bounds = coordinates.reduce((bounds, coord) => {
              return bounds.extend(coord);
            }, new maptilersdk.LngLatBounds(coordinates[0], coordinates[0]));

            map.current.fitBounds(bounds, {
              padding: 50,
              maxZoom: 14,
            });

            // Add points of interest along the route with hover functionality
            addPointsOfInterest(coordinates);
          }
        })
        .catch((error) => {
          console.error('Error adding polyline:', error);
          setError(`Failed to add route to map: ${error.message}`);
        });
    } catch (error) {
      console.error('Error processing route data:', error);
      setError(`Failed to process route data: ${error.message}`);
    }
  }, [mapLoaded, routeData]);

  // Function to add points of interest along the route
  const addPointsOfInterest = (coordinates) => {
    // Example points of interest - in a real app, you would likely fetch this data
    // or derive it from your routeData

    const pointsOfInterest = [];
    for (let i = 0; i < coordinates.length; i++) {
      pointsOfInterest.push({
        coordinate: coordinates[i], // Starting point
        title: 'Point ' + (i+1),
      });
    }

    // const pointsOfInterest = [
    //   {
    //     coordinate: coordinates[0], // Starting point
    //     title: 'Starting Point',
    //     description: 'Beginning of the route',
    //     elevation: '7,200 ft',
    //     terrain: 'Paved road'
    //   },
    //   {
    //     coordinate: coordinates[Math.floor(coordinates.length / 3)], // 1/3 of the way
    //     title: 'Scenic Viewpoint',
    //     description: 'Beautiful mountain vista',
    //     elevation: '8,500 ft',
    //     terrain: 'Gravel path'
    //   },
    //   {
    //     coordinate: coordinates[Math.floor(coordinates.length * 2 / 3)], // 2/3 of the way
    //     title: 'River Crossing',
    //     description: 'Cross the Snake River',
    //     elevation: '7,800 ft',
    //     terrain: 'Wooden bridge'
    //   },
    //   {
    //     coordinate: coordinates[coordinates.length - 1], // End point
    //     title: 'Destination',
    //     description: 'End of the route',
    //     elevation: '7,400 ft',
    //     terrain: 'Dirt trail'
    //   }
    // ];

    // Create a popup but don't add it to the map yet
    const popup = new maptilersdk.Popup({
      closeButton: false,
      closeOnClick: false,
    });

    // Add each point to the map
    pointsOfInterest.forEach((point) => {
      // Create a marker element
      const markerElement = document.createElement('div');
      markerElement.className = 'custom-marker';
      markerElement.style.width = '20px';
      markerElement.style.height = '20px';
      markerElement.style.borderRadius = '50%';
      markerElement.style.backgroundColor = 'rgba(255, 165, 0, 0.8)'; // Semi-transparent orange
      markerElement.style.border = '2px solid white';
      markerElement.style.cursor = 'pointer';

      // Create the marker
      const marker = new maptilersdk.Marker({
        element: markerElement,
        anchor: 'center',
      })
        .setLngLat(point.coordinate)
        .addTo(map.current);

      // HTML content for the popup
      const popupContent = `
        <div>
          <div style="font-size: 0.9em; color: #666;">          
          <h3 style="margin: 0 0 5px 0">${point.title}</h3>
          </div>
        </div>
      `;

      // Add hover event listeners to the marker
      markerElement.addEventListener('mouseenter', () => {
        popup
          .setLngLat(point.coordinate)
          .setHTML(popupContent)
          .addTo(map.current);

        // Change marker style on hover
        markerElement.style.backgroundColor = 'rgba(255, 0, 0, 0.8)'; // Red when hovered
        markerElement.style.width = '22px';
        markerElement.style.height = '22px';
      });

      markerElement.addEventListener('mouseleave', () => {
        popup.remove();

        // Restore original marker style
        markerElement.style.backgroundColor = 'rgba(255, 165, 0, 0.8)';
        markerElement.style.width = '20px';
        markerElement.style.height = '20px';
      });

      // Optional: Add click event for mobile users
      markerElement.addEventListener('click', () => {
        popup
          .setLngLat(point.coordinate)
          .setHTML(popupContent)
          .addTo(map.current);
      });
    });
  };

  return (
    <div className="map-wrap">
      <div ref={mapContainer} className="map" />
      {error && (
        <div
          className="error-message"
          style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            padding: '10px',
            borderRadius: '4px',
            color: 'red',
          }}
        >
          {error}
        </div>
      )}
      {!routeData && !error && (
        <div
          className="loading-message"
          style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            padding: '10px',
            borderRadius: '4px',
          }}
        >
          Loading route data...
        </div>
      )}
    </div>
  );
}
