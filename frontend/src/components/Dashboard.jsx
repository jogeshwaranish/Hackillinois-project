import React from 'react';

const Dashboard = () => {
  return (
    <div className="dashboard-container" style={{
      padding: '20px',
      height: 'calc(100vh - 70px)',
      overflow: 'auto'
    }}>
      <h1>Dashboard</h1>
      <p>Welcome to the dashboard. Select a map from the navigation bar above.</p>
    </div>
  );
};

export default Dashboard;