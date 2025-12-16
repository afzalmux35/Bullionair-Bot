'use client';

import { useState, useEffect } from 'react';

export default function DebugImportPage() {
  const [importStatus, setImportStatus] = useState<string>('Checking...');
  const [functionExists, setFunctionExists] = useState<boolean>(false);

  useEffect(() => {
    const checkImport = async () => {
      try {
        console.log('🔍 Checking import of aiPoweredTradingEngine...');
        
        // Try to import dynamically
        const module = await import('@/ai/flows/ai-powered-trading-engine');
        
        if (module && module.aiPoweredTradingEngine) {
          console.log('✅ Import successful! Function exists:', module.aiPoweredTradingEngine);
          setImportStatus('✅ Import successful');
          setFunctionExists(true);
        } else {
          console.log('❌ Function not found in module');
          setImportStatus('❌ Function not exported from module');
        }
      } catch (error: any) {
        console.error('❌ Import failed:', error);
        setImportStatus(`❌ Import error: ${error.message}`);
      }
    };

    checkImport();
  }, []);

  const testFunction = async () => {
    try {
      const module = await import('@/ai/flows/ai-powered-trading-engine');
      const result = await module.aiPoweredTradingEngine({
        riskLimit: 500,
        profitTarget: 1000,
      });
      console.log('✅ Function test successful:', result);
      alert(`✅ Function works!\n\n${result.confirmationMessage}`);
    } catch (error: any) {
      console.error('❌ Function test failed:', error);
      alert(`❌ Error: ${error.message}`);
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>🔍 Import Debug Page</h1>
      
      <div style={{ 
        padding: '1rem', 
        backgroundColor: '#f3f4f6', 
        borderRadius: '8px',
        margin: '1rem 0'
      }}>
        <h3>Import Status:</h3>
        <p style={{ 
          color: importStatus.includes('✅') ? '#10b981' : '#ef4444',
          fontWeight: 'bold'
        }}>
          {importStatus}
        </p>
        <p>Function exists: {functionExists ? '✅ Yes' : '❌ No'}</p>
      </div>

      <button 
        onClick={testFunction}
        style={{
          padding: '10px 20px',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '16px'
        }}
      >
        Test Function Directly
      </button>

      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#e0f2fe', borderRadius: '8px' }}>
        <h3>Expected Path:</h3>
        <code style={{ 
          display: 'block', 
          padding: '1rem', 
          backgroundColor: '#1e293b', 
          color: 'white',
          borderRadius: '4px',
          marginTop: '0.5rem'
        }}>
          @/ai/flows/ai-powered-trading-engine
          <br />
          ↓
          <br />
          src/ai/flows/ai-powered-trading-engine.ts
        </code>
        
        <h3 style={{ marginTop: '1rem' }}>What to check:</h3>
        <ol>
          <li>File exists at correct path</li>
          <li>Function is exported with `export async function aiPoweredTradingEngine`</li>
          <li>No syntax errors in the file</li>
          <li>Server action is properly configured (uses 'use server')</li>
        </ol>
      </div>
    </div>
  );
}
