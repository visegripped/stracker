export function getGoogleOAuthClientId(): string {
  return (
    process.env.GOOGLE_OAUTH_CLIENT_ID?.trim() ||
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() ||
    ''
  );
}

type GoogleTokenInfo = {
  aud?: string;
  azp?: string;
  audience?: string;
  issued_to?: string;
  error?: string;
  error_description?: string;
  expires_in?: string | number;
};

function tokenAudienceMatchesClient(
  tokenInfo: GoogleTokenInfo,
  clientId: string
): boolean {
  const candidates = [
    tokenInfo.aud,
    tokenInfo.azp,
    tokenInfo.audience,
    tokenInfo.issued_to,
  ]
    .filter(Boolean)
    .map((v) => String(v).trim());

  return candidates.includes(clientId);
}

export async function isValidGoogleAccessToken(token: string): Promise<boolean> {
  const googleClientId = getGoogleOAuthClientId();
  if (!token) {
    console.error('Google token validation failed: missing access token');
    return false;
  }
  if (!googleClientId) {
    console.error(
      'Google token validation failed: set GOOGLE_OAUTH_CLIENT_ID (or NEXT_PUBLIC_GOOGLE_CLIENT_ID) in server env'
    );
    return false;
  }

  try {
    const response = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?access_token=${encodeURIComponent(token)}`
    );
    if (!response.ok) {
      console.error('Google token validation failed: tokeninfo HTTP', response.status);
      return false;
    }

    const result = (await response.json()) as GoogleTokenInfo;
    if (result.error || result.error_description) {
      console.error(
        'Google token validation failed:',
        result.error_description || result.error
      );
      return false;
    }

    const matches = tokenAudienceMatchesClient(result, googleClientId);
    if (!matches) {
      console.error('Google token validation failed: client ID mismatch');
    }
    return matches;
  } catch (error) {
    console.error('Google token validation failed: tokeninfo request error', error);
    return false;
  }
}
