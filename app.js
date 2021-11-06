import express from 'express';
import router from './routes.js';
import cors from 'cors';

const app = express();
const port = 4000;

app.use(express.json());
app.use(cors());
app.use('/', router);

app.listen(port, () => {});
app.use((err, req, res, next) => {
    res.status(err.status || 500)
    .json({
        status: 'error',
        message: err.message
    });
});