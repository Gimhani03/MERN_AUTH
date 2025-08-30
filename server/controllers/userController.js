import userModel from "../models/userModel.js";

export const getUserData = async (req,res) => {

    try {
         const {userId} = req.body;

         const user = await userModel.findById(userId);

         if (!user) {
             return res.json({ success: false, message: 'User not found' });
         }
         res.json(
             {
                 success: true,
                 userData: {
                     name: user.name,
                     isAccountVerified: user.isAccountVerified,
                     email: user.email,
                     createdAt: user.createdAt
                 }
             }
         )

         return res.json({ success: true, data: user });
    } catch (error) {
        return res.json({success:false, message:error.message});
    }
}