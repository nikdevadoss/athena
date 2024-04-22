'use client';

// import React, { useState } from 'react';
import React, { createContext, useState, useEffect, useCallback} from 'react';
import { Button } from '@/components/ui/button';
import { auth } from '@/auth'
import CircularProgress from '@mui/material/CircularProgress';


import { getSession, SessionProvider } from "next-auth/react";

import { stat } from 'node:fs/promises';
import { useInsertionEffect } from 'react';
import { connect } from 'http2';

import Link from 'next/link'


import {
  IconBackArrow
} from '@/components/ui/icons'


interface Configurations {
  [key: string]: string;
}


interface SaveStatuses {
  [key: string]: 'success' | 'error' | 'none';
}

interface ConnectionStatuses {
  [key: string]: 'connected' | 'not-connected';
}


function CheckCircle(props: JSX.IntrinsicElements["svg"]) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#90ee90" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" {...props}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

// https://feathericons.dev/?search=xcircle&iconset=feather&format=strict-tsx
function XCircle(props: JSX.IntrinsicElements["svg"]) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="red" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" {...props}>
      <circle cx="12" cy="12" r="10" />
      <line x1="15" x2="9" y1="9" y2="15" />
      <line x1="9" x2="15" y1="9" y2="15" />
    </svg>
  );
}

// https://feathericons.dev/?search=alert-triangle&iconset=feather&format=strict-tsx
function AlertTriangle(props: JSX.IntrinsicElements["svg"]) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" {...props}>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" x2="12" y1="9" y2="13" />
      <line x1="12" x2="12.01" y1="17" y2="17" />
    </svg>
  );
}

function LoadingSpinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <CircularProgress style={{ color: 'white' }} />
    </div>
  );

}


const useForceUpdate = () => {
  const [, setTick] = useState(0);
  const update = useCallback(() => {
    setTick((tick : any) => tick + 1);
  }, []);
  return update;
};


const initialConfigurations: Configurations= {
  snowflake: '{"account": "hzruuke-zvb34544", "username": "athenadev", "password": "Chinmay123", "database": "ATHENA_TEST", "warehouse": "COMPUTE_WH", "schema": "PUBLIC", "application": "athena"}',
  // supabase: '{ \n "host": "aws-0-us-west-1.pooler.supabase.com", \n "port": "5432", \n "database": "postgres", \n "user": "postgres.ufaxtembwclodjamhthf", \n "password": "DH(9x/?BYyeq6R." \n }',
  redshift: '{ "key1": "", "key2": "", "key3": "" }',
  databricks: '{ "host": "serverHostname", "path": "httpPath", "clientId": "clientId", "clientSecret": "clientSecret" }',
  // postgres: '{ \n "host": "aws-0-us-west-1.pooler.supabase.com", \n "port": "5432", \n "database": "postgres", \n "user": "postgres.ufaxtembwclodjamhthf", \n "password": "DH(9x/?BYyeq6R." \n }'
  postgres: '{ \n "host": "aws-0-us-west-1.pooler.supabase.com", \n "port": "5432", \n "database": "postgres", \n "user": "postgres.gjyxzbbojhjurrqzqwdz", \n "password": "9BPfyD2otz9EjBrH" \n }'

};

