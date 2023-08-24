import express from "express";
import App from "./services/ExpressApp";
import dbConnection  from "./services/Database";
import dotenv from 'dotenv';
dotenv.config();
console.log()

const StartServer = async() =>{
  const port =  3001;
  const app = express();
  await dbConnection();
  await App(app);
  
  app.listen(3001 , ()=>{
    console.log(`Connection sucessfull on ${port}`);
  })
}
StartServer();