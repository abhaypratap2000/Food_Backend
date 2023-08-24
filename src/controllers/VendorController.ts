import express, { Request, Response, NextFunction } from "express";
import { CreateFoodInputs, CreateOffersInputs, EditVendorInputs, VendorLoginInputs } from "../dto";
import { FindVendor, FindVendor2 } from "../services/VandorService";
import bcrypt from 'bcrypt';
import { genrateSigtanure } from "../utility";
import { Food } from "../models/Food";
import { Order } from "../models/Order";
import { Offer } from "../models/Offer";


export const CreateAdmin = async (req: Request, res: Response, next: NextFunction) => {

}

export const vendorLogin = async (req: Request, res: Response, next: NextFunction) => {
    const data = <VendorLoginInputs>req.body;
    const existingVendor = await FindVendor(" ", data.email);
    if (existingVendor !== null) {
        const validate = await bcrypt.compare(data.password, existingVendor.password);
        if (validate) {
            const signature = genrateSigtanure({
                _id: existingVendor.id,
                email: existingVendor.email,
                foodTypes: existingVendor.foodType,
                name: existingVendor.name
            })
            return res.json(signature);
        }
    } else {
        return res.json({ "message": "Password is not valid" })
    }
    return res.json({ "message": "Login credential not valid" })
}



export const getVendorProfile = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (user) {
        const existingVandor = await FindVendor(user._id);
        return res.json(existingVandor)
    }
    return res.json({ "message": "vendor info not found" })
}

export const updateVendorProfile = async (req: Request, res: Response, next: NextFunction) => {
    const data = <EditVendorInputs>req.body;
    const user = req.user;
    if (user) {
        const existingVendor = await FindVendor(user._id);
        if (existingVendor !== null) {
            existingVendor.name = data.name;
            existingVendor.address = data.address;
            existingVendor.foodType = data.foodType;
            existingVendor.phone = data.phone;
            const saveResult = await existingVendor.save();
            return res.json(saveResult)
        }
    }
    return res.json({ 'message': "vendor information is not found" })

}

export const updateVendorService = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const data = req.body;
    if (user) {
        const existingVendor = await FindVendor(user._id);
        if (existingVendor !== null) {
            existingVendor.serviceAvailable = !existingVendor.serviceAvailable;
            if(data.lat && data.lng){
                existingVendor.lat = data.lat;
                existingVendor.lng = data.lng;

            }
            const savedResult = await existingVendor.save();
            return res.json(savedResult);
        }
        return res.json(existingVendor)
    }
    return res.json({ 'message': "vandor information is not found" })
}

export const addfood = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (user) {
        const data = <CreateFoodInputs>req.body;
        const Vendor = await FindVendor(user._id);
        let fileNames
        if (Vendor !== null) {
            const uploadedFiles = req.files as [Express.Multer.File];
            if (uploadedFiles) {
                fileNames = uploadedFiles.map(file => file.filename);

            }
            else {
                res.status(400).send('No files uploaded');
            }
            data.vendorId = Vendor._id;
            data.images = fileNames;

            const createdFood = await new Food(data).save();
            Vendor.foods.push(createdFood);
            const result = await Vendor.save();
            return res.json(result);

        }
    }
    return res.json({ "message": "Something went wrong with add food" })
}



export const getFood = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (user) {
        const food = await Food.find({ vendorId: user._id });

        if (food !== null) {
            return res.json(food);
        }
    }
    return res.json({ "message": "Something went wrong to get food " })
}

// export const updateVendorCoverImage = async (req: Request, res: Response, next: NextFunction)=>{

//     const user = req.user;
//     if (user) {
//         const Vendor = await FindVendor(user._id);

//         if (Vendor !== null) {
//             const uploadedFiles = req.files as [Express.Multer.File];
//             if (uploadedFiles) {
//                 Vendor.coverImages = uploadedFiles.map((file: Express.Multer.File) => file.filename);

//             } 
//             else {
//                 res.status(400).send('No files uploaded');
//             }  

//             const result = await Vendor.save();
//             return res.json(result);

//         }
//     }
//     return res.json({ "message": "Something went wrong with update cover Image" })
// }


export const updateVendorCoverImage = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (user) {
        const uploadedFiles = req.files as [Express.Multer.File];
        const data = uploadedFiles.map((file: Express.Multer.File) => file.filename);
        const Vendor = await FindVendor2(user._id, data);
        return res.json(Vendor);
    }
    return res.json({ "message": "Something went wrong with update cover Image" })
}

