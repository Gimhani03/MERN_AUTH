import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';
import transporter from '../config/nodemailer.js';

export const register = async (req,res) => {
    const {name,email,password} = req.body;

    if (!name || !email || !password) {
        return res.json({success:false, message:'All fields are required'});
    }

    try {
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.json({ success: false, message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new userModel({ name, email, password: hashedPassword });
        await user.save();

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET,{expiresIn:'7d'});

        res.cookie('token', token, {
            httpOnly : true,
            secure : process.env.NODE_ENV === 'production',
            samesite : process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge : 7 * 24 * 60 * 60 * 1000
        })

        //Sending Welcome Email
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: 'Welcome to Our Service',
            text: `Hello ${name},\n\nThank you for registering using ${email}! We're glad to have you on board.\n\nBest,\nThe Team`
        }
        await transporter.sendMail(mailOptions);

        return res.json({success:true, message:'User registered successfully'});

    } catch (error) {
        return res.json({success:false, message:error.message});
    }
}


export const login = async (req,res) => {
    const {email,password} = req.body;

    if(!email || !password){
        return res.json({success:false, message:'Email and Password are required'})
    }

    try {
        const user = await userModel.findOne({email});

        if(!user){
            return res.json({success:false, message:'Invalid email'});
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.json({ success: false, message: 'Invalid password' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            samesite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.json({ success: true, message: 'Login successful' });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}


export const logout = async (req, res) => {
    try {
        res.clearCookie('token',{
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            samesite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        return res.json({ success: true, message: 'Logout successful' });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

//Send Verification OTP to the User's Email
export const sendVerifyOtp = async (req,res) => {
    try {
        const {userId} = req.body;

        const user = await userModel.findById(userId);

        if(user.isAccountVerified) {
            return res.json({success:false, message:'User is already verified'});
        }
       const otp = String(Math.floor(100000 + Math.random() * 900000));

       user.verifyOtp = otp;
       user.verifyOtpExpiredAt = Date.now() + 5 * 60 * 60 * 1000;
        await user.save();

        const mailOption = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Verify Your Email',
            text: `Your verification OTP is ${otp}. It is valid for 5 hours.`
        }
        await transporter.sendMail(mailOption);
        res.json({success:true, message:'Verification OTP sent to your email'});

    } catch (error) {
        res.json({success:false, message:error.message});
    }
}

//Verifying User's Account
export const verifyEmail = async (req,res) => {
    const {userId, otp} = req.body;

    if(!userId || !otp){
        return res.json({success:false, message:'Missing Details'});
    }
    try {
        const user = await userModel.findById(userId);

        if(!user){
            return res.json({success:false, message:'User not found'});
        }
        if(user.verifyOtp == '' || user.verifyOtp !== otp){
            return res.json({success:false, message:'Invalid OTP'});
        }
        if(user.verifyOtpExpiredAt < Date.now()){
            return res.json({success:false, message:'OTP Expired'});
        }
        user.isAcountVerified = true;
        user.verifyOtp = '';
        user.verifyOtpExpiredAt = 0;

        await user.save();

        return res.json({success:true, message:'Email verified successfully'});

    } catch (error) {
        return res.json({success:false, message:error.message});
    }

}