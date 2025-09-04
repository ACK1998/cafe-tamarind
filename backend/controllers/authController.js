const User = require('../models/User');
const OTP = require('../models/OTP');
const generateToken = require('../utils/generateToken');
const smsService = require('../utils/smsService');
const { validationResult } = require('express-validator');
const { 
  successResponse, 
  errorResponse, 
  validationErrorResponse,
  unauthorizedResponse 
} = require('../utils/response');
const { isValidPhone } = require('../utils/validation');

// Generate OTP
const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

// @desc    Generate OTP for customer verification
// @route   POST /api/auth/generate-otp
// @access  Public
const generateOTPForCustomer = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return errorResponse(res, 'Phone number is required', 400);
    }

    if (!isValidPhone(phone)) {
      return errorResponse(res, 'Invalid phone number format', 400);
    }

    // Check if there's already an active OTP for this phone
    const existingOTP = await OTP.findOne({ 
      phone, 
      expiresAt: { $gt: new Date() },
      isVerified: false 
    });

    if (existingOTP) {
      const timeLeft = Math.ceil((existingOTP.expiresAt - new Date()) / 1000 / 60);
      return errorResponse(res, `Please wait ${timeLeft} minutes before requesting a new OTP`, 429);
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + (5 * 60 * 1000)); // 5 minutes
    
    // Save OTP to database
    const otpRecord = await OTP.create({
      phone,
      otp,
      expiresAt
    });

    // Send OTP via SMS service
    const smsSent = await smsService.sendOTP(phone, otp);
    
    if (!smsSent) {
      // If SMS fails, delete the OTP record
      await OTP.findByIdAndDelete(otpRecord._id);
      return errorResponse(res, 'Failed to send OTP. Please try again.', 500);
    }

    return successResponse(res, {
      phone,
      expiresIn: '5 minutes',
      message: process.env.NODE_ENV === 'development' 
        ? 'OTP sent successfully. Check server console for OTP in development mode.'
        : 'OTP sent successfully to your phone.'
    }, 'OTP sent successfully');
  } catch (error) {
    console.error('Generate OTP error:', error);
    return errorResponse(res, 'Server error');
  }
};

// @desc    Verify OTP for customer
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    console.log(`🔍 Verifying OTP: ${otp} for phone: ${phone}`);

    if (!phone || !otp) {
      console.log('❌ Missing phone or OTP');
      return errorResponse(res, 'Phone number and OTP are required', 400);
    }

    // Find the most recent OTP for this phone
    const otpRecord = await OTP.findOne({ 
      phone, 
      isVerified: false 
    }).sort({ createdAt: -1 });

    console.log('🔍 Found OTP record:', otpRecord ? {
      id: otpRecord._id,
      phone: otpRecord.phone,
      otp: otpRecord.otp,
      attempts: otpRecord.attempts,
      expiresAt: otpRecord.expiresAt,
      isVerified: otpRecord.isVerified
    } : 'No record found');

    if (!otpRecord) {
      console.log('❌ OTP not found');
      return errorResponse(res, 'OTP not found. Please request a new OTP.', 400);
    }

    // Check if OTP has expired
    if (new Date() > otpRecord.expiresAt) {
      console.log('❌ OTP expired');
      await OTP.findByIdAndDelete(otpRecord._id);
      return errorResponse(res, 'OTP has expired. Please request a new OTP.', 400);
    }

    // Check if too many attempts
    if (otpRecord.attempts >= 5) {
      console.log('❌ Too many attempts');
      await OTP.findByIdAndDelete(otpRecord._id);
      return errorResponse(res, 'Too many failed attempts. Please request a new OTP.', 400);
    }

    // Verify OTP
    console.log(`🔍 Comparing OTP: ${otp} with stored: ${otpRecord.otp}`);
    if (otpRecord.otp !== otp) {
      console.log('❌ OTP mismatch');
      // Increment attempts
      await OTP.findByIdAndUpdate(otpRecord._id, { 
        $inc: { attempts: 1 } 
      });
      
      const remainingAttempts = 5 - (otpRecord.attempts + 1);
      return errorResponse(res, `Invalid OTP. ${remainingAttempts} attempts remaining.`, 400);
    }

    // Mark OTP as verified
    await OTP.findByIdAndUpdate(otpRecord._id, { 
      isVerified: true 
    });

    console.log(`✅ OTP verified successfully for ${phone}`);

    return successResponse(res, null, 'OTP verified successfully');
  } catch (error) {
    console.error('Verify OTP error:', error);
    return errorResponse(res, 'Server error');
  }
};

// @desc    Admin login
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return validationErrorResponse(res, errors.array());
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return unauthorizedResponse(res, 'Invalid credentials');
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      return unauthorizedResponse(res, 'Access denied. Admin privileges required.');
    }

    // Check if user is active
    if (!user.isActive) {
      return unauthorizedResponse(res, 'Account is deactivated');
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return unauthorizedResponse(res, 'Invalid credentials');
    }

    return successResponse(res, {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token: generateToken(user._id)
    }, 'Login successful');
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse(res, 'Server error');
  }
};

// @desc    Get current admin user
// @route   GET /api/auth/me
// @access  Private/Admin
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user || user.role !== 'admin') {
      return unauthorizedResponse(res, 'Access denied. Admin privileges required.');
    }
    
    return successResponse(res, user, 'User data retrieved successfully');
  } catch (error) {
    console.error('Get me error:', error);
    return errorResponse(res, 'Server error');
  }
};

// @desc    Update admin profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return validationErrorResponse(res, errors.array());
    }

    const { name, email, phone, currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return notFoundResponse(res, 'User not found');
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return errorResponse(res, 'Email is already taken', 400);
      }
    }

    // Update basic info
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;

    // Handle password change
    if (newPassword) {
      if (!currentPassword) {
        return errorResponse(res, 'Current password is required to change password', 400);
      }

      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        return errorResponse(res, 'Current password is incorrect', 400);
      }

      user.password = newPassword; // Will be hashed by pre-save hook
    }

    await user.save();

    // Return updated user without password
    const updatedUser = await User.findById(userId).select('-password');

    return successResponse(res, updatedUser, 'Profile updated successfully');
  } catch (error) {
    console.error('Update profile error:', error);
    return errorResponse(res, 'Server error');
  }
};

module.exports = {
  login,
  getMe,
  generateOTPForCustomer,
  verifyOTP,
  updateProfile
};
