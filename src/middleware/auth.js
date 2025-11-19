import { verifyToken } from "./../utils/json.js";
import {prisma} from './../utils/prisma-clients.js';
const auth =async(req,res,next)=>{
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  if (!token){
    return res.status(401).json({message:"Unthorization"});
  
  } try{
    const payload= await verifyToken(token);
console.log(payload)

    const user = await prisma.user.findUnique ({
      where:{
        id : payload.id
      }
    });
  //verify that a used is valied
  if (!user){
    return res.status(401).json({message:"Unauthorized"});
  }
  delete user.password;
  
req.user=user;
 console.log("Authorized user:",user);

    
    //featch user fron database with the given payload id
    next();
  }catch(error){
    console.log(error);
    res.status(401).json({message:"Unauthorized"})
  }
  }



export{auth};