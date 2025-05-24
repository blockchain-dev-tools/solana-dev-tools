'use client';

import { useState, useEffect } from 'react';
import { Connection, VersionedTransaction } from '@solana/web3.js';
import bs58 from 'bs58';

async function getRawTransaction(signature: string): Promise<string> {
  const connection = new Connection('https://solana-rpc.publicnode.com');
  
  // Get transaction
  const transaction = await connection.getTransaction(signature, {
    maxSupportedTransactionVersion: 0
  });
  
  if (!transaction) {
    throw new Error('Transaction not found');
  }
  
  // Get base64 encoded raw transaction
  const rawTransaction = new VersionedTransaction(
    transaction.transaction.message,
    transaction.transaction.signatures.map(sig => bs58.decode(sig))
  ).serialize();
  
  return Buffer.from(rawTransaction).toString('base64');
}

const GetRawTransaction = () => {
  const [signature, setSignature] = useState('');
  const [rawTransactionBase64, setRawTransactionBase64] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Check system preference for dark mode on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(prefersDark);
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signature) return;

    setLoading(true);
    setError(null);
    setRawTransactionBase64('');

    try {
      const base64Tx = await getRawTransaction(signature);
      setRawTransactionBase64(base64Tx);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(rawTransactionBase64);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`max-w-3xl mx-auto p-6 rounded-lg shadow-md transition-colors duration-200 ease-in-out ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          Get Raw Transaction (Base64)
        </h2>
        <button
          onClick={toggleDarkMode}
          className={`p-2 rounded-md ${darkMode ? 'bg-gray-700 text-yellow-300' : 'bg-gray-100 text-gray-700'}`}
          aria-label="Toggle Dark Mode"
        >
          {darkMode ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="mt-4">
        <div className="mb-4">
          <label htmlFor="signature" className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Transaction Signature
          </label>
          <input
            id="signature"
            type="text"
            className={`w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-white border-gray-300 text-gray-700 placeholder-gray-400'
            }`}
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
            placeholder="Enter transaction signature"
          />
        </div>
        
        <button 
          type="submit" 
          className={`px-4 py-2 rounded-md text-white font-medium 
            ${loading || !signature 
              ? 'bg-blue-500/50 cursor-not-allowed' 
              : darkMode 
                ? 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-800' 
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
            }`}
          disabled={loading || !signature}
        >
          {loading ? (
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </div>
          ) : 'Get Raw Transaction'}
        </button>
      </form>

      {error && (
        <div className={`mt-4 p-3 border rounded-md ${darkMode ? 'bg-red-900/30 border-red-800 text-red-300' : 'bg-red-100 border-red-400 text-red-700'}`}>
          {error}
        </div>
      )}

      {rawTransactionBase64 && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Base64 Raw Transaction:
            </h3>
            <button 
              onClick={copyToClipboard}
              className={`flex items-center px-3 py-1 rounded-md text-sm ${
                darkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <div className="relative">
            <textarea
              readOnly
              className={`w-full h-32 p-3 font-mono text-sm border rounded-md focus:outline-none ${
                darkMode 
                  ? 'bg-gray-900 border-gray-700 text-gray-100' 
                  : 'bg-gray-50 border-gray-300 text-gray-800'
              }`}
              value={rawTransactionBase64}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default GetRawTransaction;