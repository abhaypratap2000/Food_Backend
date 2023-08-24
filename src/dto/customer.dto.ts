import {IsEmail,Length} from 'class-validator';

export class CreateCustomerInputs{

    @IsEmail()
    email:string;

    
    @Length(7 , 12)
    phone:string;

   
    @Length(6 , 20)
    password:string;


    name:string;
    address:string;
}


export class UserLoginInputs{

    @IsEmail()
    email: string;
    
    @Length(6,20)
    password: string;
}


export class EditCustomerProfileInputs{
    @Length(1,20)
    name: string;
    
    @Length(6,20)
    address: string;
}

export interface CustomerPayload{
    _id : string ;
    email:string;
    verified : boolean;
}

export class CardItem{
    _id: string;
    unit:number;
}

export class OrderInputs{
    txnId : string;
    amount:string;
    items:[CardItem]
}

export class CreateDeliveryUserInputs{
    @IsEmail()
    email:string;

    @Length(10 , 12)
    phone:string;

    @Length(6 , 20)
    password:string;

    @Length(3 , 20)
    firstName:string;

    @Length(2 , 30)
    lastName:string;

    @Length(6,20)
    address:string;

    @Length(4,12)
    pincode:string;
}


export class EditDeliveryUserInputs{
    @IsEmail()
    email:string;

    @Length(10 , 12)
    phone:string;

    @Length(3 , 20)
    firstName:string;

    @Length(2 , 30)
    lastName:string;

    @Length(6,20)
    address:string;

    @Length(4,12)
    pincode:string;

    lat:number;
    lng:number;
}
