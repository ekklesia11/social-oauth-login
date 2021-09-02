import { Router } from 'express';
import { LOCAL } from '../../constant/urls';
import axios from 'axios';
import authConfig from '../../kakao-auth.json';

const router = Router();

const getAuthorizeUrl = () => {
  const authorizeUrl = authConfig.web.auth_uri + '?';

  const params = {
    responseType: 'response_type=code',
    clientId: `client_id=${authConfig.web.client_id}`,
    redirectUri: `redirect_uri=${authConfig.web.redirect_uri}`,
  };
  
  return authorizeUrl + Object.values(params).join('&');
};

const getAccessToken = async (code) => {
  const url = authConfig.web.token_uri;
  
  const body = {
    grant_type: 'authorization_code',
    client_id: authConfig.web.client_id,
    client_secret: authConfig.web.client_secret,
    redirect_uri: authConfig.web.redirect_uri,
    code
  };

  const { data } = await axios.post(url, body, {
    headers: {
      Accept: 'application/json'
    }
  });
  return data;
}

const getUserInfo = async (token) => {
  const url = 'https://kapi.kakao.com/v2/user/me';
  const { data } = await axios.get(url + '?property_keys=kakao_account.email', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  return data;
}

const getBearerToken = (auth) => {
  if (typeof auth !== 'string') return null;
  const splitAuth = auth.split(' ');
  if (splitAuth[0] !== 'Bearer') return null;
  return splitAuth[1];
}

const redirectToKakaoLogin = (res) => {
  const kakaoLoginUrl = getAuthorizeUrl();
  res.redirect(kakaoLoginUrl);
}

router.get('/login', async (req, res, err) => {
  const { authorization } = req.headers;
  const token = getBearerToken(authorization);

  console.log(token);
  try {
    if (token) {
      const userInfo = await getUserInfo(token);
      console.log('user info:: ', userInfo);
      // TODO: check user info with database
      // const data = {
      //   idCode: userInfo.id,
      //   name: userInfo.name,
      //   id: userInfo.login,
      // };

      // res.send(data);
    } else {
      throw 'NO TOKEN'
    }
  } catch (e) {
    console.log(e);
    redirectToKakaoLogin(res);
  }
});

router.get('/auth/callback', async (req, res, err) => {
  const code = req.query.code;

  if (code) {
    try {
      const tokenInfo = await getAccessToken(code);
      console.log('token info:: ', tokenInfo)
      // const userInfo = await getUserInfo(tokenInfo.access_token);
      // TODO: save user info into database
  
      // res.redirect(LOCAL);
    } catch (e) {
      console.error(e);
    }
  } else {
    res.send('no code');
  }
});

router.get('/', (req, res, err) => {
  res.send('Github login completed');
});

export default router;