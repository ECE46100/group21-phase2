import React, { useState } from 'react';
import PageLayout from './pageLayout';

const DownloadPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [packages, setPackages] = useState([
    { name: 'Package 1', version: '1.0.0', size: '500KB' },
    { name: 'Package 2', version: '2.3.1', size: '1.2MB' },
    { name: 'Package 3', version: '1.2.5', size: '750KB' },
  ]); // Simulated package list

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Searching for:', searchTerm);
    // Add logic to fetch package list based on search term
  };

  return (
    <PageLayout title="Download a Package">
      <form onSubmit={handleSearch} style={{ maxWidth: '500px', margin: '0 auto' }}>
        <div style={{ marginBottom: '15px' }}>
          <label>
            Search for Package:
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              required
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </label>
        </div>

        <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#007bff', color: '#fff', border: 'none', cursor: 'pointer' }}>
          Search
        </button>
      </form>

      <div style={{ marginTop: '30px' }}>
        <h3>Available Packages:</h3>
        {packages.length > 0 ? (
          <ul style={{ listStyleType: 'none', padding: '0' }}>
            {packages.map((pkg, index) => (
              <li key={index} style={{ marginBottom: '15px', padding: '10px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
                <strong>{pkg.name}</strong> (v{pkg.version}) - {pkg.size}
                <button style={{ marginLeft: '15px', padding: '5px 10px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  Download
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No packages found. Try a different search term.</p>
        )}
      </div>
    </PageLayout>
  );
};

export default DownloadPage;
