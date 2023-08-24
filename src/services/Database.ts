import { MONGO_URI } from "../config";
import mongoose from "mongoose";

export default async () =>{
    try {
    await mongoose.connect(MONGO_URI)
    .then((res) => {
      console.log('dbconnected');
    })
    .catch((err) => {
      console.log(err);
    });
  }catch (error) {
      console.log(error)  
    }
    console.log("DB connected")
}




  