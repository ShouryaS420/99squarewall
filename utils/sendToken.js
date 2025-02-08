export const sendToken = (res, user, statusCode, message) => {

    const token = user.getJWTToken();

    const options = {
        httpOnly:true,
        expires:new Date(Date.now()+process.env.JWT_COOKIE_EXPIRE*60*1000)
    }

    const userData = {
        _id: user._id,
        userId: user.userId,
        username: user.username,
        email: user.email,
        mobile: user.mobile,
        img: user.img,
        alternateNumber: user.alternateNumber,
        projectType: user.projectType,
        plotInformation: user.plotInformation,
        currentPhase: user.currentPhase,
        progress: user.progress,
        steps: user.steps,
        isApproved: user.isApproved,
        constructionDetails: user.constructionDetails,
        startProject: user.startProject,
        twoDDesigns: user.twoDDesigns,
        threeDDesigns: user.threeDDesigns,
        paymentSchedule: user.paymentSchedule,
    }

    res.status(statusCode).cookie("token", token, options).json({ success: true, message, user: userData, setToken: token });
};