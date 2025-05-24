import type { Metadata } from "next";
import GetRawTransaction from "@/components/GetRawTransaction";

export const metadata: Metadata = {
  title: "Solana Raw Transaction Decoder",
  description: "Decode Solana Raw Signed Transactions",
};


export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20"
      style={{ fontFamily: 'Monaco, "Bitstream Vera Sans Mono", "Lucida Console", Terminal, "Courier New", monospace' }}>
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <GetRawTransaction />
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">

      </footer>
    </div>
  );
}

