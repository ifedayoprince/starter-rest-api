import DynamoDb from "@cyclic.sh/dynamodb";

import slugify from "slugify";
import { v4 as uuidv4 } from "uuid";
import { faker } from "@faker-js/faker";

export const pineAccessor = () => {
	return {
		id: uuidv4(),
		name: faker.commerce.productAdjective(),
		description: faker.commerce.productDescription(), 
		version: faker.system.semver(), 
		icon: faker.abstract(512,512),
		author: faker.company.name(),
	};
};

async function fillDataBaseWithPines(res) {
	const totalPines = 5;
	const randomPines = Array(totalPines).fill({}).map(pineAccessor);

	const db = DynamoDb(process.env.CYCLIC_DB);
	const pinesCollection = db.collection("pines");

	await Promise.allSettled(
		randomPines.map((pine) => pinesCollection.set(pine.id, pine))
	);
	
	res.send(randomPines);
	console.log(`Added ${totalPines} new pines.`);
}

export default fillDataBaseWithPines;
