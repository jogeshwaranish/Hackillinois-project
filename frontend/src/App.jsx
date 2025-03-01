import React from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";

// Components
import Navbar from "./components/navbar.jsx";
import Map from './components/map.jsx';
import Geolocator from "./components/Geolocator";

// Pages
import Dashboard from "./pages/Dashboard";
import Heatmap from "./pages/Heatmap";
import SuggestedRoute from "./pages/SuggestedRoute";


function App() {
  return (
    <>
      <Navbar />
      <button>adghjkjhghjkhghjkldsfgfdfghgfdfghgfdfghjhgfdfghjhgfdfghjhgfdsdfghjjhvbjk</button>
      <Map />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/heatmap" element={<Heatmap />} />
        <Route path="/suggested-route" element={<SuggestedRoute />} />
      </Routes>
      <Geolocator></Geolocator>
    </>  
  )
}

export default App
