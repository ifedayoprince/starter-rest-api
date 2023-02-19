import { Router } from 'express';
import { authenticateUser } from './../auth.js';
// import { S3, handleUploadMiddleware } from './setup.js';
import { S3Client } from '@aws-sdk/client-s3';
import multer from 'multer';
import multerS3 from 'multer-s3';


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
fRouter.post('/new', 
	upload.array('files', 3),
  (req, res) => {
  	// console.log(req);
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
