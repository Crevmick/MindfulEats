import jwt from 'jsonwebtoken';

const { TOKEN_KEY, TOKEN_EXPIRY } = process.env;

const createToken = async (user, tokenKey = TOKEN_KEY, expiresIn = TOKEN_EXPIRY) => {
  try {
    const tokenData = {
       userId: user._id,
       role: user.role, 
    };

    // Generate the token with the user data and expiry
    const token = jwt.sign(tokenData, tokenKey, { expiresIn });
    return token;
  } catch (error) {
    throw error;
  }
};

export default createToken;
