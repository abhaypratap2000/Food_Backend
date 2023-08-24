import express, { Request, Response, NextFunction } from "express";
import { Vendor } from "../models/VendorsDB";
import { FoodDoc } from "../models/Food";
import { Offer } from "../models/Offer";

export const GetFoodAvailability = async (req: Request, res: Response, next: NextFunction) => {
    const pincode = req.params.pincode;
    const result = await Vendor.find({pincode:pincode , serviceAvailable:true}).sort([["rating" , "descending"]])
    .populate("foods");
    if(result.length > 0){
        return res.status(200).json(result);
    }
    return res.status(400).json({message:"Data Not found!"})
}

export const GetTopRestaurants = async (req: Request, res: Response, next: NextFunction) => {
    const pincode = req.params.pincode;
    const result = await Vendor.find({pincode:pincode , serviceAvailable:true}).sort([["rating" , "descending"]])
    .limit(10);
    if(result.length > 0){
        return res.status(200).json(result);
    }
    return res.status(400).json({message:"Data Not found!"})
}

export const GetFoodIn30Mins = async (req: Request, res: Response, next: NextFunction) => {
    const pincode = req.params.pincode;
    const result = await Vendor.find({pincode:pincode , serviceAvailable:true})
    .populate("foods");
    if(result.length > 0){
        let foodResults:any = [];
        result.map(Vendor => {
            const foods = Vendor.foods as [FoodDoc];
            foodResults.push(...foods.filter(food => food.readyTime <= 30));
 })
        return res.status(200).json(foodResults);
    }
    return res.status(400).json({message:"Data Not found!"})
}

export const SearchFood = async (req: Request, res: Response, next: NextFunction) => {
    const pincode = req.params.pincode;
    const result = await Vendor.find({pincode:pincode , serviceAvailable:true})
    .populate("foods");
    if(result.length > 0){
        let foodResults:any = [];   
        result.map(item => foodResults.push(item.foods))
        return res.status(200).json(foodResults);
    }
    return res.status(400).json({message:"Data Not found!"})
}

export const RestaurantsById = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const result = await Vendor.findById(id).populate("foods");
    if(result){
        return res.status(200).json(result)
    }
    return res.status(400).json({message : "Data Not Found!"})
}
export const GetAvailableOffers = async (req: Request, res: Response, next: NextFunction) => {
        const pincode = req.params.pincode;

        const offers = await Offer.find({pincode:pincode , isActive:true});
        if(offers){
            return res.status(200).json(offers);
        }
        return res.status(400).json({message:"Offers not found !"})

}
