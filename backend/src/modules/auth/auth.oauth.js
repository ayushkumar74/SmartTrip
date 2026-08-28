import { OAuth2Client } from 'google-auth-library';
import { env } from '../../config/env.js';

let client = null;

if (env.GOOGLE_CLIENT_ID) {
  client = new OAuth2Client(env.GOOGLE_CLIENT_ID);
}

export const verifyGoogleToken = async (idToken) => {
  if (!client) {
    throw new Error('Google OAuth is not configured on this server');
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: env.GOOGLE_CLIENT_ID,
    });
    
    // Returns payload containing email, name, sub (Google ID), etc.
    return ticket.getPayload();
  } catch (error) {
    console.error('Google token verification failed:', error.message);
    throw new Error('Invalid Google ID token');
  }
};
