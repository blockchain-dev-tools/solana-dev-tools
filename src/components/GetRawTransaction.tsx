'use client';

import { useState } from 'react';
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
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Get Raw Transaction (Base64)
      </h2>
      
      <form onSubmit={handleSubmit} className="mt-4">
        <div className="mb-4">
          <label htmlFor="signature" className="block text-sm font-medium text-gray-700 mb-1">
            Transaction Signature
          </label>
          <input
            id="signature"
            type="text"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
            placeholder="Enter transaction signature"
          />
        </div>
        
        <button 
          type="submit" 
          className={`px-4 py-2 rounded-md text-white font-medium 
            ${loading || !signature 
              ? 'bg-blue-300 cursor-not-allowed' 
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
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {rawTransactionBase64 && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-medium text-gray-800">
              Base64 Raw Transaction:
            </h3>
            <button 
              onClick={copyToClipboard}
              className="flex items-center px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md text-sm"
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
              className="w-full h-32 p-3 font-mono text-sm bg-gray-50 border border-gray-300 rounded-md focus:outline-none"
              value={rawTransactionBase64}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default GetRawTransaction;