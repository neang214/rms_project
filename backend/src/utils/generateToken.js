import jwt from "jsonwebtoken";
 
export const generateToken = (user, res) => {
  const token = jwt.sign({ 
      userId:   user.user_id,
      username: user.username,
      role:     user.role,
   }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
 
  res.cookie("token", token, {
    maxAge: 1 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
 
  return token;
};
 