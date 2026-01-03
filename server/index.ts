import express from 'express';
import { Request, Response, NextFunction } from 'express';
import sectionRoutes from './routes/sectionRoutes';
import instructorRoutes from './routes/instructorRoutes';
import departmentRoutes from './routes/departmentRoutes';
import courseRoutes from './routes/courseRoutes';
import prisma from './prismaClient';

const app = express();
const PORT = process.env.PORT || 1337;

// Middleware to parse incoming JSON requests
app.use(express.json());

// Route handlers for different API resources
app.use('/api/sections', sectionRoutes);
app.use('/api/instructors', instructorRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/courses', courseRoutes);

// Global error handler for catching unhandled errors in routes or middleware
app.use((error: any, req: Request, res: Response, next: NextFunction) => {
    console.error('Global error handler: ', error);
    res.status(500).json({ error: 'Internal Server Error' });
});

// Start the Express server
app.listen(PORT, () => {
    console.log(`Server running on PORT:${PORT}`);
});

// Gracefully disconnect Prisma client on application termination
process.on('SIGINT', async () => {
    await prisma.$disconnect();
    process.exit(0);
});
