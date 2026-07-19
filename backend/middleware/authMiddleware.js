const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  __internal: {
    engine: {
      type: 'library'
    }
  }
});

exports.verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // 1. Check for missing header
  if (!authHeader) {
    return res.status(401).json({ 
      message: "No token provided, authorization denied" 
    });
  }

  try {
    // 2. Support JWT Bearer auth
    if (authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      return next();
    }

    // 3. Support Basic auth for Swagger "Authorize" with email/password
    if (authHeader.startsWith('Basic ')) {
      const base64Credentials = authHeader.split(' ')[1];
      const credentials = Buffer.from(base64Credentials, 'base64').toString('utf8');
      const separatorIndex = credentials.indexOf(':');

      if (separatorIndex === -1) {
        return res.status(401).json({ message: 'Invalid basic auth format' });
      }

      const email = credentials.slice(0, separatorIndex);
      const password = credentials.slice(separatorIndex + 1);

      if (!email || !password) {
        return res.status(401).json({ message: 'Email and password are required' });
      }

      const user = await prisma.user.findUnique({ where: { email } });

      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      req.user = { id: user.id, email: user.email, role: user.role };
      return next();
    }

    return res.status(401).json({
      message: 'Unsupported authorization scheme. Use Bearer or Basic.'
    });
  } catch (err) {
    // 4. Handle JWT and auth parsing errors
    const errorMessage = err.name === 'TokenExpiredError' 
      ? "Token has expired" 
      : "Token is not valid";
      
    res.status(401).json({ message: errorMessage });
  }
};

exports.isAdmin = (req, res, next) => {
  // Check if verifyToken was called first and if the role matches
  if (req.user && req.user.role === "ADMIN") {
    next();
  } else {
    res.status(403).json({ 
      message: "Access denied. Admin privileges required." 
    });
  }
};