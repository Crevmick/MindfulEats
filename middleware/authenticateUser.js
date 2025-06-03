import jwt from 'jsonwebtoken';

const authenticateUser = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    try {
        const decoded = jwt.verify(token, process.env.TOKEN_KEY);
        req.user = {
            userId: decoded.userId || user._id,
            role: decoded.role,
        };
        
        // Ensure that a response is not already sent before calling next
        if (!res.headersSent) {
            return next();
        }
    } catch (error) {
        if (!res.headersSent) {
            return res.status(401).json({ error: 'Invalid token' });
        }
    }
}

export default authenticateUser;
