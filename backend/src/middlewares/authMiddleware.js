import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Authorization
export const protectedRoute = (req, res, next) => {
    try {
        // Take token from Authorization header
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>
        
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // Validate token presence
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async(err, decodedUser) => {
            if (err) {
                return res.status(403).json({ message: 'Unauthorized' });
            }

            const user = await User.findById(decodedUser.userId).select('-hashedPassword');

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            
            req.user = user;
            next();
        });
        // Find user by ID from token payload

        // Attach user to request object
    }
    catch (error) {
        console.error('Error in auth middleware:', error);
        return res.status(401).json({ message: 'Unauthorized' });
    }
};