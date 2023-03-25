// Contains routes used internally by Pinocchio

import { Router } from "express";
import DynamoDb from '@cyclic.sh/dynamodb';
import { v4 as uuidv4 } from "uuid";
import { authenticateUser, superUser, generateAccessToken} from './auth.js';
import fillDataBaseWithPines from './../fill-db.js';

// Initialize Express router
export const router = Router();

// Initialize AWS DynamoDB
const db = DynamoDb(process.env.CYCLIC_DB);
const pinesCollection = db.collection("pines");
const statsCollection = db.collection("stats");

export async function setStat(req, res, stand) {
	try {
		var stat = (await statsCollection.get(req.params.id));
		console.log(stat)
		var val = Number.parseInt(stat.props.count) + Number.parseInt(req.params.i);
		
		statsCollection.set(req.params.id, {count:Number.parseInt(val)});
		
		if(stand) {
			res.sendStatus(200);
		} 
	} catch (e) {
		await statsCollection.set(req.params.id, {count: 1} )
			
		console.error(`PUT '/stats' `, e.message);
		res.sendStatus(404);
	}
}

// Get all pines
router.get("/all", authenticateUser, async (req, res) => {
  const { results: pinesMetadata } = await pinesCollection.list();
  
// console.log(pinesMetadata)
	try {
  const pines = await Promise.all(
    pinesMetadata.map(async ({ key }) => (await pinesCollection.get(key)).props)
  );

  res.send(pines);
	} catch (e) {
		console.log('GET /all ', e.message);
		res.sendStatus(500);
	}
});

// Get statistics
router.get('/stats', authenticateUser, async (req, res) => {
	try {
		let users = (await statsCollection.get('users')).props.count;
		let posts = (await statsCollection.get('posts')).props.count;
		let reviews = (await statsCollection.get('comments')).props.count;
		
		let stats = {users, posts, reviews}
		res.send(stats);
	} catch (e) {
		console.error(`GET '/stats' `, e.message);
		res.sendStatus(404);
	}
})

// Update specific stats 
router.put('/stats/:id/:i', authenticateUser, async (req, res)=>{setStat(req, res, )})


// Get pine by id
router.get('/:pid', authenticateUser, async (req, res) => {
	const pineId = req.params.pid;
	
	try {
		const pine = (await pinesCollection.get(pineId)).props;
		
		res.send(pine);
	} catch (e) {
		console.error(`GET '/${pineId}' `, e.message);
		res.sendStatus(404);
	}
})

// Generate a UUID for uploading pines
router.post('/new-id', superUser, async (req, res) => {
	const id = uuidv4();
	
	res.send({id});
})

// Super User specific routes 

// Fill database
router.post('/su/fill', superUser, async (req, res) => {
	fillDataBaseWithPines(res, req.body.password);
})

// Clear a database
router.post('/su/clean', superUser, async (req, res) => {
	try {
		var params = { 
		  TableName : req.body.db
		};

	db.delete(params, function(err, data) {
		if (err) {
    		console.log("Unable to delete table. Error JSON:", JSON.stringify(err, null, 2));
    	} else {
    		console.log("Deleted table. Table description JSON:", JSON.stringify(data, null, 2));
    	}
	}); 
	} catch (e) {
		console.log(`POST /su/clean/${req.body.db} `, e.message);
		res.sendStatus(500)
	}
})
// Create new bearer token
router.post("/su/new", superUser, (req, res) => {
	const username = req.body.username;
    
	try {
		const token = generateAccessToken({username});
		res.send({ token }); 
	} catch (e) {
		console.log('Error generating token.');
		res.sendStatus(500);
	}
});
