const jwt = require('jsonwebtoken');

const genrateToken = (id) =>{
    return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: "1d"});
};

module.exports = genrateToken;