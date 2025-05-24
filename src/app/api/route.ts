import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { Connection, PublicKey, VersionedTransaction } from '@solana/web3.js';
import bs58 from 'bs58';


async function getRawTransaction(signature : string): Promise<string> {
  const connection = new Connection('https://api.mainnet-beta.solana.com');
  
  // 获取交易
  const transaction = await connection.getTransaction(signature, {
    maxSupportedTransactionVersion: 0
  });
  console.log(transaction);
  if (!transaction) {
    throw new Error('Transaction not found');
  }
  // 获取 base64 编码的原始交易
  const rawTransaction = new VersionedTransaction(transaction.transaction.message, transaction.transaction.signatures.map(sig => bs58.decode(sig) )).serialize();
  return Buffer.from(rawTransaction).toString('base64'); // 这是 base64 编码的原始交易
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const signature = searchParams.get('signature');
  if (!signature) {
    return NextResponse.json({ error: 'Signature is required' }, { status: 400 });
  }

  try {
    const rawTransaction = await getRawTransaction(signature);
    return NextResponse.json({ rawTransaction });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}