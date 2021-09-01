import express from 'express';
import cors from 'cors';
import googleRouter from './web/google/router';
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded());

app.use('/google', googleRouter);

app.get('/', (req, res, err) => {
  res.send('hello world');
});

const PORT = 5001;

app.listen(PORT, () => {
  console.log(`server is listening on ${PORT}...`);
});
