// Contains code for user authentication

import jwt from "jsonwebtoken";

export function authenticateUser(req, res, next) {
	const authHeader = req.headers["authorization"];
	const bearerToken = authHeader && authHeader.split(" ")[1];

	if (!bearerToken) {
		res.sendStatus(401);
	} else {
		jwt.verify(bearerToken, process.env.TOKEN_SECRET, (err, user) => {
			if (err) {
				console.log(`JWT ${bearerToken} `, err);
				res.sendStatus(403); // 403 FORBIDDEN
			} else {
				req.user = user;
				next();
			}
		});
	}
} 

// Generate an access token
export function generateAccessToken(username) {
	
	// Expires in 30 days
  return jwt.sign(username, process.env.TOKEN_SECRET, { expiresIn: "2592000s" });
}
