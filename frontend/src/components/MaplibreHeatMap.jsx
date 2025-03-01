import React, { useRef, useEffect } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const MaplibreHeatmap = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  
  // Static map properties
  const lng = -88.228880;
  const lat = 40.110277;
  const zoom = 15;

  useEffect(() => {
    if (map.current) return; // Prevent initializing multiple maps

    // Initialize MapLibre map
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://raw.githubusercontent.com/go2garret/maps/main/src/assets/json/openStreetMap.json',
      center: [lng, lat],
      zoom: zoom
    });

    map.current.on('load', () => {
      console.log("Map loaded successfully");

      // Sample heatmap data points
      const heatmapData = {
        'type': 'FeatureCollection',
        'features': [
          { 'type': 'Feature', 'properties': { 'intensity': 0.9 }, 'geometry': { 'type': 'Point', 'coordinates': [-0.09, 51.505] } },
          { 'type': 'Feature', 'properties': { 'intensity': 0.7 }, 'geometry': { 'type': 'Point', 'coordinates': [-0.1, 51.51] } },
          { 'type': 'Feature', 'properties': { 'intensity': 0.8 }, 'geometry': { 'type': 'Point', 'coordinates': [-74.006, 40.7128] } },
          { 'type': 'Feature', 'properties': { 'intensity': 0.6 }, 'geometry': { 'type': 'Point', 'coordinates': [-74.01, 40.71] } },
          { 'type': 'Feature', 'properties': { 'intensity': 0.7 }, 'geometry': { 'type': 'Point', 'coordinates': [-118.243, 34.052] } },
          { 'type': 'Feature', 'properties': { 'intensity': 0.9 }, 'geometry': { 'type': 'Point', 'coordinates': [-118.24, 34.06] } },
          { 'type': 'Feature', 'properties': { 'intensity': 0.6 }, 'geometry': { 'type': 'Point', 'coordinates': [2.3522, 48.8566] } },
          { 'type': 'Feature', 'properties': { 'intensity': 0.8 }, 'geometry': { 'type': 'Point', 'coordinates': [2.35, 48.86] } }
        ]
      };

      // Add data source
      map.current.addSource('heatmap-data', {
        'type': 'geojson',
        'data': heatmapData
      });

      // Add heatmap layer
      map.current.addLayer({
        'id': 'heatmap-layer',
        'type': 'heatmap',
        'source': 'heatmap-data',
        'paint': {
          'heatmap-weight': ['interpolate', ['linear'], ['get', 'intensity'], 0, 0, 1, 1],
          'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 9, 3],
          'heatmap-color': [
            'interpolate', ['linear'], ['heatmap-density'],
            0, 'rgba(33,102,172,0)',
            0.2, 'rgb(103,169,207)',
            0.4, 'rgb(209,229,240)',
            0.6, 'rgb(253,219,199)',
            0.8, 'rgb(239,138,98)',
            1, 'rgb(178,24,43)'
          ],
          'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 2, 9, 20],
          'heatmap-opacity': ['interpolate', ['linear'], ['zoom'], 7, 1, 9, 0.5]
        }
      });

      // Add point layer
      map.current.addLayer({
        'id': 'point-layer',
        'type': 'circle',
        'source': 'heatmap-data',
        'paint': {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 7, 4, 16, 10],
          'circle-color': ['interpolate', ['linear'], ['get', 'intensity'], 0, '#3288bd', 0.5, '#fee08b', 1, '#d53e4f'],
          'circle-opacity': ['interpolate', ['linear'], ['zoom'], 7, 0, 8, 0.5],
          'circle-stroke-width': 1,
          'circle-stroke-color': 'white'
        }
      });
    });

    // Clean up on unmount
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default MaplibreHeatmap;
