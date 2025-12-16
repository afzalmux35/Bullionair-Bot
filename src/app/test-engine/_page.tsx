'use client';

import { useState } from 'react';

export default function TestEnginePage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testEngine = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      console.log('🧪 Testing AI Engine...');
      
      // Import dynamically to catch import errors
      const { aiPoweredTradingEngine } = await import('@/ai/flows/ai-powered-trading-engine');
      
      const testInput = {
        riskLimit: 500,
        profitTarget: 1000,
      };
      
      console.log('📤 Sending input:', testInput);
      const response = await aiPoweredTradingEngine(testInput);
      console.log('✅ Response received:', response);
      
      setResult(response);
    } catch (err: any) {
      console.error('❌ Test failed:', err);
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ color: '#10b981' }}>🧪 AI Engine Test</h1>
      <p>Testing the function that the Auto-Trade button calls</p>
      
      <button 
        onClick={testEngine}
        disabled={loading}
        style={{ 
          padding: '12px 24px',
          backgroundColor: loading ? '#94a3b8' : '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: loading ? 'not-allowed' : 'pointer',
          width: '100%',
          margin: '1rem 0'
        }}
      >
        {loading ? '🔄 Testing...' : '🚀 Test AI Engine'}
      </button>
      
      {error && (
        <div style={{ 
          padding: '1rem',
          backgroundColor: '#fee2e2',
          border: '2px solid #ef4444',
          borderRadius: '8px',
          margin: '1rem 0'
        }}>
          <h3 style={{ color: '#ef4444', margin: 0 }}>❌ Error</h3>
          <pre style={{ whiteSpace: 'pre-wrap', marginTop: '0.5rem' }}>
            {error}
          </pre>
        </div>
      )}
      
      {result && (
        <div style={{ 
          padding: '1rem',
          backgroundColor: '#d1fae5',
          border: '2px solid #10b981',
          borderRadius: '8px',
          margin: '1rem 0',
          whiteSpace: 'pre-wrap'
        }}>
          <h3 style={{ color: '#10b981', margin: 0 }}>✅ Success!</h3>
          <div style={{ 
            backgroundColor: 'white', 
            padding: '1rem', 
            borderRadius: '4px',
            marginTop: '0.5rem',
            fontFamily: 'monospace'
          }}>
            {result.confirmationMessage}
          </div>
        </div>
      )}
      
      <div style={{ 
        marginTop: '2rem', 
        padding: '1rem', 
        backgroundColor: '#f8fafc', 
        borderRadius: '8px',
        fontSize: '14px'
      }}>
        <h3>What we're testing:</h3>
        <ul>
          <li>✅ Can we import the function?</li>
          <li>✅ Does it accept the input format?</li>
          <li>✅ Does it return a confirmation message?</li>
          <li>✅ Does it work without errors?</li>
        </ul>
        <p style={{ marginTop: '1rem', fontWeight: 'bold' }}>
          If this test works, the Auto-Trade button should work too!
        </p>
      </div>
    </div>
  );
}
