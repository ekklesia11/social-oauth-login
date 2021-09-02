import express from 'express';
import cors from 'cors';
import { PORT } from './constant/urls';
import googleRouter from './web/google/router';
import githubRouter from './web/github/router';
import kakaoRouter from './web/kakao/router';
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded());

app.use('/google', googleRouter);
app.use('/github', githubRouter);
app.use('/kakao', kakaoRouter);

app.get('/', (req, res, err) => {
  res.send('hello world');
});

app.listen(PORT, () => {
  console.log(`server is listening on ${PORT}...`);
});
