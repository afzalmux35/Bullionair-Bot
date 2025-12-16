'use client';

import { useState } from 'react';

export default function BridgeTestPage() {
  const [bridgeStatus, setBridgeStatus] = useState<any>(null);
  const [tradeResult, setTradeResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState<'BUY' | 'SELL'>('BUY');
  const [volume, setVolume] = useState(0.01);

  const testConnection = async () => {
    setLoading(true);
    setBridgeStatus(null);
    
    try {
      const response = await fetch('/api/test-bridge');
      const data = await response.json();
      setBridgeStatus(data);
    } catch (error: any) {
      setBridgeStatus({
        status: 'error',
        message: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const testTrade = async () => {
    setLoading(true);
    setTradeResult(null);
    
    try {
      const signal = {
        symbol: 'XAUUSDm',
        action: action,
        volume: volume
      };
      
      const response = await fetch('/api/send-trade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signal),
      });
      
      const data = await response.json();
      setTradeResult(data);
      
    } catch (error: any) {
      setTradeResult({
        status: 'error',
        message: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ color: '#10b981' }}>🔗 MT5 Bridge Integration Test</h1>
      <p>Testing connection to bridge via ngrok</p>
      
      <div style={{ 
        margin: '2rem 0', 
        padding: '1rem', 
        backgroundColor: '#f0f9ff',
        borderRadius: '8px',
        border: '2px solid #0ea5e9'
      }}>
        <h3>💰 Current Account Status</h3>
        <p><strong>Balance:</strong> $11,118.94</p>
        <p><strong>Equity:</strong> $11,111.31</p>
        <p><strong>Account:</strong> 261813562</p>
        <p><strong>Bridge URL:</strong> https://poignant-tiddly-wilbert.ngrok-free.dev</p>
      </div>
      
      <div style={{ margin: '2rem 0' }}>
        <button
          onClick={testConnection}
          disabled={loading}
          style={{
            padding: '12px 24px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            marginRight: '1rem'
          }}
        >
          {loading ? 'Testing...' : 'Test Bridge Connection'}
        </button>
        
        <div style={{ marginTop: '1.5rem' }}>
          <h4>Trade Parameters:</h4>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ marginRight: '1rem' }}>
              <input
                type="radio"
                checked={action === 'BUY'}
                onChange={() => setAction('BUY')}
                style={{ marginRight: '0.5rem' }}
              />
              BUY
            </label>
            <label>
              <input
                type="radio"
                checked={action === 'SELL'}
                onChange={() => setAction('SELL')}
                style={{ marginRight: '0.5rem' }}
              />
              SELL
            </label>
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label>Volume (lots): </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              max="1"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              style={{ 
                marginLeft: '0.5rem',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc'
              }}
            />
          </div>
          
          <button
            onClick={testTrade}
            disabled={loading}
            style={{
              padding: '12px 24px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            {loading ? 'Executing...' : `Execute ${action} Trade (${volume} lots)`}
          </button>
        </div>
      </div>
      
      {bridgeStatus && (
        <div style={{
          padding: '1rem',
          backgroundColor: bridgeStatus.status === 'success' ? '#d1fae5' : '#fee2e2',
          border: `2px solid ${bridgeStatus.status === 'success' ? '#10b981' : '#ef4444'}`,
          borderRadius: '8px',
          marginBottom: '1rem'
        }}>
          <h3>🔗 Bridge Status: {bridgeStatus.status === 'success' ? '✅ Connected' : '❌ Failed'}</h3>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '14px' }}>
            {JSON.stringify(bridgeStatus, null, 2)}
          </pre>
        </div>
      )}
      
      {tradeResult && (
        <div style={{
          padding: '1rem',
          backgroundColor: tradeResult.status === 'success' ? '#d1fae5' : '#fee2e2',
          border: `2px solid ${tradeResult.status === 'success' ? '#10b981' : '#ef4444'}`,
          borderRadius: '8px'
        }}>
          <h3>⚡ Trade Result: {tradeResult.status === 'success' ? '✅ Executed' : '❌ Failed'}</h3>
          {tradeResult.status === 'success' && tradeResult.data && (
            <div style={{ margin: '1rem 0' }}>
              <p><strong>Ticket:</strong> {tradeResult.data.ticket}</p>
              <p><strong>Price:</strong> ${tradeResult.data.price}</p>
              <p><strong>Symbol:</strong> {tradeResult.data.symbol}</p>
              <p><strong>Action:</strong> {tradeResult.data.action}</p>
              <p><strong>Volume:</strong> {tradeResult.data.volume} lots</p>
            </div>
          )}
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '14px' }}>
            {JSON.stringify(tradeResult, null, 2)}
          </pre>
        </div>
      )}
      
      <div style={{ 
        marginTop: '2rem', 
        padding: '1rem', 
        backgroundColor: '#f3f4f6', 
        borderRadius: '8px',
        fontSize: '14px'
      }}>
        <h3>🎯 Testing via API Routes</h3>
        <p>This page uses API routes to avoid React Server Component errors.</p>
        <p><strong>Bridge URL:</strong> https://poignant-tiddly-wilbert.ngrok-free.dev</p>
      </div>
    </div>
  );
}
