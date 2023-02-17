import express from 'express';
// import db from '@cyclic.sh/dynamodb';
import { router as coreRouter } from './core-router.js';
import { router as pineRouter } from './pine-router.js';
import { generateAccessToken } from "./auth.js";
import fillDataBaseWithPines from './../fill-db.js';

const app = express();

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/core', coreRouter);
app.use('/pine', pineRouter);

// Fill database
app.post('/fill-db', authenticateUser, async (req, res) => {
	fillDataBaseWithPines();
})

// Create new bearer token
app.post("/super-user", (req, res) => {
	const username = req.body.username;
    const password = req.body.password;
	
	try {
		if(password != process.env.SUPER_USER && password) throw new Error();
		
		const token = generateAccessToken({username});
		res.send({ token }); 
	} catch (e) {
		console.log('Super User access not granted');
		res.sendStatus(401);
	}
});

// Catch all handler for all other request.
app.use('*', (req, res) => {
  res.json({ msg: 'no route handler found' }).end()
})

// Start the server
const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`src/index.js listening on ${port}`)
})