export const GetCurrentOrders = async (req: Request, res: Response, next: NextFunction) => {

    const vendor = req.user;
    if (vendor) {
        const order = await Order.find({ vendorId: vendor._id });
        console.log("order", order)
        if (order != null) {
            return res.status(200).json(order);
        }
        return res.json({ "message": "Order Not Found !" })
    }
}

export const GetOrderDetails = async (req: Request, res: Response, next: NextFunction) => {

    const orderId = req.params.id;

    if (orderId) {

        const order = await Order.findById(orderId).populate('items.food');

        if (order != null) {
            return res.status(200).json(order);
        }
    }

    return res.json({ message: 'Order Not found' });
}


export const ProcessOrder = async (req: Request, res: Response, next: NextFunction) => {
    const orderId = req.params.Id;
    const { status, remarks, time } = req.body;

    if (orderId) {
        const order = await Order.findById(orderId).populate('food');

        if (order) {
            order.orderStatus = status;
            order.remarks = remarks;

            if (time) {
                order.readyTime = time;
            }

            const orderResult = await order.save();

            if (orderResult) {
                return res.status(200).json(orderResult);
            }
        }
    }

    return res.json({ message: 'Unable to process your order' });
};


export const GetOffers = async (req: Request, res: Response, next: NextFunction) => {

    const user = req.user;
    if (user) {
        let currentOffers: any[] = [];;
        const offers = await Offer.find();
        if (offers) {
            offers.map(item => {
                if (item.vendors) {
                    item.vendors.map(vendor => {
                        if (vendor._id.toString() === user._id) {
                            currentOffers.push(item);
                        }
                    })
                }
                if (item.offerType === 'GENERIC') {
                    currentOffers.push(item);
                }
            })
            console.log("currentOffers", currentOffers)
        }
        return res.status(200).json(currentOffers);
    }
    return res.json({ message: 'Unable to get Offers !' });
}

//   export const AddOffers = async (req: Request, res: Response, next: NextFunction) => {
//    const user = req.user;
//    if(user){
//     const { offerType, vendors, title,description,minValue,offerAmount, startValidity,
//         endValidity,  promocode, promoType,  bank, bins, pincode, isActive} = <CreateOffersInputs>req.body;

//         const vendor = await FindVendor(user._id);
//         if(vendor){
//             const offer = await Offer.create({
//              title,
//              description,
//              offerType,
//              offerAmount,
//              pincode,
//              promocode,
//              promoType,
//              startValidity,
//              endValidity,
//              bank,
//              bins,
//              isActive,
//              minValue,
//              vendors:[vendor]
//             })
//            return res.status(200).json(offer);
//         }
//    }
//    return res.json({ message: 'Unable to add Offer' });

//   }


export const AddOffers = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (user) {
        const data = <CreateOffersInputs>req.body;
        const vendor = await FindVendor(user._id);
        if (vendor) {
            data.vendors = vendor._id.toString();;
            const createOffer = await new Offer(data).save()
            return res.json(createOffer);
        }
    }
    return res.json({ message: 'Unable to add Offer' });


}




export const DeleteOffers = async (req: Request, res: Response, next: NextFunction) => {


}

export const EditOffers = async (req: Request, res: Response, next: NextFunction) => {

    const user = req.user;
    const offerId = req.params.id;
    if (user) {
        const { offerType, title, description, minValue, offerAmount, startValidity,
            endValidity, promocode, promoType, bank, bins, pincode, isActive } = <CreateOffersInputs>req.body;
        const currentOffer = await Offer.findById(offerId);
        if (currentOffer) {
            const vendor = await FindVendor(user._id);
            if (vendor) {
                    currentOffer.title = title,
                    currentOffer.description = description,
                    currentOffer.offerType = offerType,
                    currentOffer.offerAmount = offerAmount,
                    currentOffer.pincode = pincode,
                    currentOffer.promocode = promocode,
                    currentOffer.promoType = promoType,
                    currentOffer.startValidity = startValidity,
                    currentOffer.endValidity = endValidity,
                    currentOffer.bank = bank,
                    currentOffer.bins = bins,
                    currentOffer.isActive = isActive,
                    currentOffer.minValue = minValue
                    const result = await currentOffer.save();
                    return res.json(result)
               
            }
        }
    }
    return res.json({ message: 'Unable to add Offer' });

}