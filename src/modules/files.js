import { Router } from 'express';
import { authenticateUser } from './../auth.js';
import { S3, handleUploadMiddleware } from './setup.js';

export const fRouter = new Router();

// Accept maximum 5 files
fRouter.post('/new', authenticateUser, 
	handleUploadMiddleware.array('input_files', 6),
  (req, res) => {
   if (req.files) {
	res.send({
     msg: "Uploaded!",
     files: req.files
   });
   } else {
   	console.log(`POST /file/new Error `)
   	res.sendStatus(500);
   }
}
);

fRouter.get('/:id', authenticateUser, async (req, res)=>{
	let filename = req.params.id;
	
	try {
    let s3File = await S3.getObject({
      Bucket: process.env.CYCLIC_BUCKET_NAME,
      Key: filename,
    }).promise()

    res.set('Content-type', s3File.ContentType)
    res.send(s3File.Body.toString()).end()
  } catch (error) {
    if (error.code === 'NoSuchKey') {
      console.log(`No such key ${filename}`)
      res.sendStatus(404);
    } else {
      console.log(error)
      res.sendStatus(500);
    }
  }
})

//fRouter.get('/:id', authenticateUser);, )
