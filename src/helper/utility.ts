// import multer from 'multer';
// import path from 'path';
// console.log("start");

// const ImagesStorage = multer.diskStorage({
    
//     destination: function(req, file, cb){
//         cb(null , 'images')
//     },
//     filename: (req, file, cb) => {
//        cb(null,`${file.originalname.split(".")[0]}_${Date.now()}${path.extname(file.originalname)}` );
//     },
//   });

// export const multerMiddleware = multer({
//     storage:ImagesStorage,
//     limits: {
//       fileSize: 1024*1024*1000,
//     },
//   }).array('images' , 10);
 


import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express'; // Import the Request type from 'express'

function configureMulter(destination: string) {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      fs.mkdirSync(destination, { recursive: true });
      cb(null, destination);
    },
    filename: (req, file, cb) => {
      const fileName = `${file.originalname.split(".")[0]}_${Date.now()}${path.extname(file.originalname)}`;
      cb(null, fileName);
    },
  });
}

function multerMiddleware(destination: string, maxImages: number) {
  return multer({
    storage: configureMulter(destination),
    limits: {
      fileSize: 1024 * 1024 * 1000,
    },
    fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
      const images = req.files as Express.Multer.File[];
      if (Array.isArray(images) && images.length > maxImages) {
       return cb(new Error(`Only ${maxImages} images are allowed.`));
      } else {
       return cb(null, true);
      }
    },
  }).array('images', maxImages);
}

export const uploadMiddlewareA = multerMiddleware("images/addfoodImages", 10);
export const uploadMiddlewareB = multerMiddleware("images/updateVandorCoverImages", 1);
