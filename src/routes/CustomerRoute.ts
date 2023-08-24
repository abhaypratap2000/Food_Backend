import express , {Request , Response , NextFunction} from "express" ; 
import { AddToCart, CreateOrder, CreatePayment, CustomerLogin, CustomerSignUp, CustomerVerify, DeleteCart, EditCustomerProfile, GetCart, GetCustomerProfile, GetOrder, GetOrderId, RequestOtp, verifyOrders } from "../controllers/CustomerController";
import { Authenticate } from "../middlewares/commonAuth";

const router = express.Router();


router.post("/signup" , CustomerSignUp);
router.post("/login" , CustomerLogin);
router.post("/OTPverify" , CustomerVerify);
router.get("/otp" , RequestOtp);
router.use(Authenticate)
router.get("/profile" , GetCustomerProfile);
router.patch("/profile" , EditCustomerProfile);
router.post("/create-order", CreateOrder);
router.get("/orders" , GetOrder);
router.get("/orders-by-id/:id" , GetOrderId);
router.post("/Addtocart" , AddToCart);
router.get("/getCart" , GetCart);
router.delete("/deleteCart" , DeleteCart);


//cart 
//Order
//Payment.


router.post('/verify/:id' , verifyOrders)

router.post('/create-payment' , CreatePayment)

export {router as CustomerRoute};