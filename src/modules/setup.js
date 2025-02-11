import { S3Client, GetObjectCommand} from '@aws-sdk/client-s3';
import multerS3 from 'multer-s3' ;
import multer from 'multer';
//import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';

//AWS.config.update({
//	accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//	secretAccessKey: process.env.AWS_SECRET_KEY,
//	signatureVersion: 'v4'
//});

export const S3 = new S3Client();
const isAllowedMimetype = (mime) => ['image/png', 'image/jpg', 'image/jpeg', 'image/gif', 'image/x-ms-bmp', 'image/webp'].includes(mime.toString());
const fileFilter = (req, file, callback) => {
	const fileMime = file.mimetype;
	if (true) { //isAllowedMimetype(fileMime)) {
		callback(null, true)
	} else {
		callback(null, false)
	}
}
const getUniqFileName = (originalname) => {
	const name = uuidv4();
	const ext = originalname.split('.').pop();
	return `${name}.${ext}`;
}

export const handleUploadMiddleware = multer({
	fileFilter,
	storage: multerS3({
		s3: S3,
		bucket: process.env.CYCLIC_BUCKET_NAME,
		contentType: multerS3.AUTO_CONTENT_TYPE,
		key: function(req, file, cb) {
			const fileName = getUniqFileName(file.originalname);
			// const s3_inner_directory = 'pines';
			//const finalPath = `${s3_inner_directory}/${fileName}`;
			let fileId = fileName.split('.')[0];
			file.newName = fileName;

			cb(null, fileId);
		}
	})
});

export async function search(fileId) {
	let command = new GetObjectCommand({
		Bucket: process.env.CYCLIC_BUCKET_NAME,
		Key: fileId,
	});
	
	return S3.send(command);
}
