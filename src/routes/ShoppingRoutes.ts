import express , {Request , Response , NextFunction} from "express";
import { GetAvailableOffers, GetFoodAvailability, GetFoodIn30Mins, GetOffers, GetTopRestaurants, RestaurantsById, SearchFood } from "../controllers";


const router = express.Router();
// ----------------------Food Availability-------------------------
router.get("/:pincode" , GetFoodAvailability);
// ----------------------Top Restaurants-------------------------
router.get("/top-restaurants/:pincode", GetTopRestaurants);
// ----------------------Food Availability in 30 mins-------------------------
router.get("/food-in-30-min/:pincode", GetFoodIn30Mins);
// ----------------------Search Food-------------------------
router.get("/search/:pincode", SearchFood);
// ----------------------Find Restaurants By Id-------------------------
router.get("/restaurants/:id" , RestaurantsById);
// ----------------------Search Offers By Pincode-------------------------
router.get("/GetAvailableOffers/:pincode" , GetAvailableOffers);


export {router as ShoppingRoute};
