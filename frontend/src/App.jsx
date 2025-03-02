import React from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";

// Components
import Navbar from "./components/navbar.jsx";
import Map from './components/map.jsx';
import Geolocator from "./components/Geolocator";

// Pages
import Dashboard from "./pages/Dashboard";
import SuggestedRoute from "./pages/SuggestedRoute";


function App() {
  return (
    <>
      <Navbar />
      <Map />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/map" element={<Map />} />
        <Route path="/suggested-route" element={<SuggestedRoute />} />
      </Routes>
      <Geolocator></Geolocator>
    </>  
  )
}

export default App
