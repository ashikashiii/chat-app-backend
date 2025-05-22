
// signup a new user

import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

export const signup = async (req, res) => {
    const {fullName, email, password, bio } = req.body;
    try {
        if (!fullName || !email || !password || !bio) {
            return res.json({sucess: false, message: "missing details"});
        }
        const user = await User.findOne({ email });
        if (user) {
            return res.json({sucess: false, message: "Account already exists"});
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const newUser = await User.create({
            email,
            fullName,
            password: hashedPassword,
            bio,
        }); 

        const token = generateToken(newUser._id);

        res.json({sucess: true, userData: newUser, token, message: "Account created successfully"});

    } catch (error) {
        console.log(error.message);
        res.json({sucess: false,message: error.message});

    }
}


// controller to login a user
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const userData = await User.findOne({ email });

        const isPasswordCorrect = await bcrypt.compare(password, userData.password);

        if (!isPasswordCorrect) {
            return res.json({sucess: false, message: "Invalid credentials"});
        }

        const token = generateToken(userData._id);

        res.json({sucess: true, userData, token, message: "Login successfully"});


    } catch (error) {
        console.log(error.message);
        res.json({sucess: false,message: error.message});
    }
}

// controller to check if user is authenticated
export const checkAuth = (req, res) => {
    res.json({sucess: true, user: req.user});
}

//controller to update user profile details 
export const updateProfile = async (req, res) => {
    try {
        const { profilePic, fullName, bio } = req.body;
        const userId = req.user._id;
        
        let updatedUser;
        console.log(userId, "userId");
        

        if(!profilePic) {
            console.log("no profile pic");
            
          updatedUser =  await User.findByIdAndUpdate(userId, {bio,fullName}, {new: true});
          
        }else{
            console.log("profile pic")
            
            // const upload = await cloudinary.uploader.upload(profilePic);

            const upload = await cloudinary.uploader.upload(profilePic, {
  upload_preset: "blabberBox" // <--- your new unsigned preset
});


            
            updatedUser= await User.findByIdAndUpdate(userId, 
                {bio,fullName, profilePic: upload.secure_url}, {new: true});
        }
        res.json({sucess: true, user: updatedUser, message: "Profile updated successfully"});
    

    } catch (error) {

        console.log(error.message,"error");
        res.json({sucess: false, message: error.message});
    }
}



