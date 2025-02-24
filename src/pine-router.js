// Contains routes used internally by Pinocchio

import { Router } from "express";
import DynamoDb from '@cyclic.sh/dynamodb';
import { v4 as uuidv4 } from "uuid";
import { authenticateUser, superUser} from './auth.js';
import axios from 'axios';
import short from 'short-uuid';
import {setStat} from './core-router.js';

// Initialize Express router
export const pRouter = Router();

// Initialize AWS DynamoDB
const db = DynamoDb(process.env.CYCLIC_DB);
const pinesCollection = db.collection("pines");
const notesCollection = db.collection("notes");
const protocolsCollection = db.collection('protocols');

const sUid = short();

async function updatePine(req, res) {
	const id = req.body.id;
	var pineObject = {
		url: req.body.link
	}

	try {
		const pineConfig = (await axios({
			method: "get",
			url: `${pineObject.url}/pine-config.json`,
			responseType: "json"
		})).data;

		if (!pineConfig.name) throw new Error();

		pineObject = {
			...pineConfig,
			id,
			url: req.body.link
		};
		if(pineObject.icon) {
			pineObject.icon = pineObject.icon.replace('%URL%',pineObject.url)
		} 

		await pinesCollection.set(id, pineObject);

		res.send(pineObject);
	} catch (e) {
		console.log(`POST /${id} `, e.message);
		res.sendStatus(500);
	}
}
// Links an ID to the url of a hosted pine
pRouter.post('/new', superUser, updatePine);

// Update Pine info 
pRouter.put('/new', superUser, async (req, res)=>{
	try {
		if(!req.body.id && !req.body.link) throw new Error('Incomplete body.')
		
		await pinesCollection.delete(req.body.id);
		updatePine(req, res);
	} catch (e) {
		console.log(`PUT /${req.body.id} : ${e.message}`);
		res.sendStatus(500);
	}
})

// Get the input form details 
pRouter.get('/form/:id', authenticateUser, async (req, res) => {
	const id = req.params.id;
	
	try {
		const { url: pineLnk } = (await pinesCollection.get(id)).props;
		
		const pineInput = (await axios({
			method: "get", 
			url: `${pineLnk}/pine-input.json`, 
			responseType: "json"
		})).data;
		
		pineInput.id = id;
		
		res.send(pineInput);
	} catch (e) {
		console.log(`GET /pine/form/${id} `, e.message);
		res.sendStatus(500);
	}
})

// Store the Pino Protocol on the server and return an id
pRouter.post('/protocol/new', authenticateUser, async (req, res) => {
	const proto = req.body;
	try {
		let id = uuidv4();
		
		let protoObject = {
			protocol: proto, 
			id
		}
		
		await protocolsCollection.set(protoObject.id, protoObject);
		
		setStat({params: {
			id: "posts", 
			i: 1
		}});
		res.send({
			id: protoObject.id, 
			shortId: sUid.fromUUID(protoObject.id)
		});
	} catch (e)	{
		console.log(`POST /protocol `, e.message);
		res.sendStatus(500);
	} 
})

// Retrieve a url of the protocol stored on the server
pRouter.get('/protocol/:id', authenticateUser, async (req, res) => {
	let id = req.params.id;
	
	try {
		let url = (await protocolsCollection.get(sUid.toUUID(id))).props;
		
		res.send(url);
	} catch (e) {
		console.log(`GET /protocol `, e.message);
		res.sendStatus(500);
	}
})

// Store a note on the server
pRouter.post('/notes/new', authenticateUser, async (req, res) => {
	var body = req.body;
	
	try {
		if (!body.content) throw new Error();
		
		const id = uuidv4();
		body.id = id;
		
		await notesCollection.set(id, body);
		
		res.send({id});
	} catch (e) {
		// console.log(e);
		console.log(`POST /notes `, e.message);
		res.sendStatus(500);
	}
}) 

// Retrieve text stored on the server 
pRouter.get('/notes/:id', authenticateUser, async (req, res) => {
	const id = req.params.id;
	
	try {
		let note = (await notesCollection.get(id)).props; 
		
		res.send(note);
	} catch (e) {
		console.log(`GET /notes/${id} `, e.message);
		res.sendStatus(500);
	}
})
