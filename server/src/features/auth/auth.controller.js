import {
  registerUser,
  loginUser,
  generateToken,
  getUserById,
  updateUserProfile,
  toggleWishlistService,
  getWishlistService,
  generatePasswordResetTokenService,
  resetPasswordWithTokenService,
} from './auth.service.js';
import { User } from './user.model.js';

export const register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, phone } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields (firstName, lastName, email, password).',
      });
    }

    const cleanPhone = phone ? String(phone).replace(/[\s-]/g, '').trim() : '';
    if (!cleanPhone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required. Please provide a valid Pakistani mobile number.',
      });
    }

    if (!/^\d+$/.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        message: 'Phone number must contain digits only.',
      });
    }

    if (cleanPhone.startsWith('03')) {
      if (cleanPhone.length !== 11) {
        return res.status(400).json({
          success: false,
          message: `Pakistani mobile number must be exactly 11 digits (e.g. 03000000000). Received ${cleanPhone.length} digits.`,
        });
      }
    } else if (cleanPhone.length < 8 || cleanPhone.length > 15) {
      return res.status(400).json({
        success: false,
        message: `Telephone number must be between 8 and 11digits. Received ${cleanPhone.length} digits.`,
      });
    }

    const user = await registerUser({ firstName, lastName, email, password, phone: cleanPhone });
    const token = generateToken(res, user._id);

    res.status(201).json({
      success: true,
      token,
      data: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        vipTier: user.vipTier,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const user = await loginUser(email, password);
    const token = generateToken(res, user._id);

    res.status(200).json({
      success: true,
      token,
      data: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        vipTier: user.vipTier,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res) => {
  res.cookie('atelier_token', '', {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({
    success: true,
    message: 'Patron session successfully terminated.',
  });
};

export const getMe = async (req, res, next) => {
  try {
    const user = await getUserById(req.user.id || req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, phone, measurementsProfile, addresses } = req.body;
    const updatedUser = await updateUserProfile(req.user.id || req.user._id, {
      firstName,
      lastName,
      phone,
      measurementsProfile,
      addresses,
    });

    res.status(200).json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

export const toggleWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required.' });
    }
    const userId = req.user.id || req.user._id;
    const wishlist = await toggleWishlistService(userId, productId);
    res.status(200).json({
      success: true,
      message: 'Wishlist updated successfully.',
      data: wishlist,
    });
  } catch (error) {
    next(error);
  }
};

export const getWishlist = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const wishlist = await getWishlistService(userId);
    res.status(200).json({
      success: true,
      data: wishlist,
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }
    const result = await generatePasswordResetTokenService(email);
    res.status(200).json({
      success: true,
      message: 'Password reset instructions have been generated.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ success: false, message: 'Token and new password are required.' });
    }
    const user = await resetPasswordWithTokenService(token, password);
    const jwtToken = generateToken(res, user._id);
    res.status(200).json({
      success: true,
      message: 'Password has been successfully updated. You are now authenticated.',
      token: jwtToken,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

