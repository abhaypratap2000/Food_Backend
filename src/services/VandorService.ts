import {Vendor} from '../models/Index'

export const FindVendor = async(id:string | undefined , email?:string)=>{
    if(email){
        return await Vendor.findOne({email:email});
    }else{
        return await Vendor.findById(id);
    }
}
export const FindVendor2 = async(id:string , coverImages?:String[])=>{
    return await Vendor.findByIdAndUpdate(id,{
        $push:{coverImages}
    }).then((res)=>{
        if(res){
            return res;
        }else{
            return "Vendor not found !";
        }
    })
}
