import React, { useRef, useEffect, useState } from 'react';
import * as maptilersdk from '@maptiler/sdk';
import "@maptiler/sdk/dist/maptiler-sdk.css";
import configData from "../config";
import './Map.css';

export default function Heatmap() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [geoData, setGeoData] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState(null);
  
  // Updated center to Illinois coordinates based on your GeoJSON data
  const center = { lng: -88.23524427791183, lat: 40.10230588782403 };
  const zoom = 14;
 
  // Set API key
  useEffect(() => {
    maptilersdk.config.apiKey = configData.MAPTILER_API_KEY;
  }, []);

  // Initialize map
  useEffect(() => {
    if (map.current) return;
    
    map.current = new maptilersdk.Map({
      container: mapContainer.current,
      style: maptilersdk.MapStyle.DATAVIZ.LIGHT,
      center: [center.lng, center.lat],
      zoom: zoom,
      hash: true,
    });

    map.current.on("load", () => {
      setMapLoaded(true);
    });

    return () => {
      if (map.current) map.current.remove();
    };
  }, [center.lng, center.lat, zoom]);

  // Fetch data and add layers once map is loaded
  useEffect(() => {
    if (!mapLoaded) return;

    console.log("Fetching GeoJSON data...");
    
    fetch('/geojson')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log("GeoJSON data received:", data);
        
        if (!data || !data.features || data.features.length === 0) {
          setError("Received empty or invalid GeoJSON data");
          return;
        }

        // Transform data to match frontend needs
        const processedData = {
          ...data,
          features: data.features.map(feature => ({
            ...feature,
            properties: {
              ...feature.properties,
              // Convert timestamp to hour (0-23)
              hour: new Date(feature.properties.time * 1000).getHours(),
              // Calculate days old
              days_old: Math.floor((Date.now()/1000 - feature.properties.time) / 86400),
              // Alias amount to cash_amount
              cash_amount: feature.properties.amount || 1 // Fallback if amount is missing
            }
          }))
        };
        
        setGeoData(processedData);
        
        if (map.current.getSource('transactions')) {
          map.current.getSource('transactions').setData(processedData);
        } else {
          map.current.addSource('transactions', {
            type: 'geojson',
            data: processedData
          });
          
          map.current.addLayer({
            id: 'cash-heatmap',
            type: 'heatmap',
            source: 'transactions',
            maxzoom: 15,
            paint: {
              'heatmap-weight': [
                'interpolate',
                ['linear'],
                ['get', 'cash_amount'], // Now using transformed property
                0, 0,
                30, 1 // Adjusted max value to match your data range
              ],
              'heatmap-radius': [
                'case',
                ['<', ['get', 'hour'], 12], 30,
                ['<', ['get', 'hour'], 18], 40,
                40
              ],
              'heatmap-color': [
                'interpolate',
                ['linear'],
                ['heatmap-density'],
                0, 'rgba(0, 128, 0, 0)',         // Transparent green
                0.1, 'rgba(0, 255, 0, 0.5)',     // Light green
                0.3, 'rgba(173, 255, 47, 0.7)',  // Green-yellow
                0.5, 'rgba(255, 255, 0, 0.8)',   // Yellow
                0.7, 'rgba(255, 165, 0, 0.9)',   // Orange
                0.9, 'rgba(255, 69, 0, 0.95)',   // Orange-red
                1, 'rgba(255, 0, 0, 1)'  
              ],
              'heatmap-intensity': [
                'interpolate',
                ['linear'],
                ['zoom'],
                0, 1,
                9, 3
              ],
              'heatmap-opacity': 0.8 // Simplified from your formula for better visibility
            }
          });
          
          // Add a circle layer to make individual points visible
          // map.current.addLayer({
          //   id: 'cash-points',
          //   type: 'circle',
          //   source: 'transactions',
          //   minzoom: 14,
          //   paint: {
          //     'circle-radius': [
          //       'interpolate',
          //       ['linear'],
          //       ['get', 'cash_amount'],
          //       0, 3,
          //       30, 15
          //     ],
          //     'circle-color': [
          //       'interpolate',
          //       ['linear'],
          //       ['get', 'cash_amount'],
          //       0, 'rgb(0, 128, 0)',       // Green for low values
          //       15, 'rgb(255, 255, 0)',    // Yellow for medium values
          //       30, 'rgb(255, 0, 0)'    
          //     ],
          //     'circle-opacity': 0.6
          //   }
          // });
        }
      })
      .catch(error => {
        console.error("Error fetching GeoJSON:", error);
        setError(`Failed to load data: ${error.message}`);
      });
  }, [mapLoaded]);

  return (
    <div className="map-wrap">
      <div ref={mapContainer} className="map" />
      {error && (
        <div className="error-message" style={{ color: 'red', padding: '10px' }}>
          {error}
        </div>
      )}
    </div>
  );
}