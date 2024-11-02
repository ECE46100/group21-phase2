import React, { useState } from 'react';
import PageLayout from './pageLayout';

const UpdatePage: React.FC = () => {
  const [packageName, setPackageName] = useState(''); // Pre-filled for existing data
  const [currentVersion, setCurrentVersion] = useState('1.0.0'); // Example current version
  const [newVersion, setNewVersion] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Update Data:', {
      packageName,
      currentVersion,
      newVersion,
      description,
      file,
    });
    // Add logic to handle the package update
  };

  return (
    <PageLayout title="Update a Package">
      <form onSubmit={handleSubmit} style={{ maxWidth: '500px', margin: '0 auto' }}>
        <div style={{ marginBottom: '15px' }}>
          <label>
            Package Name (Pre-filled):
            <input
              type="text"
              value={packageName}
              onChange={(e) => setPackageName(e.target.value)}
              disabled
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </label>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>
            Current Version (Pre-filled):
            <input
              type="text"
              value={currentVersion}
              onChange={(e) => setCurrentVersion(e.target.value)}
              disabled
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </label>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>
            New Version:
            <input
              type="text"
              value={newVersion}
              onChange={(e) => setNewVersion(e.target.value)}
              required
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </label>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>
            Description of Changes:
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              required
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </label>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>
            Upload New Version File:
            <input
              type="file"
              onChange={handleFileChange}
              required
              style={{ display: 'block', marginTop: '5px' }}
            />
          </label>
        </div>

        <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#28a745', color: '#fff', border: 'none', cursor: 'pointer' }}>
          Update Package
        </button>
      </form>
    </PageLayout>
  );
};

export default UpdatePage;
