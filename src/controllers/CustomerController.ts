import express, { Request, Response, NextFunction } from "express";
import { plainToClass } from 'class-transformer'
import { CardItem, CreateCustomerInputs, EditCustomerProfileInputs, OrderInputs, UserLoginInputs } from "../dto/customer.dto";
import { validate } from "class-validator";
import { GenrateOTP, genratePassword, genrateSalt, genrateSigtanure, otpRequestOTP, validatePassword } from "../utility";
import { Customer } from "../models/Customer";
import { emailTemplate } from "../template/email.template";
import nodemailer from 'nodemailer';
import moment from 'moment';
import { Food } from "../models/Food";
import { Order } from "../models/Order";
import { Offer } from "../models/Offer";
import { Transaction } from "../models/Transaction";
import { Vendor } from "../models/VendorsDB";


export const CustomerSignUp = async (req: Request, res: Response, next: NextFunction) => {
    const customerInputs = plainToClass(CreateCustomerInputs, req.body);
    const inputErrors = await validate(customerInputs, { validationError: { target: true } });
    if (inputErrors.length > 0) {
        return res.status(400).json(inputErrors);
    }
    const { email, phone, password, name, address } = customerInputs;
    const salt = await genrateSalt();
    const userPassword = await genratePassword(password, salt);
    const { otp, expiry } = GenrateOTP();
    const existCustomer = await Customer.findOne({ email: email });
    if (existCustomer !== null) {
        return res.status(409).json({ message: "An User is already exist by provided mail" })
    }
    const result = await Customer.create({
        email: email,
        name: name,
        password: userPassword,
        salt: salt,
        phone: phone,
        otp: otp,
        otp_expiry: expiry,
        address: address,
        verified: false,
        lat: 0,
        lng: 0,
        orders: []
    })
    if (result) {
        await otpRequestOTP(otp, phone)
        console.log("otpRequestOTP", otpRequestOTP);
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: 'abhay@ravenspirit.in',
                pass: 'lszbfstapngmjrbf',
            },
        });
        await transporter.sendMail({
            from: 'abhay@ravenspirit.in',
            to: `${email}`,
            subject: 'Thanks For Registering With Us.',
            html: emailTemplate(otp, name),

        });
        return res.status(200).json({ verified: result.verified, email: result.email });
    }

    return res.status(400).json({ message: "Error with signup" });
}



export const CustomerLogin = async (req: Request, res: Response, next: NextFunction) => {
    const loginInputs = plainToClass(UserLoginInputs, req.body);
    const inputErrors = await validate(loginInputs, { validationError: { target: true } });
    if (inputErrors.length > 0) {
        return res.status(400).json(inputErrors);
    }
    const { email, password } = loginInputs;
    const customer = await Customer.findOne({ email: email });
    if (customer) {
        if (customer.verified) {

            const validation = await validatePassword(password, customer.password, customer.salt);
            if (validation) {
                const signature = genrateSigtanure({
                    _id: customer._id,
                    email: customer.email,
                    verified: customer.verified

                });
                return res.status(200).json({ signature: signature, verified: customer.verified, email: customer.email });
            }
            return res.status(400).json({ message: "validation Error" });
        }
        return res.status(401).json({ message: "UnAuthorized" });
    }
    return res.status(400).json({ message: "Login Error" });

}



export const CustomerVerify = async (req: Request, res: Response, next: NextFunction) => {
    const { otp, email } = req.body;
    if (email) {
        const profile = await Customer.findOne({ email });
        if (profile) {
            const date: Date = new Date();
            const expiryTime: number = profile.otp_expiry;
            const momentDate = moment(date);
            const momentExpiryValue = moment(expiryTime);
            if (profile.otp === parseInt(otp) && momentDate.isBefore(momentExpiryValue)) {
                profile.verified = true;
                const updatedCustomerResponse = await profile.save();
                return res.status(201).json({
                    verified: updatedCustomerResponse.verified,
                    email: updatedCustomerResponse.email,
                });
            }
        }
    }
    return res.status(400).json({ message: "Error with OPT validation" });
}




