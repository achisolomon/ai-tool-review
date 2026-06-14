// OAuth provider redirects (Google/GitHub via Supabase) only work on port 8080,
// because the Supabase project registers localhost:8080 as the allowed redirect URL.
// Tests that initiate a real provider redirect must skip on any other port.
const PORT = process.env.PORT || '8080';

const isOAuthPort = PORT === '8080';

// Use inside a test: test.skip(!oauthPortAvailable(), 'OAuth redirect requires port 8080');
function oauthPortAvailable() {
  return isOAuthPort;
}

module.exports = { oauthPortAvailable, OAUTH_PORT: '8080' };
