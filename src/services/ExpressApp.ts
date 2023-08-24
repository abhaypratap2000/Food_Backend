import express, { Application } from "express";
import bodyParser from "body-parser";
import { AdminRoute, ShoppingRoute, VenderRoute , CustomerRoute, DeliveryRoute } from "../routes";


export default async (app:Application)=>{

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ limit: '1gb', extended: true }));
    
    app.use('/admin' , AdminRoute);
    app.use('/vendor', VenderRoute);
    app.use('/customer' , CustomerRoute);
    app.use('/delivery' , DeliveryRoute )
    app.use(ShoppingRoute);

    return app ;
  
}



  


 
  
  