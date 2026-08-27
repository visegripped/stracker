'use client';

import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from '@context/AuthContext';
import { ProfileProvider } from '@context/ProfileContext';
import { NotificationsProvider } from '@context/NotificationsContext';
import { ThemeProvider } from '@context/ThemeContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '';
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <ThemeProvider>
        <NotificationsProvider>
          <AuthProvider>
            <ProfileProvider>{children}</ProfileProvider>
          </AuthProvider>
        </NotificationsProvider>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}
