import jwt from 'jsonwebtoken';

const generateTokenAndSetCookie = (userId, res) => {
  const token = jwt.sign({userId}, process.env.JWT_SECRET, {
    expiresIn: '15d'
  })

  res.cookie('jwt', token, {
    httpOnly: true, //prevent cookie from being accessed through client side scripts
    maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
    sameSite: 'strict',
    secure: process.env.NODE_ENV !== 'development' // cookie will only be set on HTTPS
  })
}
  
export default generateTokenAndSetCookie;