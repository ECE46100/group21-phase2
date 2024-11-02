import React, { useState } from 'react';
import PageLayout from './pageLayout';

const RatingPage: React.FC = () => {
  const [packageName, setPackageName] = useState('');
  const [ratingData, setRatingData] = useState({
    overall: 4,
    dependencyPinning: 0.8,
    codeReviewMetric: 0.75,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Searching for:', packageName);
    // Add logic to fetch rating details for the entered package name
  };

  return (
    <PageLayout title="Package Rating Overview">
      <form onSubmit={handleSearch} style={{ maxWidth: '500px', margin: '0 auto' }}>
        <div style={{ marginBottom: '15px' }}>
          <label>
            Search for Package:
            <input
              type="text"
              value={packageName}
              onChange={(e) => setPackageName(e.target.value)}
              required
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </label>
        </div>

        <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#007bff', color: '#fff', border: 'none', cursor: 'pointer' }}>
          Search
        </button>
      </form>

      {packageName && (
        <div style={{ marginTop: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
          <h3>Rating for: {packageName}</h3>
          <p><strong>Overall Rating:</strong> {ratingData.overall} / 5</p>
          <p><strong>Dependency Pinning:</strong> {ratingData.dependencyPinning.toFixed(2)}</p>
          <p><strong>Code Review Metric:</strong> {ratingData.codeReviewMetric.toFixed(2)}</p>
        </div>
      )}
    </PageLayout>
  );
};

export default RatingPage;
