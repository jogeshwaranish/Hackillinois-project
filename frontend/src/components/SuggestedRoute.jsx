import React, { useRef, useEffect } from 'react';
import * as maptilersdk from '@maptiler/sdk';
import "@maptiler/sdk/dist/maptiler-sdk.css";
import configData from "../config";
import './Map.css';

export default function SuggestedRoute() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const geodata = configData.MAPTILER_DATASET_ID2;
  const center = { lng: -110.75954, lat: 43.72874};
  const zoom = 14;
  maptilersdk.config.apiKey = configData.MAPTILER_API_KEY;

  useEffect(() => {
    if (map.current) return;
    
    map.current = new maptilersdk.Map({
      container: mapContainer.current,
      style: maptilersdk.MapStyle.STREETS,
      center: [center.lng, center.lat],
      zoom: zoom,
      hash: true,
    });

    map.current.on('load', async function () {
        await maptilersdk.helpers.addPolyline(map.current, {
            data: geodata,
            outline: true,
            lineColor: "purple",
            lineWidth: 6,
            outlineColor: "#D3DBEC", 
            outlineWidth: 10,
        });
    });
  }, [center.lng, center.lat, zoom]);

  return (
    <div className="map-wrap">
      <div ref={mapContainer} className="map" />
    </div>
  );
}





