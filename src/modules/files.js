import { Router } from 'express';
import { authenticateUser } from './../auth.js';
import { S3, handleUploadMiddleware } from './setup.js';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import multer from 'multer';
import multerS3 from 'multer-s3';
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const fRouter = new Router();

const s3 = new S3Client()

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.CYCLIC_BUCKET_NAME,
    metadata: function (req, file, cb) {
      cb(null, {fieldName: file.fieldname});
    },
    key: function (req, file, cb) {
      cb(null, Date.now().toString())
    }
  })
})


// Accept maximum 5 files
fRouter.post('/new', authenticateUser, 
	handleUploadMiddleware.array('files', 50),
  (req, res) => {
  	// console.log(req);
   if (req.files) {
   	req.files = req.files.map((file)=>{
   		return file.key;
   	});
	res.send({
     msg: "Upload successful",
     fileCount: req.files.length, 
     files: req.files
   });
   } else {
   	console.log(`POST /file/new Error `)
   	res.sendStatus(500);
   }
}
);

fRouter.get('/:id', authenticateUser, async (req, res)=>{
	let fileId = req.params.id;
	
	try {
		let command = new GetObjectCommand({
		Bucket: process.env.CYCLIC_BUCKET_NAME,
		Key: fileId,
	});
	
	let signedUrl = await getSignedUrl(S3, command, {expiresIn: 3600});
	
	res.send({url: signedUrl});
    // let s3File = await S3.send(command);

    // res.set('Content-Type', s3File.ContentType);
    // console.log(s3File.Body);
    //res.send(await s3File.Body.transformToString());
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
