// import db from '@cyclic.sh/dynamodb';
// import { router as core-router } from './core-router.js';
// import { router as pine-router } from './pine-router.js';
import { generateAccessToken } from "./auth.js";

const app = express();

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
// app.use('/core', core-router);
//app.use('/pine', pine-router);

// Create new bearer token
app.post("/super-user", (req, res) => {
	const username = req.body.username;
    const password = req.body.password;
	console.log(password, username, req.body);
	try {
		if(password != process.env.SUPER_USER) throw new Error();
		
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
