const User = require('../models/userModel')
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');

const authMiddleware = asyncHandler(async (req, res, next)=> {
    let token;
    if(req?.headers?.authorization?.startsWith('Bearer')){
        token = req.headers.authorization.split(" ")[1];
        try {
            if(token){
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const admin = await User.findById(decoded?.id);
                req.admin = admin;
                next();
            }
        } catch (error) {
            throw new Error("Not Authorized token Expired, Please login again")
        }
    }
    else{
        throw new Error("There is no token atteched to header")
    }
});

const isAdmin = asyncHandler(async(req, res, next) =>{
    let  { loginId } = req.admin;
    const userAdmin = await User.findOne({loginId});
    if(userAdmin.role !== "admin" ){
        throw new Error("You are not an admin");
    }
    else{
        next();
    }
})



module.exports = {authMiddleware, isAdmin} ;