import mongoose , {Schema , Document , Model} from "mongoose";
import { OrderDoc } from "./Order";

interface CustomerDoc extends Document {
    email : string;
    name:string;
    password : string;
    salt : string;
    address : string ;
    phone : string ; 
    verified : any;
    otp : number ; 
    otp_expiry : number;
    lat : number; 
    lng : number;
    cart:[any];
    orders:[OrderDoc];
    vandor:[any];
}


const CustomerSchema = new Schema({
    email : {type:String , required:true},
    name:{type:String , required:true},
    password : {type:String , require:true},
    salt : {type:String , require:true},
    address : {type:String , require:true},
    phone : {type:String , require:true},
    verified : {type:String , require:true},
    otp : {type:Number , require:true},
    otp_expiry : {type:Number , require:true},
    lat :{type:Number},
    lng : {type:Number},
    cart :[
        {
            food: { type: Schema.Types.ObjectId, ref: 'food', require: true},
            unit: { type: Number, require: true}
        }
    ],
    orders:[

        {
            type:Schema.Types.ObjectId,
            ref:'order', require: true
        }
    ],
    vendor:[
        {
            type:Schema.Types.ObjectId,ref:'vendor',require: true
        }
    ]

},{ 
    toJSON:{
        transform(doc , ret){
            delete ret.password;
            delete ret.salt;
            delete ret.__v;
            delete ret.createdAt;
            delete ret.updatedAt
        }
    },
    timestamps: true 
})

const  Customer = mongoose.model<CustomerDoc>("customer" ,CustomerSchema);
export {Customer};