export interface CreateVendorsInput{
    name:string,
    ownerName:string,
    foodType:[string],
    pincode:string,
    address:string,
    phone:string,
    password:string,
    email:string,
    salt:string,
    foods:any,
    lat:number,
    lng:number,

} 

export interface VendorLoginInputs{
    email:string;
    password:string;
}

export interface VendorPayload{
    _id : string ;
    email:string;
    name:string;
    foodTypes:[string];
    //
}

export interface EditVendorInputs{
    address : string,
    phone:string,
    name:string,
    foodType:[string]
}

export interface CreateOffersInputs{
    offerType:string;
    vendors:string;
    title:string;
    description :string;
    minValue:number;
    offerAmount:number;
    startValidity:Date;
    endValidity:Date;
    promocode:string;
    promoType:string;
    bank:[any];
    bins:[any];
    pincode:string;
    isActive:boolean;
}
