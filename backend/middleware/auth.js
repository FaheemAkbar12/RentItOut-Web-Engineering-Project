const { clerkClient } = require('@clerk/clerk-sdk-node');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'No authentication token provided'
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify the session token with Clerk
    const session = await clerkClient.sessions.verifySession(token);

    if (!session) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid or expired token'
      });
    }

    // Get user data from Clerk
    const user = await clerkClient.users.getUser(session.userId);

    // Attach user info to request
    req.user = {
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress,
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: user.imageUrl
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({
      status: 'error',
      message: 'Authentication failed',
      error: error.message
    });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const session = await clerkClient.sessions.verifySession(token);

      if (session) {
        const user = await clerkClient.users.getUser(session.userId);
        req.user = {
          id: user.id,
          email: user.emailAddresses[0]?.emailAddress,
          firstName: user.firstName,
          lastName: user.lastName,
          imageUrl: user.imageUrl
        };
      }
    }

    next();
  } catch (error) {
    // Continue without auth if token is invalid
    next();
  }
};

module.exports = { authenticate, optionalAuth };
