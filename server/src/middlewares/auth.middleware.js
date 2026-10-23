import jwt from 'jsonwebtoken';
import { User } from '../features/auth/user.model.js';
import { getUserById } from '../features/auth/auth.service.js';

export const protect = async (req, res, next) => {
  // Allow development / admin IDE requests with x-admin-dev header
  if (process.env.NODE_ENV !== 'production' && req.headers['x-admin-dev'] === 'true') {
    try {
      const devAdmin = (await User.findOne({ role: 'super_admin' })) || {
        _id: '6ad9ff6a372ebe8f17e62198',
        email: 'owais@gmail.com',
        role: 'super_admin',
      };
      req.user = devAdmin;
      return next();
    } catch (err) {
      req.user = {
        _id: '6ad9ff6a372ebe8f17e62198',
        email: 'owais@gmail.com',
        role: 'super_admin',
      };
      return next();
    }
  }

  let token;

  // 1. Check HTTP-only cookie
  if (req.cookies && req.cookies.atelier_token) {
    token = req.cookies.atelier_token;
  }
  // 2. Check Authorization Bearer header
  else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized: No authentication token provided.',
    });
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({
        success: false,
        message: 'Server security configuration error: JWT_SECRET is missing.',
      });
    }
    const decoded = jwt.verify(token, secret);
    const user = await getUserById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized: Token verification failed.',
    });
  }
};

export const optionalAuth = async (req, res, next) => {
  let token;
  if (req.cookies && req.cookies.atelier_token) {
    token = req.cookies.atelier_token;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const secret = process.env.JWT_SECRET;
      if (secret) {
        const decoded = jwt.verify(token, secret);
        req.user = await getUserById(decoded.id);
      }
    } catch (err) {
      // Ignored for optional auth (treat as guest)
    }
  }
  next();
};

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Role '${req.user ? req.user.role : 'Guest'}' lacks access clearance for this resource.`,
      });
    }
    next();
  };
};
