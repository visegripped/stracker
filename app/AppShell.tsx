'use client';

import { useContext } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AuthContext } from '@context/AuthContext';
import AuthButton from '@components/AuthButton';
import Notification from '@components/Notification';
import { NotificationsContext } from '@context/NotificationsContext';
import { ErrorBoundary } from 'react-error-boundary';
import ThemeToggle from '@components/ThemeToggle/ThemeToggle';

function fallbackRender({ error }: { error: Error }) {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre style={{ color: 'red' }}>{error.message}</pre>
    </div>
  );
}

const Notifications = () => {
  const { notifications } = useContext(NotificationsContext as React.Context<{ notifications: Record<string, { message: string; type: string }> }>);
  return (
    <section className="notifications-container">
      {Object.entries(notifications).map(([uuid, { message, type }]) => (
        <Notification uuid={uuid} key={uuid} message={message} type={type} />
      ))}
    </section>
  );
};

const NAV = [
  { href: '/symbol', label: 'Symbol' },
  { href: '/macd', label: 'MACD' },
  { href: '/alerts', label: 'Alert History' },
];

function navIsActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { accessToken } = useContext(AuthContext as React.Context<{ accessToken: string }>);
  const currentYear = new Date().getFullYear();
  const version = process.env.NEXT_PUBLIC_APP_VERSION ?? '';
  const pathname = usePathname() ?? '';

  return (
    <>
      <header>
        <h1 className="logo">
          <Link href="/">
            <span className="logo-mark" aria-hidden="true">
              <svg viewBox="0 0 16 16">
                <polyline
                  points="1,12 5,8 8,10 15,3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            Stracker
          </Link>
        </h1>
        <nav className="navbar">
          <ul className="nav-list">
            {NAV.map(({ href, label }) => (
              <li key={href} className={`nav-item${navIsActive(pathname, href) ? ' is-active' : ''}`}>
                <Link href={href}>{label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="auth">
          <AuthButton />
        </div>
      </header>

      <main>
        <ErrorBoundary fallbackRender={fallbackRender}>
          <Notifications />
          {accessToken ? (
            children
          ) : (
            <div className="unauthenticated">
              <h2>You are not logged in.</h2>
              <h3>Please use the sign in button in the upper right corner.</h3>
            </div>
          )}
        </ErrorBoundary>
      </main>

      <footer>
        <div>&copy; Copyright 2018 - {currentYear}. All rights reserved.</div>
        <ThemeToggle />
        {version && <div className="version">v{version}</div>}
      </footer>
    </>
  );
}
