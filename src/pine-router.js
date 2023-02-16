// Contains routes used internally by Pinocchio

import { Router } from "express";
import DynamoDb from '@cyclic.sh/dynamodb';
import { v4 as uuidv4 } from "uuid";
import { authenticateUser } from './auth.js';
import axios from 'axios';

// Initialize Express router
export const router = Router();

// Initialize AWS DynamoDB
const db = DynamoDb(process.env.CYCLIC_DB);
const pinesCollection = db.collection("pines");
const notesCollection = db.collection("notes");
const protocolsCollection = db.collection('protocols');

// Links an ID to the url of a hosted pine
router.post('/:id', authenticateUser, async (req, res) => {
	const id = req.params.id;
	var pineObject = {
		url: req.body.pineUrl
	} 
	
	try {
		const pineConfig = (await axios({
			method: "get", 
			url: `${pineObject.url}/pine-config.json`, 
			responseType: "json"
		})).data;
		
		if(!pineConfig.name) throw new Error();
		
		pineObject = {...pineConfig};
		
		await bikesCollection.set(id, pineObject);
		
		res.send(pineObject);
	} catch (e) {
		console.log(`POST /${id} `, e.message);
		res.sendStatus(404);
	}
});

// Get the input form details 
router.get('/:id/form', authenticateUser, async (req, res) => {
	const id = req.params.id;
	
	try {
		const { url } = (await pinesCollection.get(id)).props;
		
		const pineInput = (await axios({
			method: "get", 
			url: `${url}/pine-input.json`, 
			responseType: "json"
		})).data;
		
		res.send(pineInput);
	} catch (e) {
		console.log(`GET /pines/${id}/form `, e.message);
		res.sendStatus(401);
	}
})

// Store the Pino Protocol on the server and return an id
router.post('/protocol', authenticateUser, async (req, res) => {
//	const pineId = req.body.pineId;
	const proto = req.body.protocol;
	try {
		//let pineUrl = (await axios(`/core/${pineId}`)).data;
		
		let protoObject = {
			protocol: proto, 
			created: Date.now(),
			id: uuidv4()
		}
		
		await protocolsCollection.set(protoObject.id, protoObject);
		
		res.send({protoObject.id});
	} catch (e) {
		console.log(`POST /protocol `, e.message);
		res.sendStatus(401);
	}
})

// Retrieve a url of the protocol stored on the server
router.get('/protocol/:id', authenticateUser, async (req, res) => {
	let id = req.params.id;
	
	try {
		let url = (await protocolsCollection.get(id)).props;
		
		res.send(url);
	} catch (e) {
		console.log(`GET /protocol `, e.message);
		res.sendStatus(401);
	}
})

// Retrieve text stored on the server 
router.get('/notes/:id', authenticateUser, async (req, res) => {
	const id = req.params.id;
	
	try {
		let note = (await notesCollection.get(id)).props; 
		
		res.send(note);
	} catch (e) {
		console.log(`GET /notes/${id} `, e.message);
		res.sendStatus(401);
	}
})

// Store a note on the server
router.post('/notes', authenticateUser, async (req, res) => {
	var body = req.body;
	
	try {
		if (!body.content) throw new Error();
		
		const id = uuidv4();
		body.id = id;
		
		await notesCollection.set(id, body);
		
		res.send(id);
	} catch (e) {
		console.log(`POST /notes `, e.message);
		res.sendStatus(401);
	}
})