export const RequestOtp = async (req: Request, res: Response, next: NextFunction) => {
    const customer = req.body.email;
    if (customer) {
        const profile = await Customer.findOne({ email: customer });
        if (profile) {
            const { otp, expiry } = GenrateOTP();
            profile.otp = otp;
            profile.otp_expiry = expiry.getTime();

            await profile.save();
            await otpRequestOTP(otp, profile.phone)
            return res.status(200).json({ message: "Otp is delivered on provided number" });
        }
    }
    return res.status(400).json({ message: "Error with OPT delivery" });
}



export const GetCustomerProfile = async (req: Request, res: Response, next: NextFunction) => {

    const customer = req.user;

    if (customer) {

        const profile = await Customer.findById(customer._id);

        if (profile) {

            return res.status(201).json(profile);
        }
        return res.status(400).json({ msg: 'profile not found' });

    }
    return res.status(400).json({ msg: 'Error while Fetching Profile' });

}



export const EditCustomerProfile = async (req: Request, res: Response, next: NextFunction) => {
    const customer = req.user;
    const loginInputs = plainToClass(EditCustomerProfileInputs, req.body);
    const inputErrors = await validate(loginInputs, { validationError: { target: true } });
    if (inputErrors.length > 0) {
        return res.status(400).json(inputErrors);
    }
    const { name, address } = loginInputs;

    if (customer) {
        const profile = await Customer.findById(customer._id);
        if (profile) {
            profile.name = name;
            profile.address = address;
        }
        const result = await profile?.save();
        return res.status(200).json({ result, message: "Profile updated" })
    }
    return res.status(400).json({ message: "Login Error" });
}



export const CreatePayment = async( req:Request , res:Response , next:NextFunction)=>{
    const customer = req.user;
    const {amount , paymentMode , offerId} = req.body;
    if(customer){
        let payableAmount  = Number(amount);
        if(offerId){
            const appliedOffer = await Offer.findById(offerId);
            if(appliedOffer){
                payableAmount = (payableAmount - appliedOffer.offerAmount);
            }
        }
    const transaction = await Transaction.create({
                customer:customer._id,
                vendorId:'',
                orderId:'',
                orderValue:payableAmount,
                offerUsed:offerId || 'NA',
                status :'OPEN',
                paymentMode:paymentMode,
                paymentResponse:"Payment is cash on Delivery"

            })
            return res.status(200).json(transaction);
    }
}

const validateTransaction = async(txnId:string)=>{
      const currentTransaction = await Transaction.findById(txnId);
      if(currentTransaction){
        if(currentTransaction.status.toLowerCase() !== "failed"){
            return{status:true , currentTransaction}
        }
      }
      return{status:false , currentTransaction}
}


const assignOrderDelivery = async(orderId:string , vendorId:string)=>{

    const vendor = await Vendor.findById(vendorId);
    if(vendor){
        const areaCode = vendor.pincode;
        const vendorLAT = vendor.lat;
        const vendorLNG = vendor.lng;
    }
}



