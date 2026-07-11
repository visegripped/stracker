'use client';

import { useState, useEffect, useContext } from 'react';
import Link from 'next/link';
import apiPost from '@utilities/apiPost';
import { ProfileContext } from '@context/ProfileContext';
import AppShell from './AppShell';

type AlertRow = { symbol: string; name?: string; type: string; date: string; sector?: string; industry?: string };
type TrackedRow = { symbol: string; name?: string; sector?: string; industry?: string };

const getLast20 = (data: AlertRow[]) => data.slice(0, 20);

const flattenBySymbol = (data: Array<{ symbol: string }>) => data.map((d) => d.symbol);

const haveCommonItems = (tracked: string[], recent: string[]) => {
  const set = new Set(tracked);
  return recent.filter((s) => set.has(s));
};

const getTrackedAlertsByType = (type: string, alerts: AlertRow[], tracked: string[]) =>
  alerts.filter((a) => tracked.includes(a.symbol) && a.type.toLowerCase().includes(type));

function BySector({ items, title }: { items: Array<{ symbol: string; name?: string; type: string; date: string; sector?: string; industry?: string }>; title: string }) {
  const bySector: Record<string, typeof items> = {};
  for (const item of items) {
    const sector = item.sector ?? 'Uncategorized';
    if (!bySector[sector]) bySector[sector] = [];
    bySector[sector].push(item);
  }

  return (
    <div>
      <h2>{title}</h2>
      {Object.entries(bySector).map(([sector, sItems]) => (
        <div key={sector} className="sector-group">
          <h4 className="sector-label">{sector}</h4>
          {sItems.map((data, i) => (
            <div key={`${data.symbol}-${i}`}>
              <Link href={`/symbol/${data.symbol}`}>{data.name ?? data.symbol}</Link>
              {data.type ? `: ${data.type} on ${data.date}` : ''}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function HomeContent() {
  const { profile: userProfile } = useContext(ProfileContext as React.Context<{ profile: { emailAddress?: string } }>);
  const [usersTrackedSymbols, setUsersTrackedSymbols] = useState<TrackedRow[]>([]);
  const [recentSignals, setRecentSignals] = useState<AlertRow[]>([]);
  const [recent20Signals, setRecent20Signals] = useState<AlertRow[]>([]);
  const [recentTrackedBuySignals, setRecentTrackedBuySignals] = useState<AlertRow[]>([]);
  const [recentTrackedSellSignals, setRecentTrackedSellSignals] = useState<AlertRow[]>([]);

  const { emailAddress } = userProfile;

  useEffect(() => {
    if (recentSignals.length === 0) {
      apiPost({ task: 'getAlertHistory', limit: 300 })
        .then((data) => {
          const arr = Array.isArray(data) ? (data as AlertRow[]) : [];
          setRecent20Signals(getLast20(arr));
          setRecentSignals(arr);
        })
        .catch((err) => console.error('Error fetching alert history:', err));
    }
  }, [recentSignals.length]);

  useEffect(() => {
    if (emailAddress) {
      apiPost({ task: 'getTrackedSymbolList', userId: emailAddress })
        .then((data) => setUsersTrackedSymbols(Array.isArray(data) ? (data as TrackedRow[]) : []))
        .catch((err) => { console.error('Error fetching tracked symbols:', err); setUsersTrackedSymbols([]); });
    }
  }, [emailAddress]);

  useEffect(() => {
    if (usersTrackedSymbols.length && recentSignals.length && emailAddress) {
      const trackedBySymbol = flattenBySymbol(usersTrackedSymbols);
      const recentBySymbol = flattenBySymbol(recentSignals);
      const common = haveCommonItems(trackedBySymbol, recentBySymbol);
      setRecentTrackedBuySignals(getTrackedAlertsByType('buy', recentSignals, common));
      setRecentTrackedSellSignals(getTrackedAlertsByType('sell', recentSignals, common));
    }
  }, [usersTrackedSymbols, recentSignals, emailAddress]);

  const bySector = (items: TrackedRow[]) => {
    const grouped: Record<string, typeof items> = {};
    for (const item of items) {
      const sector = item.sector ?? 'Uncategorized';
      if (!grouped[sector]) grouped[sector] = [];
      grouped[sector].push(item);
    }
    return grouped;
  };

  return (
    <section className="grid-container grid-columns">
      <div>
        <h2>Your tracked symbols:</h2>
        {Object.entries(bySector(usersTrackedSymbols)).map(([sector, items]) => (
          <div key={sector} className="sector-group">
            <h4 className="sector-label">{sector}</h4>
            {items.map((data) => (
              <div key={data.symbol}>
                <Link href={`/symbol/${data.symbol}`}>{data.name ?? data.symbol}</Link>
              </div>
            ))}
          </div>
        ))}
      </div>

      <BySector items={recentTrackedBuySignals} title="Your recent buy signals:" />
      <BySector items={recentTrackedSellSignals} title="Your recent sell signals:" />

      <div>
        <h2>Most recent signals:</h2>
        {recent20Signals.map((data, i) => (
          <div key={`${data.symbol}-${i}`}>
            <Link href={`/symbol/${data.symbol}`}>{data.name ?? data.symbol}</Link>
            {data.type ? `: ${data.type} on ${data.date}` : ''}
          </div>
        ))}
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <AppShell>
      <HomeContent />
    </AppShell>
  );
}