const CredentialsPage = () => {
  const [configurations, setConfigurations] = useState(initialConfigurations);
  const [editingDataSource, setEditingDataSource] = useState<string | null>(null);
  const [saveStatuses, setSaveStatuses] = useState<SaveStatuses>({});
  const [connectionStatuses, setConnectionStatuses] = useState<ConnectionStatuses>({});
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);



  // console.log(session)
  const forceUpdate = useForceUpdate();

  // const { data: session } = await getSession(); // Use the useSession hook to access session data
  // const sessionUserId = session?.user?.id;
  // console.log('SESSION USER ID: ' + sessionUserId);


  const handleChange = (dataSource : string, value : string) => {
    setConfigurations((prevConfigurations : any) => ({
      ...prevConfigurations,
      [dataSource]: value,
    }));
  };

  useEffect(() => {
    // Fetch the userId when the component mounts
    const fetchUserId = async () => {
      const session = await getSession();
      setUserId(session?.user?.id ?? null);
      // console.log(session?.user?.id ?? null)
    };
    fetchUserId();
  }, []); 

  useEffect(() => {
    const checkConnectionStatuses = async () => {
      console.log('Checking connection statuses for userId:', userId);
      if (!userId) return; // Early return if userId is null or undefined
  
      try {
        const dataSources = Object.keys(initialConfigurations);
        const newConnectionStatuses : ConnectionStatuses = {};
  
        for (const dataSource of dataSources) {
          try {
            console.log(`${process.env.NEXT_PUBLIC_NODE_SERVER}${dataSource}/connect/status/${userId}`);
            const response = await fetch(`${process.env.NEXT_PUBLIC_NODE_SERVER}${dataSource}/connect/status/${userId}`, {
              method: 'GET',
              headers: { 'Content-Type': 'application/json' },
            });
            if (!response.ok) throw new Error(`Failed to check connection for ${dataSource}`);
            const data = await response.json();
            newConnectionStatuses[dataSource] = data.status === 'CONNECTED' ? 'connected' : 'not-connected';
          } catch (error) {
            console.error(`Error checking connection status for ${dataSource}:`, error);
            newConnectionStatuses[dataSource] = 'not-connected';
          }
        }
  
        // Update the state with the new connection statuses
        setConnectionStatuses(newConnectionStatuses);
        forceUpdate();
      } catch (error) {
        console.error('Error during connection status checks:', error);
      }
    };
    checkConnectionStatuses();
  }, [userId]);



  const handleSave = async (dataSource : string) => {
    console.log(JSON.stringify(connectionStatuses));
    const jsonString = configurations[dataSource];
    var successfulSave = false;
    setIsLoading(true);
    try {
      const config = JSON.parse(jsonString);
      console.log('Valid Configuration:', config);
    

      console.log(userId);

      const requestBody = {
        userId: userId,
        credentials: JSON.parse(jsonString),
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_NODE_SERVER}${dataSource}/connect/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const responseJson = await response.json();
      console.log('Server Response:', responseJson);
      alert('Configuration saved successfully!');
      setIsLoading(false);
      setSaveStatuses((prev : any) => ({ ...prev, [dataSource]: 'success' }));
      successfulSave = true;
    } catch (error) {
      console.error('Error saving configuration:', error);
      alert('Error saving configuration: ' + error);
      setIsLoading(false);
      setSaveStatuses((prev : any) => ({ ...prev, [dataSource]: 'error' }));
    } finally {
      setIsLoading(false);
      setEditingDataSource(null); // Retract the editor after saving
    }
  };

  return (
    <div className="p-4">
      {isLoading && <LoadingSpinner />}
  <div className="flex items-center justify-between mb-4">
    {/* Left: Back to Chatbot Link */}
    <Link legacyBehavior href="/" passHref>
      <a className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-black bg-white hover:bg-gray-100">
        <IconBackArrow />
        <span className="ml-2">Back to Chatbot</span>
      </a>
    </Link>

    {/* Right: Title centered within the remaining space */}
    <div className="flex-grow text-center">
      <h1 className="text-lg font-bold">Data Source Connections</h1>
    </div>

    {/* Spacer div to balance the flexbox */}
    <div style={{ width: '198px', visibility: 'hidden' }}>Spacer</div>
  </div>

  {Object.keys(initialConfigurations).map((dataSource) => (
    <div key={dataSource} className="mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {connectionStatuses[dataSource] === 'connected' || saveStatuses[dataSource] === 'success' ? (
            <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
          ) : saveStatuses[dataSource] === 'error' ? (
            <XCircle className="w-5 h-5 mr-2 text-red-500" />
          ) : (
            null
          )}
          <h2 className="text-md font-semibold">{dataSource.toUpperCase()}</h2>
        </div>
        <Button onClick={() => {
          if (connectionStatuses[dataSource] === 'connected') {
            handleSave(dataSource);
          } else {
            setEditingDataSource(editingDataSource !== dataSource ? dataSource : null);
          }
          }}>
          {editingDataSource === dataSource ? 'Close' : connectionStatuses[dataSource] === 'not-connected' ? 'Connect' : 'Sync'}
        </Button>

      </div>
      {editingDataSource === dataSource && (
        <>
          <textarea
            value={configurations[dataSource]}
            onChange={(e) => handleChange(dataSource, e.target.value)}
            className="w-full h-64 p-2 mt-1 block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          <Button onClick={() => handleSave(dataSource)}>
            {connectionStatuses[dataSource] === 'not-connected' ? 'Connect' : 'Sync'}
          </Button>
        </>
      )}
    </div>
  ))}
</div>

  );
};

export default CredentialsPage;
