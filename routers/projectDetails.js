// Importing express and controllers
import express from 'express';
import {
    approveProjects,
    createProject,
    getProjects,
    quotationDetailsUpdate,
} from '../controllers/ProjectDetails.js';

const router = express.Router();

router.post('/createProject', createProject);

// Route to get all projects
router.get('/getProjects', getProjects);

// Route to approved user by id
router.patch('/approveProjects/:id', approveProjects);

// Route to update quotation details by id
router.patch('/quotationDetailsUpdate/:id', quotationDetailsUpdate);

export default router;
