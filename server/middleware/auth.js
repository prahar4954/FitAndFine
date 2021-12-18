const jwt = require('jsonwebtoken');
// const config = require('config');
const keys = require("../config/key");

module.exports = function(req,res, next){
  //get token from header
  var cookie = req.cookies;
  const token = cookie.token;
  //check if not token
  if(!token){
    return res.status(401).json({msg:'No token! Auth denied'});
  }

  //Verify token
  try{
    const decoded = jwt.verify(token, keys.secretOrKey);
    req.user = decoded;
    console.log(req.user);
    console.log("auth done");
    next();
  }catch(err){
    res.status(401).json({msg:'Token is not valid'});
  }
}