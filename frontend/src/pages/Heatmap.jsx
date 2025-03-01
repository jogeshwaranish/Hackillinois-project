import React from 'react'

const Heatmap = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  return (
    <div className="heatmap">
      {/* Left Panel: Date Selectors & Legend */}
      <div className="heatmap-controls">
        <div className="date-selectors">
          <label>Start Date:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <label>End Date:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        {/* Heatmap Legend */}
        <div className="heatmap-legend">
          <h3>Legend</h3>
          <div className="legend-item">
            <span className="legend-color" style={{ background: "#00FF00" }}></span> Low
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ background: "#FFFF00" }}></span> Medium
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ background: "#FF0000" }}></span> High
          </div>
        </div>
      </div>

      {/* Right Panel: Video & Map */}
      <div className="video">
        {/* Video will go here */}
      </div>
    </div>
  )
}

export default Heatmap
