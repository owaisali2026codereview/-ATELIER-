import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { User } from './user.model.js';

// In-memory cache for emergency fallback, initialized cleanly without hardcoded plaintext secrets
let memoryUsers = [];

export const generateToken = (res, userId) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('Fatal Security Exception: JWT_SECRET environment variable is missing.');
  }

  const token = jwt.sign({ id: userId }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

  // Attach HTTP-only cookie if res object is provided
  if (res && res.cookie) {
    res.cookie('atelier_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  return token;
};

export const registerUser = async (userData) => {
  const { firstName, lastName, email, password, phone } = userData;
  const normalizedEmail = email.toLowerCase().trim();

  // If MongoDB is connected, execute in DB
  if (mongoose.connection.readyState === 1) {
    try {
      const userExists = await User.findOne({ email: normalizedEmail });
      if (userExists) {
        throw new Error('An account with this email address is already registered.');
      }

      const user = await User.create({
        firstName,
        lastName,
        email: normalizedEmail,
        password,
        phone,
      });

      return user;
    } catch (err) {
      if (err.message.includes('already registered')) throw err;
      console.warn('[Register DB Fallback]: Falling back to local memory store', err.message);
    }
  }

  // Fallback: in-memory store
  const existing = memoryUsers.find((u) => u.email === normalizedEmail);
  if (existing) {
    throw new Error('An account with this email address is already registered.');
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const newUser = {
    _id: `usr_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email: normalizedEmail,
    passwordHash,
    role: 'customer',
    vipTier: 'Standard',
    phone: phone || '',
    addresses: [],
    measurementsProfile: {
      bustChest: 38,
      naturalWaist: 32,
      hips: 38,
      shoulderWidth: 17.5,
      height: '5 ft 10 in',
      unit: 'in',
    },
    wishlist: [],
    createdAt: new Date().toISOString(),
  };

  memoryUsers.push(newUser);
  return newUser;
};

export const loginUser = async (email, password) => {
  const normalizedEmail = email.toLowerCase().trim();

  // 1. Primary Authentication: MongoDB with bcrypt
  if (mongoose.connection.readyState === 1) {
    try {
      const user = await User.findOne({ email: normalizedEmail }).select('+password');
      if (user && (await user.matchPassword(password))) {
        return user;
      }
    } catch (err) {
      console.warn('[Login DB Error]:', err.message);
    }
  }

  // 2. Fallback memory verification with bcrypt hash compare
  const memUser = memoryUsers.find((u) => u.email === normalizedEmail);
  if (memUser && memUser.passwordHash) {
    const passwordMatches = await bcrypt.compare(password, memUser.passwordHash);
    if (passwordMatches) {
      return memUser;
    }
  }

  // 3. Fallback master admin check from environment
  const envAdminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase();
  const envAdminPass = process.env.ADMIN_PASSWORD;
  const envAdminName = process.env.ADMIN_NAME || 'Admin';
  if (envAdminEmail && envAdminPass && normalizedEmail === envAdminEmail && password === envAdminPass) {
    return {
      _id: 'usr_admin_master',
      firstName: envAdminName,
      lastName: 'Admin',
      email: envAdminEmail,
      role: 'super_admin',
      vipTier: 'Gold Needle',
    };
  }

  throw new Error('Invalid email or password credentials.');
};

export const getUserById = async (id) => {
  if (mongoose.connection.readyState === 1) {
    try {
      const user = await User.findById(id).select('-password').populate('wishlist');
      if (user) return user;
    } catch (err) {
      // fallback
    }
  }

  if (id === 'usr_admin_master') {
    return {
      _id: 'usr_admin_master',
      id: 'usr_admin_master',
      firstName: process.env.ADMIN_NAME || 'Admin',
      lastName: 'Admin',
      email: (process.env.ADMIN_EMAIL || '').toLowerCase(),
      role: 'super_admin',
      vipTier: 'Gold Needle',
    };
  }

  return memoryUsers.find((u) => u._id.toString() === id.toString()) || null;
};

export const updateUserProfile = async (id, updateData) => {
  if (mongoose.connection.readyState === 1) {
    try {
      const user = await User.findById(id);
      if (user) {
        if (updateData.firstName) user.firstName = updateData.firstName;
        if (updateData.lastName) user.lastName = updateData.lastName;
        if (updateData.phone !== undefined) user.phone = updateData.phone;
        if (updateData.measurementsProfile) user.measurementsProfile = updateData.measurementsProfile;
        if (updateData.addresses) user.addresses = updateData.addresses;
        return await user.save();
      }
    } catch (err) {
      console.warn('[UpdateProfile DB Fallback]: Updating memory user instead', err.message);
    }
  }

  const memUser = memoryUsers.find((u) => u._id.toString() === id.toString());
  if (memUser) {
    if (updateData.firstName) memUser.firstName = updateData.firstName;
    if (updateData.lastName) memUser.lastName = updateData.lastName;
    if (updateData.phone !== undefined) memUser.phone = updateData.phone;
    if (updateData.measurementsProfile) memUser.measurementsProfile = updateData.measurementsProfile;
    if (updateData.addresses) memUser.addresses = updateData.addresses;
    return memUser;
  }

  throw new Error('User account not found.');
};

export const toggleWishlistService = async (userId, productId) => {
  if (mongoose.connection.readyState === 1) {
    try {
      const user = await User.findById(userId);
      if (user) {
        if (!user.wishlist) user.wishlist = [];
        const prodIdStr = productId.toString();
        const existsIndex = user.wishlist.findIndex((id) => id.toString() === prodIdStr);
        if (existsIndex > -1) {
          user.wishlist.splice(existsIndex, 1);
        } else {
          user.wishlist.push(productId);
        }
        await user.save();
        await user.populate('wishlist');
        return user.wishlist;
      }
    } catch (err) {
      console.warn('[ToggleWishlist DB Error]:', err.message);
    }
  }

  const memUser = memoryUsers.find((u) => u._id.toString() === userId.toString());
  if (memUser) {
    if (!memUser.wishlist) memUser.wishlist = [];
    const prodIdStr = productId.toString();
    const existsIndex = memUser.wishlist.findIndex((id) => (id._id || id).toString() === prodIdStr);
    if (existsIndex > -1) {
      memUser.wishlist.splice(existsIndex, 1);
    } else {
      memUser.wishlist.push(productId);
    }
    return memUser.wishlist;
  }
  return [];
};

export const getWishlistService = async (userId) => {
  if (mongoose.connection.readyState === 1) {
    try {
      const user = await User.findById(userId).populate('wishlist');
      if (user) return user.wishlist || [];
    } catch (err) {
      console.warn('[GetWishlist DB Error]:', err.message);
    }
  }

  const memUser = memoryUsers.find((u) => u._id.toString() === userId.toString());
  return memUser?.wishlist || [];
};

export const generatePasswordResetTokenService = async (email) => {
  const normalizedEmail = (email || '').trim().toLowerCase();
  let user = null;

  if (mongoose.connection.readyState === 1) {
    try {
      user = await User.findOne({ email: normalizedEmail });
    } catch (err) {
      // fallback
    }
  }

  if (!user) {
    user = memoryUsers.find((u) => u.email === normalizedEmail);
  }

  if (!user) {
    throw new Error('No account found with this email address.');
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
  const expire = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

  if (mongoose.connection.readyState === 1 && user.save) {
    user.resetPasswordToken = tokenHash;
    user.resetPasswordExpire = expire;
    await user.save();
  } else {
    user.resetPasswordToken = tokenHash;
    user.resetPasswordExpire = expire;
  }

  const clientUrl = process.env.CLIENT_URL;
  const resetUrl = `${clientUrl}/account?resetToken=${resetToken}&email=${encodeURIComponent(normalizedEmail)}`;

  return {
    resetToken,
    resetUrl,
    message: `Password reset instructions have been generated. Link: ${resetUrl}`,
  };
};

export const resetPasswordWithTokenService = async (resetToken, newPassword) => {
  if (!newPassword || newPassword.length < 6) {
    throw new Error('Password must be at least 6 characters.');
  }

  const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
  let user = null;

  if (mongoose.connection.readyState === 1) {
    try {
      user = await User.findOne({
        resetPasswordToken: tokenHash,
        resetPasswordExpire: { $gt: Date.now() },
      }).select('+password');
    } catch (err) {
      // fallback
    }
  }

  if (!user) {
    user = memoryUsers.find(
      (u) =>
        u.resetPasswordToken === tokenHash &&
        u.resetPasswordExpire &&
        new Date(u.resetPasswordExpire) > new Date()
    );
  }

  if (!user) {
    throw new Error('Invalid or expired password reset token. Please request a new link.');
  }

  if (mongoose.connection.readyState === 1 && user.save) {
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
  } else {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    delete user.resetPasswordToken;
    delete user.resetPasswordExpire;
  }

  return {
    _id: user._id || user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    vipTier: user.vipTier,
  };
};
