import express, { Request, Response, NextFunction } from "express";
import { plainToClass } from 'class-transformer'
import { CreateDeliveryUserInputs,EditDeliveryUserInputs,UserLoginInputs } from "../dto/customer.dto";
import { validate } from "class-validator";
import {genratePassword, genrateSalt, genrateSigtanure, validatePassword } from "../utility";
import { Delivery } from "../models/Delivery";



export const DeliverySignUp = async (req: Request, res: Response, next: NextFunction) => {
    const deliveryUserInputs = plainToClass(CreateDeliveryUserInputs, req.body);
    const inputErrors = await validate(deliveryUserInputs, { validationError: { target: true } });
    if (inputErrors.length > 0) {
        return res.status(400).json(inputErrors);
    }
    const { email, phone, password, firstName , lastName, address , pincode } = deliveryUserInputs;
    const salt = await genrateSalt();
    const userPassword = await genratePassword(password, salt);

    const existingDeliveryUser = await Delivery.findOne({ email: email });
    if (existingDeliveryUser !== null) {
        return res.status(409).json({ message: "An User is already exist by provided mail" })
    }
    const result = await Delivery.create({
        email: email,
        firstName:firstName,
        password: userPassword,
        salt: salt,
        phone: phone,
        lastName:lastName,
        pincode:pincode,
        address: address,
        verified: false,
        lat: 0,
        lng: 0,
        isAvailable:false

    })
    if (result) {
         const signature = genrateSigtanure({
                        _id: result._id,
                        email: result.email,
                        verified: result.verified
    
                    });
        return res.status(200).json({ signature:signature , verified: result.verified, email: result.email });
    }

    return res.status(400).json({ message: "Error with signup" });
}



export const DeliveryLogin = async (req: Request, res: Response, next: NextFunction) => {
    const loginInputs = plainToClass(UserLoginInputs, req.body);
    const inputErrors = await validate(loginInputs, { validationError: { target: true } });
    if (inputErrors.length > 0) {
        return res.status(400).json(inputErrors);
    }
    const { email, password } = loginInputs;
    const DeliveryUser = await Delivery.findOne({ email: email });
    if (DeliveryUser) {
        
            const validation = await validatePassword(password, DeliveryUser.password, DeliveryUser.salt);
            if (validation) {
                const signature = genrateSigtanure({
                    _id: DeliveryUser._id,
                    email: DeliveryUser.email,
                    verified: DeliveryUser.verified

                });
                return res.status(200).json({ signature: signature, verified: DeliveryUser.verified, email: DeliveryUser.email });
            }
            return res.status(400).json({ message: "validation Error" });
        }

        return res.status(400).json({ message: "Login Error" });
}

export const GetDeliveryProfile = async (req: Request, res: Response, next: NextFunction) => {

    const DeliveryUser = req.user;
    if (DeliveryUser) {
    const profile = await Delivery.findById(DeliveryUser._id);
    console.log(profile)
    if (profile) {
        return res.status(201).json(profile);
        }
        return res.status(400).json({ msg: 'profile not found' });
    }
    return res.status(400).json({ msg: 'Error while Fetching Profile' });

}



export const EditDeliveryProfile = async (req: Request, res: Response, next: NextFunction) => {
    const DeliveryUser = req.user;
    const loginInputs = plainToClass(EditDeliveryUserInputs, req.body);
    const inputErrors = await validate(loginInputs, { validationError: { target: true } });
    if (inputErrors.length > 0) {
        return res.status(400).json(inputErrors);
    }
    const { email , phone , firstName ,lastName , address ,pincode ,lat ,lng } = loginInputs;

    if (DeliveryUser) {
        const profile = await Delivery.findById(DeliveryUser._id);
        if (profile) {
            profile.email = email;
            profile.address = address;
            profile.phone = phone;
            profile.firstName = firstName;
            profile.lastName = lastName;
            profile.pincode = pincode;
            profile.lat = lat;
            profile.lng = lng;
        }
        const result = await profile?.save();
        return res.status(200).json({ result, message: "Profile updated" })
    }
    return res.status(400).json({ message: "Login Error" });
}


export const UpdateDeliveryStatus = async (req: Request, res: Response, next: NextFunction) => {
    const DeliveryUser = req.user;
    if(DeliveryUser){
        const {lat , lng} = req.body;
        const profile = await Delivery.findById(DeliveryUser._id);
        if (profile) {
            if(lat && lng){
                profile.lat = lat;
                profile.lng = lng;
            }
            profile.isAvailable = !profile.isAvailable;
            const result = await profile.save();
            return res.status(200).json(result);
           
        }
    }
    return res.status(400).json({ message: "Someting Went wrong !" });

}
