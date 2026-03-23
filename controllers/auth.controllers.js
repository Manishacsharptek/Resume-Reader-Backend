import bcrypt from "bcryptjs";
import User from "../models/user.model.js"
import getToken from "../utils/token.js";
// import transporter from "../utils/mail.js"
import { sendOtpMail } from "../utils/mail.js";


// const sendOtpMail = async (email, otp) => {
//   const transporter = nodemailer.createTransport({
//     host: "smtp.gmail.com",
//     port: 587,
//     secure: false, // true for 465
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS
//     }
//   });
//   await transporter.sendMail({
//     from: process.env.EMAIL_USER,
//     to: email,
//     subject: "Your OTP Code",
//     html: `<h2>Your OTP is ${otp}</h2><p>Valid for 5 minutes</p>`
//   });
// };

// export default sendOtpMail;





export const signup = async (req, res) => {
  try {
    const { fullName, email, password, mobile, role } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    if (!mobile || mobile.length < 10) {
      return res.status(400).json({ message: "Mobile number must be at least 10 digits" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user = await User.create({
      fullName,
      email,
      mobile,
      role,
      password: hashedPassword
    });

    const token = getToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(201).json({
      message: "Signup successful",
      user
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


// export const signIn = async(req,res) => {
//     try{
//    const { email, password } = req.body;

//     const user= await User.findOne({email});
//     if(!user){
//         return res.status(400).json({Message:"user does not exists"})
//     }

//     const isMatch = await bcrypt.compare(password,user.password)
//     if(!isMatch){
//         return res.status(400).json({Message:"password incorrect"})
//     }

// const token = await getToken(user._id);
//   res.cookie("token",token,{
//     secure:false,
//     sameSite:"strict",
//     maxAge:7*24*60*60*1000,
//     httpOnly:true
//   })
//     return res.status(200).json(user)
// }
// catch(error){
//     return res.status(500).json({Message:"Sign in Error..."})
// }
// }

export const signIn = async (req, res) => {
  try {
    const { email, password } = req.body; // ✅ FIXED

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ Message: "User does not exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ Message: "Password incorrect" });
    }

    const token = await getToken(user._id);

    res.cookie("token", token, {
      secure: false,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true
    });

    return res.status(200).json({
      message: "Login successful",
      user
    });

  } catch (error) {
    console.error(error); // 👈 IMPORTANT for debugging
    return res.status(500).json({ Message: "Sign in Error..." });
  }
};


export const signOut = async (req, res) => {
  try {
    res.clearcookie("token");
    res.status(200).json({ Message: "sign out sucessfully..." })
  }
  catch (error) {
    return res.status(500).json({ Message: "server internal Error.." })
  }
}

// export const sendOtp = async(req,res) => {
//   try{
//     const {email} = req.body
//     const user=await User.findOne({email})
//     if(!user){
//       return res.status(400).json({Message:"User does not exist"});
//     }
//     const otp=Math.floor(1000 + Math.random() * 9000).toString()
//      user.resetOtp=otp
//     user.otpexpires=Date.now()+5*60*1000
//     user.isOtpverified=false
//     await user.save()
//     await sendOtpMail(email,otp)
//     return res.status(200).json({Message:"otp send successfully"})
//   }
//   catch(error){
//    return res.status(500).json(`sign out ${error}`)
//   }
// }

export const sendOtp = async (req, res) => {
   
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User does not exist" });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    user.resetotp = otp;
    user.otpexpires = Date.now() + 5 * 60 * 1000; // 5 minutes
    user.isOtpverified = false;

    await user.save();
    await sendOtpMail(email, otp);

    return res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error in sendOtp:", error);
    return res.status(500).json({ message: error.message, error: error.toString() });
  }
};


export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body
    const user = await User.findOne({ email })
    if (!user || user.resetotp != otp || user.otpexpires < Date.now()) {
      return res.status(400).json({ Message: "invaild expires otp" })
    }
    user.isOtpverified = true
    user.resetotp = undefined
    user.otpexpires = undefined
    await user.save()
    return res.status(200).json({ Message: "otp verify successfully!" })
  }
  catch (error) {
    console.error("Error in verifyOtp:", error);
    return res.status(500).json({ Message: "otp not verified!", error: error.toString() })
  }
}

export const resetPassword = async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user || !user.isOtpverified) {
      return res.status(400).json({ Message: "otp verification required!" })
    }
    const hashedPassword = await bcrypt.hash(password, 10)
    user.password = hashedPassword
    user.isOtpverified = false
    await user.save()
    return res.status(200).json({ Message: "password reset successfully!" })
  }
  catch (error) {
    return res.status(500).json(`Message:"password not reset!"`)
  }

}