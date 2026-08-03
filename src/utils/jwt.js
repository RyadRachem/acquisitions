import jwt from 'jsonwebtoken';
import logger from '#config/logger.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-sevret-key'; // Replace with your own secret key
const JWT_EXPIRES_IN = '1d';

export const jwttoken = {
  sign: (payload) =>{
    try{
      return jwt.sign(payload,JWT_SECRET,{expiresIn: JWT_EXPIRES_IN});
    }catch(error){
      logger.error('Error occurred while generating JWT token',error);
      throw new Error('Error occurred while generating JWT token');
    }
  },
  verify: (token) =>{
    try{
      return jwt.verify(token,JWT_SECRET);
    }catch(error){
      logger.error('Error occurred while verifying JWT token',error);
      throw new Error('Error occurred while verifying JWT token');
    }
  }
}  ;