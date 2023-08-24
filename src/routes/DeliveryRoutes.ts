import express , {Request , Response , NextFunction} from "express" ; 
import { DeliveryLogin, DeliverySignUp,  EditDeliveryProfile, GetDeliveryProfile, UpdateDeliveryStatus} from "../controllers/DeliveryController";
import { Authenticate } from "../middlewares/commonAuth";

const router = express.Router();


router.post("/signup" , DeliverySignUp);
router.post("/login" , DeliveryLogin);

router.use(Authenticate);

router.put("/change-status" , UpdateDeliveryStatus);

router.get("/profile" , GetDeliveryProfile);

router.patch("/profile" , EditDeliveryProfile);


export {router as DeliveryRoute};