'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2, Database, LayoutDashboard, Sparkles } from 'lucide-react';
import { Keypair, Networks, Server, TransactionBuilder } from '@stellar/stellar-sdk';

const TOTAL_BASIS_POINTS = 10000;

type ContributorRow = {
  id: string;
  address: string;
  weight: number;
};

type WalletStatus = 'disconnected' | 'connected' | 'connecting';

const initialContributors: ContributorRow[] = [
  { id: 'row-1', address: '', weight: 2500 },
  { id: 'row-2', address: '', weight: 2500 },
  { id: 'row-3', address: '', weight: 2500 },
  { id: 'row-4', address: '', weight: 2500 },
];

const statCards = [
  {
    label: 'Total Funds Routed (USDC)',
    value: '$96,420.18',
    icon: <Database className="h-5 w-5 text-sky-400" />,
  },
  {
    label: 'Active Contributor Splits',
    value: '4',
    icon: <LayoutDashboard className="h-5 w-5 text-indigo-400" />,
  },
  {
    label: 'Contract Balance',
    value: '24,300 USDC',
    icon: <Sparkles className="h-5 w-5 text-emerald-400" />,
  },
];

export default function DashboardPage() {
  const [walletStatus, setWalletStatus] = useState<WalletStatus>('disconnected');
  const [contributors, setContributors] = useState<ContributorRow[]>(initialContributors);
  const [transactionMessage, setTransactionMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalBasisPoints = useMemo(
    () => contributors.reduce((sum, contributor) => sum + contributor.weight, 0),
    [contributors],
  );

  const isTotalValid = totalBasisPoints === TOTAL_BASIS_POINTS;
  const totalErrorMessage = useMemo(() => {
    if (isTotalValid) return '';
    if (totalBasisPoints > TOTAL_BASIS_POINTS) {
      return 'Total exceeds 100.00% — reduce contributor weights.';
    }
    return 'Total is below 100.00% — add or increase weights to balance the split.';
  }, [isTotalValid, totalBasisPoints]);

  const activeContributors = useMemo(
    () => contributors.filter((row) => row.address.trim().length > 0).length,
    [contributors],
  );

  useEffect(() => {
    if (walletStatus === 'connecting') {
      const timer = window.setTimeout(() => setWalletStatus('connected'), 1000);
      return () => window.clearTimeout(timer);
    }

    return undefined;
  }, [walletStatus]);

  const handleConnectWallet = () => {
    if (walletStatus === 'connected') {
      setWalletStatus('disconnected');
      setTransactionMessage('Freighter wallet disconnected.');
      return;
    }

    setWalletStatus('connecting');
    setTransactionMessage('Attempting to connect to Freighter...');
  };

  const addContributor = () => {
    setContributors((current) => [
      ...current,
      {
        id: `row-${Date.now()}`,
        address: '',
        weight: 0,
      },
    ]);
  };

  const updateContributor = (id: string, field: 'address' | 'weight', value: string) => {
    setContributors((rows) =>
      rows.map((row) =>
        row.id === id
          ? {
              ...row,
              [field]: field === 'weight' ? Number(value) : value,
            }
          : row,
      ),
    );
  };

  const removeContributor = (id: string) => {
    setContributors((rows) => rows.filter((row) => row.id !== id));
  };

  const handleSubmit = async () => {
    setTransactionMessage('Assembling split matrix envelope...');
    setIsSubmitting(true);

    try {
      const sourceKeypair = Keypair.random();
      const server = new Server('https://horizon-testnet.stellar.org');
      const account = await server.loadAccount(sourceKeypair.publicKey());

      const transaction = new TransactionBuilder(account, {
        fee: '100',
        networkPassphrase: Networks.TESTNET,
      })
        .addMemo({ type: 'text', text: 'Soroban Split Update' })
        .setTimeout(180)
        .build();

      transaction.sign(sourceKeypair);
      setTransactionMessage('Mock transaction signed successfully. Ready to submit to ledger.');
    } catch (error) {
      setTransactionMessage('Failed to simulate ledger envelope creation. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-10 rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-glow backdrop-blur-sm">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="mb-2 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-sky-300">
                <Sparkles className="h-4 w-4" />
                SorobanSplit
              </p>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-100 sm:text-4xl">
                Open-source Split Dashboard
              </h1>
              <p className="max-w-2xl text-slate-400 sm:text-base">
                Build, preview, and dispatch your Stellar Soroban contributor routing matrix with precise basis point controls.
              </p>
            </div>

            <button
              type="button"
              onClick={handleConnectWallet}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-800 bg-slate-800/90 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-slate-700 hover:bg-slate-700/90"
            >
              {walletStatus === 'connected' ? 'Disconnect Wallet' : walletStatus === 'connecting' ? 'Connecting…' : 'Connect Wallet'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </header>

        <section className="mb-10 grid gap-4 lg:grid-cols-3">
          {statCards.map((stat) => (
            <article key={stat.label} className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-glow">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-400">
                    {stat.label}
                  </p>
                  <p className="mt-4 text-3xl font-semibold text-slate-100">{stat.value}</p>
                </div>
                <div className="rounded-2xl bg-slate-800 p-3 text-slate-100 shadow-inner">{stat.icon}</div>
              </div>
            </article>
          ))}
        </section>

        <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-glow">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Contributor Weights Matrix</p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-100">Address mapping and basis point split builder</h2>
            </div>
            <button
              type="button"
              onClick={addContributor}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-700"
            >
              + Add Contributor
            </button>
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/50">
            <div className="grid grid-cols-[1fr_160px_96px] gap-4 border-b border-slate-800 px-6 py-4 text-sm font-semibold text-slate-400 sm:grid-cols-[1fr_200px_120px]">
              <span>Stellar Wallet Address</span>
              <span>Basis Points</span>
              <span>Action</span>
            </div>

            <div className="divide-y divide-slate-800">
              {contributors.map((contributor) => (
                <div key={contributor.id} className="grid grid-cols-[1fr_160px_96px] gap-4 px-6 py-4 sm:grid-cols-[1fr_200px_120px]">
                  <input
                    type="text"
                    value={contributor.address}
                    onChange={(event) => updateContributor(contributor.id, 'address', event.target.value)}
                    placeholder="G..."
                    className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20"
                  />
                  <input
                    type="number"
                    min={0}
                    max={TOTAL_BASIS_POINTS}
                    value={contributor.weight}
                    onChange={(event) => updateContributor(contributor.id, 'weight', event.target.value)}
                    className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => removeContributor(contributor.id)}
                    className="inline-flex h-11 w-full items-center justify-center rounded-2xl border border-transparent bg-rose-500/10 px-3 text-sm font-semibold text-rose-300 transition hover:border-rose-400 hover:bg-rose-500/15"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-3xl border border-slate-800 bg-slate-950/70 p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">Total Basis Points</p>
                <p className="mt-2 text-3xl font-semibold text-slate-100">{totalBasisPoints.toLocaleString()}</p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold">
                {isTotalValid ? (
                  <span className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500/10 px-3 py-2 text-emerald-300">
                    <CheckCircle2 className="h-4 w-4" /> Balanced at 100.00%
                  </span>
                ) : (
                  <span className="rounded-2xl bg-amber-500/10 px-3 py-2 text-amber-300">
                    {totalErrorMessage}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
            <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Split Preview</p>
              <div className="mt-6 grid gap-4">
                {contributors.map((row) => (
                  <div key={`preview-${row.id}`} className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4 text-sm text-slate-200">
                    <p className="truncate font-medium text-slate-100">{row.address || 'Empty address'}</p>
                    <p className="mt-1 text-slate-400">{row.weight.toLocaleString()} bps</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Action Panel</p>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                Deploy or update the contributor split matrix to the Soroban contract once the basis points are validated at 100%.
              </p>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!isTotalValid || walletStatus !== 'connected' || isSubmitting}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-3xl bg-sky-500 px-5 py-4 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-700"
              >
                {isSubmitting ? 'Submitting…' : 'Deploy/Update Split Matrix'}
              </button>
              <p className="mt-4 rounded-3xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm text-slate-300">
                {walletStatus === 'connected'
                  ? 'Wallet ready. Simulated ledger transaction is built with the official Stellar SDK.'
                  : 'Connect Freighter to enable transaction assembly.'}
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-3xl border border-slate-800 bg-slate-900/80 p-5 text-sm text-slate-300">
            <p className="font-semibold text-slate-100">Transaction Log</p>
            <p className="mt-3 whitespace-pre-line break-words text-slate-300">{transactionMessage || 'No submission activity yet.'}</p>
          </div>
        </section>
      </div>
    </main>
  );
}
