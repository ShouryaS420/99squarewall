// Importing modules using ES6 import syntax
import mongoose from 'mongoose';

const { Schema, model } = mongoose;

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

const constructionDetailsSchema = new Schema({
    finalPackageCost: { type: String, },
    selectedPackage: { type: String, },
    totalPackageCost: { type: String, },
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

const projectSchema = new Schema({
    projectId: { type: String, required: true },
    clientName: { type: String, required: true },
    clientEmail: { type: String, required: true },
    clientMobile: { type: String, required: true },
    clientCity: { type: String, required: true },
    projectType: { type: String, required: true },
    plotInformation: {
        areaOfPlot: { type: String, },
        length: { type: String },
        breadth: { type: String },
        plotLocation: { type: String }
    },
    specifications: {
        startDate: { type: Date, },
        endDate: { type: Date },
        details: { type: String },
        estimatedCost: { type: Number }
    },
    offers: [{
        offerType: { type: String },
        offerDetails: { type: String },
        validUntil: { type: Date }
    }],
    status: { 
        type: String,
        enum: ['Pending', 'Approved', 'Active', 'On Hold', 'Completed'], 
        default: 'Pending'
    },
    startProject: { type: Boolean, default: false },
    twoDDesigns: [designArray],
    threeDDesigns: [designArray],
    paymentSchedule: { type: Array, default: [] },
    currentPhase: { type: String, default: '-' },
    progress: { type: String, default: '0%' },
    steps: [stepSchema],
    newlyAdded: { type: String, default: 'false' },
    yetToClose: { type: String, default: 'false' },
    ongoing: { type: String, default: 'false' },
    onHold: { type: String, default: 'false' },
    completed: { type: String, default: 'false' },
    tokenAmount: { type: Number },
    approvalDate: { type: Date },
    constructionDetails: [constructionDetailsSchema],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Exporting using ES6 export syntax
export default model('project-details', projectSchema);
