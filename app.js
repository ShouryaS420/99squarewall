import express from "express";
import projectDetails from './routers/projectDetails.js';
import user from './routers/user.js';
import familyMember from './routers/familyMember.js';
import raiseTicket from './routers/raiseTicket.js';
import uploadRoutes from './routers/uploadRoutes.js';
import designRoutes from './routers/designRoutes.js';

import cookieParser from "cookie-parser";
import cors from "cors";

export const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());

// Use project routes
app.use('/api/projects', projectDetails);

// Use user routes
app.use('/api/user', user);

// Use familyMember routes
app.use('/api/familyMember', familyMember);

// Use familyMember routes
app.use('/api/raiseTicket', raiseTicket);

// Use upload images routes
app.use('/api/uploadImage', uploadRoutes);

// Use upload images routes
app.use('/api/designs', designRoutes);