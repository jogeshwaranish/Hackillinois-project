import React, { useRef, useEffect } from 'react';
import * as maptilersdk from '@maptiler/sdk';
import "@maptiler/sdk/dist/maptiler-sdk.css";
import configData from "../config";
import './Map.css';

export default function Map() {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const geodata = configData.MAPTILER_DATASET_ID;
    const center = { lng: -157.858093 , lat: 21.31560 }; 
    const zoom = 14;
    maptilersdk.config.apiKey = configData.MAPTILER_API_KEY;

    useEffect(() => {
        if (map.current) return; // stops map from intializing more than once
      
        map.current = new maptilersdk.Map({
          container: mapContainer.current,
          style: maptilersdk.MapStyle.DATAVIZ.LIGHT,
          center: [center.lng, center.lat],
          zoom: zoom,
          hash: true,
        });

        map.current.on("load", () => {
          maptilersdk.helpers.addHeatmap(map.current, {
            data: geodata,
            property: "minimum_nights",
            weight: [
              { propertyValue: 1, value: 1 },
              { propertyValue: 30, value: 0 },
            ],
            radius: [
              { propertyValue: 1, value: 100 },
              { propertyValue: 30, value: 0 },
            ]
          });
        })
      }, [center.lng, center.lat, zoom]);


      return (
        <div className="map-wrap">
          <div ref={mapContainer} className="map" />
        </div>
      );
  }