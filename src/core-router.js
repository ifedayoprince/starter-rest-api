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
