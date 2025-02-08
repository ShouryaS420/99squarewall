import mongoose from 'mongoose';
import jwt from "jsonwebtoken";
const { Schema } = mongoose;

const subStepSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true }
}, { _id: false });  // _id set to false if you do not want MongoDB to automatically generate _id for sub-steps

const stepSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, enum: ['completed', 'ongoing-stage', ''] }, // Enum to control status values
    subSteps: [subStepSchema]  // Embedding sub-steps using the defined schema
}, { _id: false }); // Optionally disable _id for steps if not required

const packageSchema = new Schema({
    packageName: { type: String, required: true },
    packagePrice: { type: String, required: true },
    price: { type: String, },
    categories: [{
        category: { type: String, required: true },
        details: [{
            heading: { type: String, required: true },
            description: [{ type: String, required: true }],
            additional: { type: String },
            specialConsideration: { type: String },
            material: { type: String },
            cost: { type: String },
            deliverables: [{ type: String }]
        }]
    }]
}, { timestamps: true });

const commentSchema = new Schema({
    designId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Design',
        required: true
    },
    comment: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const constructionDetailsSchema = new Schema({
    finalPackageCost: { type: String, },
    totalPackageCost: { type: String, },
    selectedPackage: { type: String, },
    plotArea: { type: String, },
    plinthBuiltUpArea: { type: String, },
    parkingGroundArea: { type: String, },
    configuration: { type: String, },
    discountType: { type: String, },
    discountValue: { type: String, },
    isDiscountApplied: { type: String, },
    plinthHeight: { type: String, },
    configurationName: { type: String, },
    floors: { type: Array, },
    packageDetails: [packageSchema],
    status: { 
        type: String,
        default: 'Pending',
    },
    requested: { type: Boolean, default: false },
    rejected: { type: Boolean, default: false },
    resubmit: { type: Boolean, default: false },
}, { timestamps: true });

const designArray = new Schema({
    name: { type: String, },
    imagesArray: { type: Array, },
}, { timestamps: true });

const userSchema = new Schema({
    mainUserID: { type: String, default: "" },
    familyMemberID: { type: String, default: "" },
    userId: { type: String, },
    username: { type: String, },
    email: {
        type: String,
    },
    mobile: {
        type: String,
    },
    familyMember: { type: Boolean, default: false },
    startProject: { type: Boolean, default: false },
    twoDDesigns: [commentSchema], // Using commentSchema to include comments for each design
    threeDDesigns: [commentSchema],
    paymentSchedule: { type: Array, default: [] },
    img: { type: String, default: "image" },
    alternateNumber: { type: String, default: "not-set" },
    projectType: { type: String, required: true },
    plotInformation: {
        areaOfPlot: { type: String, },
        length: { type: String },
        breadth: { type: String },
        plotLocation: { type: String }
    },
    currentPhase: { type: String, default: '-' },
    progress: { type: String, default: '0%' },
    steps: [stepSchema],
    isApproved: { type: Boolean, default: false },
    constructionDetails: [constructionDetailsSchema],
    otp: String,
    otpExpiresAt: Date,
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

userSchema.methods.getJWTToken = function () {
    return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000,
    })
}

export default mongoose.model('User', userSchema);
