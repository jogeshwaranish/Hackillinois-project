// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'

import React from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";

// Components
import Header from "./components/Header";

// Pages
import Dashboard from "./pages/Dashboard";
import Heatmap from "./pages/Heatmap";
import SuggestedRoute from "./pages/SuggestedRoute";
import Geolocator from "./components/Geolocator";


function App() {
  //const [count, setCount] = useState(0)

  return (
    
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/heatmap" element={<Heatmap />} />
        <Route path="/suggested-route" element={<SuggestedRoute />} />
        
      </Routes>
      <Geolocator></Geolocator>
    </>
    
    // <>
    //   <MaplibreHeatmap /> 
    //   <Geolocator />
    // </>

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
