import React, { useState, useEffect } from 'react';

const Dashboard = () => {
  const [summary, setSummary] = useState("Loading AI summary...");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Add a small timeout to ensure Flask has time to process
    const fetchSummary = async () => {
      try {
        const response = await fetch("/gpt4");
        
        // Log the raw response for debugging
        console.log("Response status:", response.status);
        
        // Check if the response is successful
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.details || `Server responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Data received:", data);
        
        if (data.summary) {
          setSummary(data.summary);
        } else if (data.error) {
          throw new Error(data.error);
        } else {
          setSummary("No summary data was returned from the server.");
        }
      } catch (error) {
        console.error("Error fetching summary:", error);
        setError(error.message);
        setSummary("Failed to load summary.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummary();
  }, []);

  return (
    <div className="dashboard-container" style={{ 
      padding: '20px', 
      height: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <h1>Dashboard</h1>
      
      {isLoading && (
        <div style={{ margin: '20px 0', color: '#666' }}>
          <p>Loading AI summary data...</p>
        </div>
      )}
      
      {error && (
        <div style={{ 
          margin: '20px 0',
          padding: '15px',
          backgroundColor: '#ffeeee',
          border: '1px solid #ffaaaa',
          borderRadius: '5px',
          color: '#cc0000'
        }}>
          <h3>Error Loading Summary:</h3>
          <p>{error}</p>
          <p>Check your console and server logs for more details.</p>
        </div>
      )}
      
      {!isLoading && !error && (
        <div style={{ 
          margin: '20px 0',
          padding: '15px',
          backgroundColor: '#f5f5f5',
          border: '1px solid #ddd',
          borderRadius: '5px'
        }}>
          <h3>AI Summary:</h3>
          <div>{summary}</div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;