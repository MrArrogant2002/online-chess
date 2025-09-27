/**
 * Connection Test Component
 * Use this to debug Vercel-Render integration
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export const ConnectionTester: React.FC = () => {
  const [backendHealth, setBackendHealth] = useState<string>('Testing...');
  const [backendUrl, setBackendUrl] = useState<string>('');
  const [wsConnected, setWsConnected] = useState<boolean>(false);

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
    setBackendUrl(url);
  }, []);

  const testBackendHealth = async () => {
    try {
      setBackendHealth('Testing...');
      const response = await fetch(`${backendUrl}/health`);
      const data = await response.json();
      setBackendHealth(`✅ Backend is healthy: ${data.service} (${data.timestamp})`);
    } catch (error: any) {
      setBackendHealth(`❌ Backend connection failed: ${error.message}`);
    }
  };

  const testWebSocketConnection = () => {
    try {
      const { io } = require('socket.io-client');
      const socket = io(backendUrl);
      
      socket.on('connect', () => {
        setWsConnected(true);
        socket.disconnect();
      });

      socket.on('connect_error', (error: any) => {
        setWsConnected(false);
        console.error('WebSocket connection failed:', error);
      });

      // Timeout after 10 seconds
      setTimeout(() => {
        if (!socket.connected) {
          setWsConnected(false);
          socket.disconnect();
        }
      }, 10000);
    } catch (error) {
      setWsConnected(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <Card>
        <h2 className="text-xl font-bold text-white mb-4">🔧 Connection Tester</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-white mb-2">Environment Configuration</h3>
            <div className="bg-slate-800 p-3 rounded text-sm font-mono">
              <div>Backend URL: <span className="text-purple-400">{backendUrl}</span></div>
              <div>Environment: <span className="text-purple-400">{process.env.NODE_ENV}</span></div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-2">Backend Health Check</h3>
            <div className="flex items-center gap-3">
              <Button onClick={testBackendHealth} size="sm">
                Test Backend
              </Button>
              <span className="text-sm text-slate-300">{backendHealth}</span>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-2">WebSocket Connection</h3>
            <div className="flex items-center gap-3">
              <Button onClick={testWebSocketConnection} size="sm">
                Test WebSocket
              </Button>
              <span className={`text-sm ${wsConnected ? 'text-green-400' : 'text-red-400'}`}>
                {wsConnected ? '✅ WebSocket Connected' : '❌ WebSocket Failed'}
              </span>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold text-white mb-2">🔍 Debugging Steps</h3>
        <div className="space-y-2 text-sm text-slate-300">
          <div>1. Check if Backend URL is correct in Vercel environment variables</div>
          <div>2. Verify your Render service is running (not sleeping)</div>
          <div>3. Check CORS configuration allows your Vercel domain</div>
          <div>4. Ensure both services use HTTPS</div>
        </div>
      </Card>
    </div>
  );
};