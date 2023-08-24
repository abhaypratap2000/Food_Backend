import express , {Request , Response , NextFunction} from "express";
import { CreateVendor, GetCurrentOrders, GetOffers, GetOrderDetails, ProcessOrder, AddOffers, addfood, getFood, getVendorProfile, updateVendorCoverImage, 
    updateVendorProfile, updateVendorService, vendorLogin, EditOffers, DeleteOffers} from "../controllers";
import { Authenticate } from "../middlewares/commonAuth";
import { uploadMiddlewareA, uploadMiddlewareB } from "../helper";


const router = express.Router();
router.post('/createVendor' ,CreateVendor );
router.post('/login' , vendorLogin);

router.use(Authenticate)
router.get('/profile' ,getVendorProfile);
router.patch('/profile' , updateVendorProfile);
router.post('/updateCoverImage' ,uploadMiddlewareB, updateVendorCoverImage)
router.patch('/service' , updateVendorService);


router.post('/food' ,uploadMiddlewareA, addfood);
router.get('/foods' , getFood);

//orders 

router.get("/orders" , GetCurrentOrders);
router.get("/order/:id" , GetOrderDetails);
router.put("/order/:id/process" , ProcessOrder);

//offers
router.get('/offers', GetOffers);
router.post('/AddOffer', AddOffers);
router.put('/offer/:id', EditOffers);
router.put('/deleteOffer' , DeleteOffers);



router.get('/' , (req:Request , res:Response , next:NextFunction)=>{
    res.json({message : "Hello from Vendor side"})
})


export {router as VenderRoute};
