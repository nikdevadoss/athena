'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

interface Configurations {
  [key: string]: string;
}

const initialConfigurations: Configurations= {
  supabase: '{"host": "aws-0-us-west-1.pooler.supabase.com","port": "5432","database": "postgres","user": "postgres.ufaxtembwclodjamhthf","password": "DH(9x/?BYyeq6R."}',
  snowflake: '{"account": "hzruuke-zvb34544", "username": "athenadev", "password": "Chinmay123", "database": "SNOWFLAKE_SAMPLE_DATA", "warehouse": "COMPUTE_WH", "schema": "PUBLIC", "application": "athena"}',
  redshift: '{ "key1": "", "key2": "", "key3": "" }',
  databricks: '{ "host": "serverHostname", "path": "httpPath", "clientId": "clientId", "clientSecret": "clientSecret" }',
  postgres: '{"host": "aws-0-us-west-1.pooler.supabase.com","port": "5432","database": "postgres","user": "postgres.ufaxtembwclodjamhthf","password": "DH(9x/?BYyeq6R."}'

};

const CredentialsPage = () => {
  const [configurations, setConfigurations] = useState(initialConfigurations);
  const [editingDataSource, setEditingDataSource] = useState<string | null>(null);

  const handleChange = (dataSource : string, value : string) => {
    setConfigurations((prevConfigurations) => ({
      ...prevConfigurations,
      [dataSource]: value,
    }));
  };

  const handleSave = async (dataSource : string) => {
    const jsonString = configurations[dataSource];
    try {
      const config = JSON.parse(jsonString);
      console.log('Valid Configuration:', config);
      

      // const response = await fetch(`https://athena-node-server.azurewebsites.net/${dataSource}/connect/`, {
        const response = await fetch(`http://localhost:8080/${dataSource}/connect/`, {
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
