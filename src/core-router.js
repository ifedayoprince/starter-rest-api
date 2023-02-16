// Contains routes used internally by Pinocchio

import { Router } from "express";
import DynamoDb from '@cyclic.sh/dynamodb';
import { v4 as uuidv4 } from "uuid";
import { authenticateUser } from './auth.js';

// Initialize Express router
export const router = Router();

// Initialize AWS DynamoDB
const db = DynamoDb(process.env.CYCLIC_DB);
const pinesCollection = db.collection("pines");

// Get all pines
router.get("/all", async (req, res) => {
  const { pinesMetadata } = await pinesCollection.list();

  const pines = await Promise.all(
    pinesMetadata.map(async ({ key }) => (await pinesCollection.get(key)).props)
  );

  res.send(pines);
});

// Get pine by id
router.get('/:pid', async (req, res) => {
	const pineId = req.params.pid;
	
	try {
		const { url } = (await pinesCollection.get(pineId)).props;
		
		res.send({url});
	} catch (e) {
		console.error(`GET '/${pineId}' `, e.message);
		res.sendStatus(404);
	}
})

// Generate a UUID for uploading pines
router.post('/new-id', authenticateUser, async (req, res) => {
	const id = uuidv4();
	
	res.send({id});
})