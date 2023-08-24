//Email

//notification 


//OTP

export const GenrateOTP = ()=>{
    const otp =  Math.floor(100000 + Math.random()*900000);
    let expiry = new Date();
    expiry.setTime(new Date().getTime()+(30 * 60 * 1000));
    return {otp , expiry}
}

export const otpRequestOTP = async(otp :number , toPhoneNumber: string)=>{
    const accountSid = process.env.ACCOUNTSID;
    const authToken = process.env.AUTHTOKEN;
    const from = process.env.FROM;
    // console.log(accountSid,authToken,from);
    const client = require('twilio')(accountSid , authToken);
    const response = await client.messages.create({
        body:`this is your trial OTP is ${otp} which is valid for 30 minutes and please dont share otp to anyone`,
        from:from,
        to:`+91${toPhoneNumber}`,
 })
    return response;
}