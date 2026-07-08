import express from 'express';
import path from 'node:path';
import router from './routes/apiRoute';

const app = express();

//middlewares
app.use(express.json());
app.use(express.static(path.join(__dirname,'../','public')));

//routes
app.use('/api/v1',router)

export default app;