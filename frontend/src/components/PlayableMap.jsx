import React, { useRef, useEffect, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const PlayableMap = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [currentTimestamp, setCurrentTimestamp] = useState(0);
  const [timeChunks, setTimeChunks] = useState([]);
  const [startDate, setStartDate] = useState("01-01");
  const [endDate, setEndDate] = useState("");
  const [heatmapData, setHeatmapData] = useState({});
  const geojsonBaseUrl = "/data/daily_heatmap"; // Update this to your API or file source

  // Convert heatmap grid data to GeoJSON
  const convertToGeoJSON = (gridData) => ({
    type: "FeatureCollection",
    features: gridData.map((point) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [point.lng, point.lat], // MapLibre uses [lng, lat]
      },
      properties: {
        weight: point.weight,
      },
    })),
  });

  // Initialize Map
  useEffect(() => {
    if (map.current) return;
    
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://demotiles.maplibre.org/style.json", // Open-source MapLibre style
      center: [-130.0, 40.5],
      zoom: 4.6,
    });

    map.current.on("load", () => {
      map.current.addSource("heatmap-source", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] }, // Empty data initially
      });

      map.current.addLayer({
        id: "heatmap-layer",
        type: "heatmap",
        source: "heatmap-source",
        paint: {
          "heatmap-weight": ["get", "weight"],
          "heatmap-intensity": 1,
          "heatmap-radius": 30,
          "heatmap-opacity": 0.8,
          "heatmap-color": [
            "interpolate",
            ["linear"],
            ["heatmap-density"],
            0, "rgba(33,102,172,0)",
            0.2, "rgb(103,169,207)",
            0.4, "rgb(209,229,240)",
            0.6, "rgb(253,219,199)",
            0.8, "rgb(239,138,98)",
            1, "rgb(178,24,43)"
          ],
        },
      });
    });
  }, []);

  // Animate heatmap over time
  useEffect(() => {
    if (!map.current || timeChunks.length === 0) return;

    const interval = setInterval(() => {
      setCurrentTimestamp((prev) => (prev + 1) % timeChunks.length);
    }, 100); // Adjust animation speed

    return () => clearInterval(interval);
  }, [timeChunks]);

  // Update heatmap data when the timestamp changes
  useEffect(() => {
    if (map.current && timeChunks.length > 0) {
      const source = map.current.getSource("heatmap-source");
      if (source) {
        const newGeoJSON = convertToGeoJSON(heatmapData[timeChunks[currentTimestamp]] || []);
        source.setData(newGeoJSON);
      }
    }
  }, [currentTimestamp, timeChunks, heatmapData]);

  // Generate time chunks based on user input
  const generateTimeChunks = async () => {
    if (!startDate) {
      alert("Please provide a valid start date.");
      return;
    }

    const start = new Date(`2024-${startDate}`);
    const chunks = [];

    if (endDate) {
      const end = new Date(`2024-${endDate}`);
      while (start <= end) {
        chunks.push(start.toISOString().split("T")[0]);
        start.setDate(start.getDate() + 1);
      }
    } else {
      chunks.push(start.toISOString().split("T")[0]); // Single date
    }

    setTimeChunks(chunks);
    setCurrentTimestamp(0);

    // Fetch heatmap data for selected dates
    const fetchedData = {};
    for (let date of chunks) {
      try {
        const response = await fetch(`${geojsonBaseUrl}/${date}.json`);
        const data = await response.json();
        fetchedData[date] = data;
      } catch (error) {
        console.error(`Error loading heatmap data for ${date}:`, error);
        fetchedData[date] = [];
      }
    }
    setHeatmapData(fetchedData);
  };

  return (
    <div>
      {/* UI Controls */}
      <div
        style={{
          padding: "10px",
          background: "#222",
          color: "#fff",
          position: "absolute",
          zIndex: 5,
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <input
          type="text"
          placeholder="MM-DD"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          maxLength={5}
          style={{
            background: "transparent",
            border: "1px solid #555",
            color: "#fff",
            borderRadius: "4px",
            padding: "5px 10px",
            width: "80px",
            textAlign: "center",
            fontSize: "14px",
          }}
        />
        <input
          type="text"
          placeholder="MM-DD (optional)"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          maxLength={5}
          style={{
            background: "transparent",
            border: "1px solid #555",
            color: "#fff",
            borderRadius: "4px",
            padding: "5px 10px",
            width: "100px",
            textAlign: "center",
            fontSize: "14px",
          }}
        />
        <button
          onClick={generateTimeChunks}
          style={{
            background: "#444",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            padding: "5px 10px",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          Load Data
        </button>
      </div>

      {/* Display Current Date */}
      {timeChunks.length > 0 && (
        <div
          style={{
            position: "absolute",
            bottom: "20px",
            right: "0px",
            background: "rgba(0, 0, 0, 0.5)",
            color: "#fff",
            padding: "5px 10px",
            borderRadius: "4px",
            fontSize: "14px",
            zIndex: 2,
          }}
        >
          {timeChunks[currentTimestamp]}
        </div>
      )}

      {/* Map Container */}
      <div ref={mapContainer} style={{ width: "100vw", height: "100vh" }} />
    </div>
  );
};

export default Heatmap;
