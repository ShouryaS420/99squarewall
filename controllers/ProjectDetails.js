import mongoose from 'mongoose';
import Project from '../models/ProjectDetails.js';
import User from '../models/User.js';

function generateProjectId() {
    const prefix = "PRJ";
    const randomNumber = Math.floor(Math.random() * 10000000); // Generates a random number
    return `${prefix}${randomNumber.toString().padStart(7, '0')}`; // Ensures the number is 7 digits long
}

const predefinedSteps = [
    {
        title: "Initial Contact",
        description: "It was nice talking to you. Explore about us and our featured services.",
        status: "completed",
        subSteps: []
    },
    {
        title: "Meeting Confirmation",
        description: "It was great meeting with you. Kindly view the details.",
        status: "completed",
        subSteps: []
    },
    {
        title: "Package Discovery",
        description: "Discover Packages, Materials and Designs. We are working on your Quotation.",
        status: "ongoing-stage",
        subSteps: []
    },
    {
        title: "Architect Meeting",
        description: "Schedule Architect Meeting. You can Book a CEM only after your first meeting!",
        status: "",
        subSteps: []
    },
    {
        title: "Booking Amount Collection",
        description: "Proceed to secure your booking with an initial payment.",
        subSteps: [],
        status: "",
    },
    {
        title: "Pre-Project Readiness",
        description: "Pre-Project Readiness Checklist - Ensuring everything is set before commencement.",
        subSteps: [
            { title: "Handover Checklist", description: "Get information about transition from Technical Consultant to Design phase." },
            { title: "Soil Testing", description: "Soil Testing not started yet. Info available here." },
            { title: "Digital Survey", description: "Digital Survey not started yet. Info available here." },
            { title: "Architect Assignment", description: "An architect has been assigned to your project." },
            { title: "Design Requirements Pending", description: "Pending submission of specific design requirements." },
            { title: "Floor Plan Development", description: "2D-Floor Plan not started yet. Info available here." },
            { title: "Structural Drawing", description: "Structural Drawing not started yet. Info available here." },
            { title: "Elevation Requirements", description: "We are yet to start the elevation drawing but you can get information about it here for now." },
            { title: "Elevation Designs", description: "We are yet to start the elevation designs." }
        ],
        status: "",
    },
    {
        title: "Design Phase",
        description: "Moving forward with the design specifics of your project.",
        subSteps: [],
        status: "",
    },
    {
        title: "Contractor Allotment",
        description: "Assigning a contractor to commence the construction phase.",
        subSteps: [],
        status: "",
    },
    {
        title: "Project Management Handover",
        description: "Handover to Project Management Team to kickstart the project according to the planned schedule.",
        subSteps: [],
        status: "",
    }
];

// Controller to create a new project
export const createProject = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        session.startTransaction();
        
        const { clientName, clientEmail, clientMobile, clientCity, projectType, plotInformation, newlyAdded } = req.body;

        // Validation: Check if any of the required fields are empty
        if (!clientName || !clientEmail || !clientMobile || !clientCity || !projectType) {
            return res.status(400).json({ message: 'All fields must be filled.', success: false });
        }

        // Additional validation to check if plot information fields are filled
        const { areaOfPlot, length, breadth, plotLocation } = plotInformation;
        if (!areaOfPlot || !length || !breadth || !plotLocation) {
            return res.status(400).json({ message: 'All plot information fields must be filled.', success: false });
        }

        const userId = generateProjectId(); // Ensure this ID is unique and correctly generated

        // Create or update user details
        const user = await User.findOneAndUpdate({ userId: userId }, {
            username: clientName,
            email: clientEmail,
            mobile: clientMobile,
            projectType: projectType,
            plotInformation: plotInformation,
            steps: predefinedSteps,
        }, { new: true, upsert: true, session }); // upsert will create a new doc if none match

        if (!user) {
            return res.status(400).json({ message: 'already exist', success: false });
        }

        const newProject = new Project({
            projectId: userId,
            clientName,
            clientEmail,
            clientMobile,
            clientCity,
            projectType,
            plotInformation,
            newlyAdded,
            steps: predefinedSteps,
        });

        const saveProjectsDetails = await newProject.save({ session });

        await session.commitTransaction();
        res.status(201).json({ message: "Project Created Successfully", success: true, data: saveProjectsDetails });
    } catch (error) {
        console.error('Transaction error:', error); // Enhanced logging
        await session.abortTransaction();
        res.status(500).json({ message: 'Server error', error: error.message, success: false });
    } finally {
        session.endSession();
    }
};

export const getProjects = async (req, res) => {
    try {
        const projects = await Project.find();
        res.status(200).json(projects);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching projects', error: error.message });
    }
};

export const approveProjects = async (req, res) => {
    try {
        const { id } = req.params;
        // Fetch the project including the user information to validate existence
        const project = await Project.findById(id).populate('projectId');  // Assuming 'projectId' is populated to fetch user details
        if (!project) {
            return res.status(404).json({ message: 'Project not found', success: false, });
        }
        if (!project.projectId) {
            return res.status(404).json({ message: 'No user associated with this project', success: false, });
        }

        // Check if the user still exists in the database
        const user = await User.findOne({ userId: project.projectId });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update the user's approval status
        user.isApproved = true;
        await user.save();

        // Update the project's status
        project.status = 'Approved';
        project.newlyAdded = 'false';
        project.yetToClose = 'true';
        await project.save();

        res.json({ message: 'Project approved successfully', project, user, success: true, });
    } catch (error) {
        console.error('Error approving the project:', error);
        res.status(500).json({ message: 'Error approving the project', error: error.message, success: false, });
    }
};

export const quotationDetailsUpdate = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            finalPackageCost,
            selectedPackage,
            totalPackageCost,
            plotArea,
            plinthBuiltUpArea,
            parkingGroundArea,
            configuration,
            discountType,
            discountValue,
            isDiscountApplied,
            plinthHeight,
            configurationName,
            floors,
            packageDetails,
        } = req.body;

        const project = await Project.findById(id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found', success: false, });
        }

        // Check if the user still exists in the database
        const user = await User.findOne({ userId: project.projectId });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.constructionDetails.push(req.body);
        user.save();

        project.constructionDetails.push(req.body);
        project.save();

        res.json({ message: 'construction details updated successfully', project, success: true, });
        
    } catch (error) {
        console.error('Error updating construction details:', error);
        res.status(500).json({ message: 'Error updating construction details', error: error.message, success: false, });
    }
} 