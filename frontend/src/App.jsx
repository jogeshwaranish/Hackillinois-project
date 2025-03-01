// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'

import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

// Components
import Header from "./components/Header";
import Geolocator from "./components/Geolocator";
import MaplibreHeatmap from "./components/MaplibreHeatMap";

// Pages
import DashboardPage from "./pages/Dashboard";
import HeatmapPage from "./pages/Heatmap";
import RoutePage from "./pages/Route";


function App() {
  const [count, setCount] = useState(0)

  return (
    // <>
    //   <MaplibreHeatmap />
    //   <Geolocator />
    // </>
    <>
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/heatmap" element={<HeatmapPage />} />
          <Route path="/route" element={<RoutePage />} />
        </Routes>
      </Router>
    </>
    
    // <>
    //   <div>
    //     <a href="https://vite.dev" target="_blank">
    //       <img src={viteLogo} className="logo" alt="Vite logo" />
    //     </a>
    //     <a href="https://react.dev" target="_blank">
    //       <img src={reactLogo} className="logo react" alt="React logo" />
    //     </a>
    //   </div>
    //   <h1>Vite + React</h1>
    //   <div className="card">
    //     <button onClick={() => setCount((count) => count + 1)}>
    //       count is {count}
    //     </button>
    //     <p>
    //       Edit <code>src/App.jsx</code> and save to test HMR
    //     </p>
    //   </div>
    //   <p className="read-the-docs">
    //     Click on the Vite and React logos to learn more
    //   </p>
    // </>
  )
}

export default App
