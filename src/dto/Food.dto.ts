export interface CreateFoodInputs{
    vendorId:string;
    name:string,
    description:string,
    category:string,
    foodType:string,
    readyTime:number,
    price:number,
    fileNames:[Express.Multer.File],
    images:any,
    coverimage:any

}

