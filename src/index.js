import express from 'express';
import { router as coreRouter } from './core-router.js';
import { pRouter as pineRouter } from './pine-router.js';
import { fRouter as fileRouter } from './modules/files.js'; 
import cors from 'cors';
import helmet from 'helmet';


const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.disable('X-Powered-By');
// app.options('*', cors());

app.use('/pine', pineRouter);
app.use('/core', coreRouter);
app.use('/file', fileRouter);

// Catch all handler for all other request.
app.use('*', (req, res) => {
  res.json({ msg: 'no route handler found' }).end()
})

// Start the server
const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`src/index.js listening on ${port}`)
})


