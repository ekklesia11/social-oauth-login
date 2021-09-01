import express from 'express';
import cors from 'cors';
import { OAuth2Client } from 'google-auth-library';
import authConfig from './google-auth.json';
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded());

const getAuthenticatedClient = () => {
  const authenticatedClient = new OAuth2Client(
    authConfig.web.client_id,
    authConfig.web.client_secret,
    authConfig.web.redirect_uris[0]
  );

  return authenticatedClient;
};

const getAuthorizeUrl = () => {
  const client = getAuthenticatedClient();
  const authorizeUrl = client.generateAuthUrl({
    access_type: 'offline',
    scope: ['email', 'profile'],
  });

  return authorizeUrl;
};

const getTokenInfo = async (code) => {
  const client = getAuthenticatedClient();
  const authInfo = await client.getToken(code);
  return authInfo.tokens;
}

app.get('/login', (req, res, err) => {
  const googleLoginUrl = getAuthorizeUrl();
  res.redirect(googleLoginUrl);
});

app.get('/auth/google/callback', async (req, res, err) => {
  const code = req.query.code;
  const tokenInfo = await getTokenInfo(code);
  console.log(tokenInfo);
  res.redirect('http://localhost:5001');
});

app.get('/', (req, res, err) => {
  res.send('login completed');
});

const PORT = 5001;

app.listen(PORT, () => {
  console.log(`server is listening on ${PORT}...`);
});
