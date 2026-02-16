
import jwt from 'jsonwebtoken';

const issueToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
};

export { issueToken };
