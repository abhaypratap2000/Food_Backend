

import express , {Request , Response , NextFunction} from "express";
import { CreateVendorsInput } from "../dto";
import {Vendor} from '../models/Index'
import { genratePassword, genrateSalt } from "../utility";
import { FindVendor } from "../services/VandorService";
import { Transaction } from "../models/Transaction";
import { Delivery } from "../models/Delivery";

// export const CreateVendor = async (req:Request , res:Response , next:NextFunction)=>{
//     const {name, address, pincode, foodType, email, password, ownerName, phone } = <CreateVendorsInput> req.body;
//     const doesVendorAlreadyExist = await Vandor.findOne({email:email});
//     if(doesVendorAlreadyExist !== null){
//         return res.json({"message" : "Vandor is already Exist !!"})
//     }
//     const salt = await genrateSalt();
//     const userPassword = await genratePassword(password,salt);

//     const createdVendor = await Vandor.create({
//         name:name,
//         address:address,
//         pincode:pincode,
//         foodType:foodType,
//         email:email,
//         password:userPassword,
//         salt:salt,
//         ownerName:ownerName,
//         phone:phone,
//         rating:0,
//         serviceAvailable:false,
//         coverImages:[],

//     })
//    return res.json(createdVendor);
// }




export const CreateVendor = async (req:Request , res:Response , next:NextFunction)=>{
    const data = <CreateVendorsInput> req.body;
    const email = data.email;
    const doesVendorAlreadyExist = await Vendor.findOne({email:email});
    if(doesVendorAlreadyExist !== null){
        return res.json({"message" : "Vendor is already Exist !!"})
    }
    const salt = await genrateSalt();
    data.salt = salt;
    const password = data.password;
    const userPassword = await genratePassword(password,salt);
    data.password = userPassword;
    data.foods = [];
    data.lat = 0;
    data.lng = 0;
    const createdVendor = await new Vendor(data).save()
   return res.json(createdVendor);
}

export const GetVendor = async (req:Request , res:Response , next:NextFunction)=>{
    const vendors = await Vendor.find();
    if(vendors !== null){
        return res.json(vendors)
    } 
    return res.json({"message" :"vendors data is not exist"})
}

export const GetVendorById = async (req:Request , res:Response , next:NextFunction)=>{
    const vendorId = req.params.id;
    const vendor = await FindVendor(vendorId);
    if(vendor !== null){
        return res.json(vendor);
    }
    return res.json({"message" :"vendor data is not avaiable"})
}

export const GetTransaction = async (req:Request, res:Response, next:NextFunction)=>{
    const transaction = await Transaction.find();
    if(transaction){
        return res.status(200).json(transaction);
    }
    return res.json({"message":"Transaction not available"});
}


export const GetTransactionById = async (req:Request , res:Response , next:NextFunction)=>{

    const id = req.params.id;
    const transaction = await Transaction.findById(id);
    if(transaction){
        return res.status(200).json(transaction);
    }
    return res.json({"message":"Transction is not available !"});
}


export const VerifyDeliveryUsers = async (req:Request , res:Response , next:NextFunction)=>{
    
    const {_id , status} = req.body;
    if(_id){
        const profile = await Delivery.findById(_id);
        if(profile){
            profile.verified = status;
            const result = await profile.save();
            return res.status(200).json(result);
        }
    }

    return res.json({"message":"Error in VerifyDeliveryUsers!"});

}