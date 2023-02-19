import { Router } from 'express';
import { authenticateUser } from './../auth.js';
import { handleUploadMiddleware } from './setup.js';

export const fRouter = new Router();

// Accept maximum 5 files
fRouter.post('/new', authenticateUser, 
	handleUploadMiddleware.array('input_files', 6),
  (req, res) => {
   res.status(200);
   console.log(req.files)
   return res.json({
     msg: "Uploaded!",
     files: req.files
   });
}
);

//fRouter.get('/:id', authenticateUser);, )
