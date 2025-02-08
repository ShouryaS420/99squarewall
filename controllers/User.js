import User from "../models/User.js";
import { sendmail } from "../utils/sendmail.js";
import { sendToken } from "../utils/sendToken.js";
import Project from '../models/ProjectDetails.js';

export const login = async (req, res) => {
    try {
        try {
            const { input } = req.body;
    
            if (!input) {
                return res.status(400).json({ success: false, message: "Please fill all required fields." });
            }
    
            const isEmail = /\S+@\S+\.\S+/.test(input);
            const isMobile = /^\d{10}$/.test(input);
    
            let user;
            if (isEmail) {
                user = await User.findOne({ email: input });
            } else if (isMobile) {
                user = await User.findOne({ mobile: input });
            } else {
                return res.status(400).json({ success: false, message: "Invalid email or mobile number" });
            }
    
            if (!user) {
                return res.status(400).json({ success: false, message: "Its look your provided credential are not approved or not available at this moment." });
            }
    
            if (user.isApproved !== true) {
                return res.status(403).json({ success: false, message: "It's look like you have not approved yet. Please try after approval email come!" });
            }
    
            const otp = Math.floor(1000 + Math.random() * 9000);
            const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes
    
            // Save OTP and expiration time to the user's record
            user.otp = otp;
            user.otpExpiresAt = otpExpiresAt;
            await user.save();
    
            if (isMobile) {
                // await axios.post(
                //     `https://server.wylto.com/api/v1/wa/send`,
                //     {
                //         to: `+91${input}`,
                //         message: {
                //             type: 'template',
                //             template: {
                //                 templateName: 'askresidenciotp',
                //                 language: 'en',
                //                 "body": [
                //                     {
                //                         "type": "text",
                //                         "text": otp.toString(),
                //                     }
                //                 ]
                //             },
                //         },
                //     },
                //     {
                //         headers: {
                //             'Content-Type': 'application/json',
                //             Authorization: `Bearer y8K-7rtfy6WkQvIDtVeJMjCA57mXUcXGsN9WKFP24ucQiJkAh-4MiryoM1XL3Aszq0aarVcj6IO1fdLeBq9Xbu9VLI7AE9Ua`,
                //         },
                //     }
                // );

            } else if (isEmail) {
                const emailHtml = `
                    <p>Hi ${user.username},</p>
                    <p>Your OTP for login is: <strong>${otp}</strong></p>
                    <p>This OTP is valid for 10 minutes.</p>
                    <p>Best regards,<br>Team 99Squarewall</p>
                `;
                await sendmail(input, "Your OTP for 99Squarewall Login", emailHtml);
            }
    
            res.status(200).json({ success: true, message: "OTP sent successfully", otp: otp });
            
        } catch (error) {
            console.log(error);
            res.status(500).send({ success: false, message: `Something went wrong. Please try again later. Error: ${error.message}` });
        }
        
    } catch (error) {
        
    }
}

export const verifyOtp = async (req, res) => {
    try {
        const { input, otp } = req.body;

        const isEmail = /\S+@\S+\.\S+/.test(input);
        const isMobile = /^\d{10}$/.test(input);

        let user;
        if (isEmail) {
            user = await User.findOne({ email: input });
        } else if (isMobile) {
            user = await User.findOne({ mobile: input });
        } else {
            return res.status(400).json({ success: false, message: "Invalid email or mobile number" });
        }

        if (!user) {
            return res.status(400).json({ success: false, message: "User not found" });
        }

        if (!user.otp || !user.otpExpiresAt) {
            return res.status(400).json({ success: false, message: "OTP not found or expired" });
        }

        if (user.otp !== otp) {
            return res.status(400).json({ success: false, message: "Invalid OTP" });
        }

        if (user.otpExpiresAt < new Date()) {
            return res.status(400).json({ success: false, message: "OTP expired" });
        }

        // OTP is valid; proceed to login
        user.otp = null; // Clear the OTP after successful validation
        user.otpExpiresAt = null;
        await user.save();

        sendToken(res, user, 200, "Login successful");

    } catch (error) {
        res.status(500).json({ success: false, message: `Server error: ${error.message}` });
    }
};

export const getMyProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        sendToken(res, user, 200, `welcome back ${user.fullName}`);

    } catch (error) {
        res.status(500).send({ success: false, message: `server error: ${error.message}` });
    }
}

export const logout = async (req, res) => {
    try {
        res
            .status(200)
            .cookie("token", null, {
                expires: new Date(Date.now()),
            })
            .json({ success: true, message: "Logged out successfully" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
};

export const addAlternatePhone = async (req, res) => {
    try {

        const { id, altPhone } = req.body;

        const user = await User.findById(id);

        if (!user) {
            return res.status(400).json({ success: false, message: "No User Found!" });
        }

        user.alternateNumber = altPhone;
        await user.save();

        res.status(200).send({ success: true, message: `Alternate Phone Number changed successfully` });
        
    } catch (error) {
        res.status(500).send({ success: false, message: `server error: ${error.message}` });
    }
}

export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);

        res.status(200).send({ success: true, message: user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error fetching post" });
    }
};

export const startWorking = async (req, res) => {
    try {

        const { userId, constructionId } = req.params;

        // Update constructionDetails in User schema
        const updatedUser = await User.findOneAndUpdate(
            { userId: userId, "constructionDetails.totalPackageCost": constructionId }, // Find user and correct array item
            {
                $set: {
                    "constructionDetails.$.status": "Pending Approval", // Update status
                    "constructionDetails.$.requested": true // Update requested
                }
            },
            { new: true } // Return updated document
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Update projectDetails in Project schema
        const updatedProjects = await Project.findOneAndUpdate(
            { projectId: userId, "constructionDetails.totalPackageCost": constructionId }, // Find user and correct array item
            {
                $set: {
                    "constructionDetails.$.status": "Pending Approval", // Update status
                    "constructionDetails.$.requested": true // Update requested
                }
            },
            { new: true } // Return updated document
        );

        res.status(200).json({
            message: "Status updated successfully",
            user: updatedUser,
            updatedProjects,
            success: true,
        });
        
    } catch (error) {
        console.log(error);
        res.status(500).send({ success: false, message: `server error: ${error.message}` });
    }
}