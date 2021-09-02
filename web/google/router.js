import { Router } from 'express';
import { OAuth2Client } from 'google-auth-library';
import authConfig from '../../google-auth.json';

const router = Router();

const client = new OAuth2Client(
  authConfig.web.client_id,
  authConfig.web.client_secret,
  authConfig.web.redirect_uris[0]
);

const getAuthorizeUrl = (client) => {
  const authorizeUrl = client.generateAuthUrl({
    access_type: 'offline',
    scope: ['email', 'profile'],
  });

  return authorizeUrl;
};

const getTokenInfo = async (client, code) => {
  const authInfo = await client.getToken(code);
  return authInfo.tokens;
}

const verifyIdToken = async (client, token) => {
  const res = await client.verifyIdToken({
    idToken: token,
    audience: authConfig.web.client_id,
  });

  const payload = res.getPayload();
  console.log(payload)

  return payload;
}

const getBearerToken = (auth) => {
  if (typeof auth !== 'string') return null;
  const splitAuth = auth.split(' ');
  if (splitAuth[0] !== 'Bearer') return null;
  return splitAuth[1];
}

const redirectToGoogleLogin = (client, res) => {
  const googleLoginUrl = getAuthorizeUrl(client);
  res.redirect(googleLoginUrl);
}

router.get('/login', async (req, res, err) => {
  const { authorization } = req.headers;
  const token = getBearerToken(authorization);

  try {
    if (token) {
      const ticketPayload = await verifyIdToken(client, token);
      // TODO: check user details with verified info in the database
      res.send(ticketPayload);
    } else {
      throw 'NO TOKEN';
    }
  } catch (e) {
    console.error(e);
    redirectToGoogleLogin(client, res);
  }

  {/**
    EASY WAY TO VERIFY ID_TOKEN
    endpoint: https://oauth2.googleapis.com/tokeninfo?id_token=${ID_TOKEN}
    response:
      success: same as payload above
      fail: {
        "error": "invalid_token",
        "error_description": "Invalid Value"
      }

    *** NOT RECOMMENDED FOR PRODUCTION ***

    referenced: https://developers.google.com/identity/sign-in/web/backend-auth
  */}
});

router.get('/auth/callback', async (req, res, err) => {
  const code = req.query.code;

  try {
    const tokenInfo = await getTokenInfo(client, code);

    client.setCredentials(tokenInfo);
    const { credentials } = client;
    // TODO: save user info into database

    if (!credentials) throw 'token is not valid!!'
    res.redirect('http://localhost:5001');
  } catch (e) {
    console.error(e);
    redirectToGoogleLogin(client, res);
  }
});

router.get('/', (req, res, err) => {
  res.send('Google login completed');
});

export default router;