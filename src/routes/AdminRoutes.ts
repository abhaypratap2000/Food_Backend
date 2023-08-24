import express , {Request , Response , NextFunction} from "express";
import { CreateAdmin, CreateVendor, GetTransaction, GetTransactionById, GetVendor, GetVendorById } from "../controllers";

const router = express.Router();



router.get('/vendors' , GetVendor);
router.get('/vendor/:id' , GetVendorById);
router.get('/transaction' , GetTransaction);
router.get('/GetTransactionById/:id' , GetTransactionById);

router.get('/' , (req:Request , res:Response , next:NextFunction)=>{
    res.json({message : "Hello from Admin side"})
})

export {router as AdminRoute};