export const CreateOrder = async (req: Request, res: Response, next: NextFunction) => {
    const customer = req.user;
    const {txnId , items , amount} = <OrderInputs>req.body;
    if (customer) {

        const data = await validateTransaction(txnId);
        if(!data.status){
            return res.status(404).json({message:"Error with Create Order"})
        }
        const orderId = `${Math.floor(Math.random() * 89999) + 1000}`;
        const profile = await Customer.findById(customer._id);
        let cartItems = Array();
        let netAmount = 0.0;
        let vendorId;
        const foods = await Food.find().where("_id").in(items.map(item => item._id)).exec();
        foods.map(food => {
            items.map(({ _id, unit }) => {
                if (food._id == _id) {
                    vendorId = food.vendorId;
                    netAmount += (food.price * unit);
                    cartItems.push({ food, unit })
                }
            })
        })
        if (cartItems) {
            const currentOrder = await Order.create({
                orderId: orderId,
                items: cartItems,
                vendorId: vendorId,
                totalAmount: netAmount,
                paidAmount:amount,
                orderDate: new Date(),
                orderStatus: 'Waiting',
                remarks: '',
                deliveryId: '',

                readyTime: 45
            })
            if (currentOrder) { 
                if (profile) {
                    profile.cart = [] as any;
                    if(data.currentTransaction && vendorId){
                    data.currentTransaction.vendorId = vendorId;
                    data.currentTransaction.orderId = orderId;
                    data.currentTransaction.status = "CONFIRMED";

                    }
                    
                    await  data.currentTransaction?.save();
                    profile?.orders.push(currentOrder);
                    await profile?.save();
                }
                return res.status(200).json(currentOrder);
            }
}
}
return res.status(400).json({msg:'Error while Creating Order'});
}



export const GetOrder = async (req: Request, res: Response, next: NextFunction) => {

    const customer = req.user;
    if (customer) {
        const profile = await Customer.findById(customer._id).populate("orders");
        if (profile) {
            return res.status(200).json(profile.orders);
        }
    }
}



export const GetOrderId = async (req: Request, res: Response, next: NextFunction) => {

    const orderId = req.params.id;
    if (orderId) {
        const order = await Order.findById(orderId).populate('items.food');
        res.status(200).json(order);
    }
}


export const AddToCart = async (req: Request, res: Response, next: NextFunction) => {
    const customer = req.user;
    const { _id, unit } = <CardItem>req.body;
    const food = await Food.findById(_id);
    if (customer) {
        const profile: any = await Customer.findById(customer._id)
        if (!profile || !food) {
            return res.status(404).json({ msg: 'Unable to add to cart!' });
        }
        let cartItems = Array();
        cartItems = profile.cart;
        if (profile.cart.length > 0) {
            let existFoodItems = cartItems.filter((item) => { return item.food._id.toString() == _id });
            if (existFoodItems.length > 0) {
                const index = cartItems.indexOf(existFoodItems[0]);
                if (unit > 0) {
                    cartItems[index] = { food, unit };
                } else {
                    cartItems.splice(index, 1);
                }

            } else {
                cartItems.push({ food, unit });

            }
    } else {
            cartItems.push({ food, unit });
        }
        if (cartItems) {
            profile.cart = cartItems as any;
            const cartResult = await profile.save();
            return res.status(200).json(cartResult.cart);
        }
}
    return res.status(404).json({ msg: 'Unable to add to cart!' });
}



export const GetCart = async (req: Request, res: Response, next: NextFunction) => {
   const customer = req.user;
    if (customer) {
        const profile = await Customer.findById(customer._id).populate('cart.food');
        if (profile) {
            return res.status(200).json(profile.cart);
        }
    }
    return res.status(400).json({ msg: 'Cart is empty!' });
}



export const DeleteCart = async (req: Request, res: Response, next: NextFunction) => {
    const customer = req.user;
    if (customer) {
        const profile = await Customer.findById(customer._id).populate('cart.food');
        if (profile !== null) {
            profile.cart = [] as any;
            const cartResult = await profile.save();
            return res.status(200).json(cartResult);
        }
    }
    return res.status(400).json({ msg: 'Cart is Already Empty!' });
}


export const verifyOrders = async (req: Request, res: Response, next: NextFunction) => {
     const offerId = req.params.id;
     const customer = req.user;

     if(customer){
        const appliedOffer = await Offer.findById(offerId);
        if(appliedOffer){
            if(appliedOffer.promoType == "USER"){
                //jhkjslkalksl;
            }else{
                if(appliedOffer.isActive){
                    return res.status(200).json({message:"offer is valid" , appliedOffer})
                }

            }
        }
     }
     return res.status(400).json({ msg: 'offer is not applied !' });

}


