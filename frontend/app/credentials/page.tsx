'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

const initialConfigurations = {
  supabase: '{"host": "aws-0-us-west-1.pooler.supabase.com","port": "5432","database": "postgres","user": "postgres.ufaxtembwclodjamhthf","password": "DH(9x/?BYyeq6R."}',
  snowflake: '{}',
  redshift: '{ "key1": "", "key2": "", "key3": "" }',
  databricks: '{ "key1": "", "key2": "", "key3": "" }',
};

const CredentialsPage = () => {
  const [configurations, setConfigurations] = useState(initialConfigurations);
  const [editingDataSource, setEditingDataSource] = useState(null);

  const handleChange = (dataSource, value) => {
    setConfigurations((prevConfigurations) => ({
      ...prevConfigurations,
      [dataSource]: value,
    }));
  };

  const handleSave = async (dataSource) => {
    const jsonString = configurations[dataSource];
    try {
      const config = JSON.parse(jsonString);
      console.log('Valid Configuration:', config);
      
      const response = await fetch(`http://localhost:8080/${dataSource}/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        body: jsonString,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const responseJson = await response.json();
      console.log('Server Response:', responseJson);
      alert('Configuration saved successfully!');
      
      setEditingDataSource(null); // Retract the editor after saving
    } catch (error) {
      console.error('Error saving configuration:', error);
      alert('Failed to save configuration. Please ensure your JSON is correctly formatted and the server is reachable.');
    }
  };

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-lg font-bold">External Data Source Configurations</h1>
      {Object.keys(initialConfigurations).map((dataSource) => (
        <div key={dataSource} className="mb-4">
          <div className="flex justify-between items-center">
            <h2 className="text-md font-semibold">{dataSource.toUpperCase()}</h2>
            <Button onClick={() => setEditingDataSource(editingDataSource !== dataSource ? dataSource : null)}>
              {editingDataSource === dataSource ? 'Close' : 'Edit'}
            </Button>
          </div>
          {editingDataSource === dataSource && (
            <>
              <textarea
                value={configurations[dataSource]}
                onChange={(e) => handleChange(dataSource, e.target.value)}
                className="w-full h-64 p-2 mt-1 block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              <Button onClick={() => handleSave(dataSource)}>Save</Button>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default CredentialsPage;
