import { StatusCodes } from 'http-status-codes';
import { User, USER_STATUS } from '~/models/userModel';
import { Profile } from '~/models/profileModel';
import { LoyaltyPoint } from '~/models/loyaltyPointModel';
import ApiError from '~/utils/ApiError';
import bcryptjs from 'bcryptjs';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { pickUser, pickUserWithProfile } from '~/utils/formatters';
import { WEBSITE_DOMAIN } from '~/utils/constants';
import { BrevoProvider } from '~/providers/BrevoProvider';
import { JwtProvider } from '~/providers/JwtProvider';
import { CloudinaryProvider } from '~/providers/CloudinaryProvider';
import env from '~/config/environment';

const register = async (reqBody) => {
  const { email, password, fullName, phone } = reqBody;

  // Check if email already exists
  const existingUser = await User.findOneByEmail(email);
  if (existingUser) {
    throw new ApiError(StatusCodes.CONFLICT, 'Email already registered.');
  }

  // Create new user
  const verifyToken = uuidv4();
  const newUser = await User.create({
    email,
    passwordHash: bcryptjs.hashSync(password, 10),
    verifyToken
  });

  // Create profile
  await Profile.create({
    userId: newUser._id,
    fullName: fullName || email.split('@')[0],
    phone: phone || null
  });

  // Initialize loyalty points
  await LoyaltyPoint.create({
    customerId: newUser._id,
    points: 0
  });

  // Send verification email
  const verificationLink = `${WEBSITE_DOMAIN}/verify-email?email=${email}&token=${verifyToken}`;
  const subject = 'Welcome to LaundryPro!  Verify your email';
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px">
      <h2 style="color: #2563eb;">Welcome to LaundryPro!</h2>
      <p>Thank you for signing up.  Please verify your email address by clicking the button below: </p>
      <p style="margin: 30px 0;">
        <a href="${verificationLink}" 
           style="background-color: #2563eb; color:  white; padding: 12px 30px; 
                  text-decoration: none; border-radius:  5px; display: inline-block;">
          Verify Email
        </a>
      </p>
      <p>Or copy and paste this link in your browser:</p>
      <p style="color: #6b7280; word-break: break-all;">${verificationLink}</p>
      <hr style="border: none; border-top:  1px solid #e5e7eb; margin: 30px 0;">
      <p style="color: #9ca3af; font-size: 12px;">
        If you didn't create an account with LaundryPro, please ignore this email.
      </p>
    </div>
  `;

  await BrevoProvider.sendEmail(email, subject, htmlContent);

  return pickUser(newUser);
};

const verifyEmail = async (reqBody) => {
  const { email, token } = reqBody;

  const user = await User.findOneByEmail(email);
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found.');
  }

  if (user.status === USER_STATUS.ACTIVE) {
    throw new ApiError(StatusCodes.CONFLICT, 'Email already verified.');
  }

  if (user.verifyToken !== token) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid verification token.');
  }

  const updatedUser = await User.updateUser(user._id, {
    verifyToken: null,
    status: USER_STATUS.ACTIVE
  });

  return pickUser(updatedUser);
};

const login = async (reqBody) => {
  const { email, password } = reqBody;

  const user = await User.findOneByEmail(email);
  if (!user) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid email or password.');
  }

  if (!bcryptjs.compareSync(password, user.passwordHash)) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid email or password.');
  }

  if (user.status === USER_STATUS.PENDING) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Please verify your email first.');
  }

  if (user.status === USER_STATUS.SUSPENDED) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Your account has been suspended.');
  }

  // Update last login
  await User.updateUser(user._id, { lastLogin: new Date() });

  // Get profile
  const profile = await Profile.findByUserId(user._id);

  // Generate tokens
  const tokenPayload = { _id: user._id, email: user.email, role: user.role };
  const accessToken = await JwtProvider.generateToken(
    tokenPayload,
    env.ACCESS_TOKEN_SECRET,
    env.ACCESS_TOKEN_LIFE
  );
  const refreshToken = await JwtProvider.generateToken(
    tokenPayload,
    env.REFRESH_TOKEN_SECRET,
    env.REFRESH_TOKEN_LIFE
  );

  return {
    accessToken,
    refreshToken,
    user: pickUserWithProfile(user, profile)
  };
};

const refreshToken = async (clientRefreshToken) => {
  const decoded = await JwtProvider.verifyToken(
    clientRefreshToken,
    env.REFRESH_TOKEN_SECRET
  );

  const tokenPayload = { _id: decoded._id, email: decoded.email, role: decoded.role };
  const accessToken = await JwtProvider.generateToken(
    tokenPayload,
    env.ACCESS_TOKEN_SECRET,
    env.ACCESS_TOKEN_LIFE
  );

  return { accessToken };
};

const forgotPassword = async (reqBody) => {
  const { email } = reqBody;

  const user = await User.findOneByEmail(email);
  if (!user) {
    // Don't reveal if email exists
    return;
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

  await User.updateUser(user._id, {
    passwordResetToken: resetToken,
    passwordResetExpires: resetExpires
  });

  const resetLink = `${WEBSITE_DOMAIN}/reset-password?email=${email}&token=${resetToken}`;
  const subject = 'Reset Your LaundryPro Password';
  const htmlContent = `
    <div style="font-family:  Arial, sans-serif; max-width:  600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Password Reset Request</h2>
      <p>You requested to reset your password.  Click the button below to proceed:</p>
      <p style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" 
           style="background-color: #2563eb; color: white; padding: 12px 30px; 
                  text-decoration: none; border-radius: 5px; display: inline-block;">
          Reset Password
        </a>
      </p>
      <p>This link will expire in 30 minutes. </p>
      <p style="color: #6b7280; word-break: break-all;">${resetLink}</p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin:  30px 0;">
      <p style="color: #9ca3af; font-size: 12px;">
        If you didn't request this, please ignore this email. 
      </p>
    </div>
  `;

  await BrevoProvider.sendEmail(email, subject, htmlContent);
};

const resetPassword = async (reqBody) => {
  const { email, token, newPassword } = reqBody;

  const user = await User.findOneByEmail(email);
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found.');
  }

  if (user.passwordResetToken !== token) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid reset token.');
  }

  if (new Date() > user.passwordResetExpires) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Reset token has expired.');
  }

  await User.updateUser(user._id, {
    passwordHash: bcryptjs.hashSync(newPassword, 10),
    passwordResetToken: null,
    passwordResetExpires: null
  });
};

const changePassword = async (userId, reqBody) => {
  const { currentPassword, newPassword } = reqBody;

  const user = await User.findOneByIdWithPassword(userId);
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found.');
  }

  if (!bcryptjs.compareSync(currentPassword, user.passwordHash)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Current password is incorrect.');
  }

  await User.updateUser(userId, {
    passwordHash: bcryptjs.hashSync(newPassword, 10)
  });
};

const getProfile = async (userId) => {
  const user = await User.findOneById(userId);
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found.');
  }

  const profile = await Profile.findByUserId(userId);
  const loyaltyPoints = await LoyaltyPoint.findOne({ customerId: userId });

  return {
    ...pickUserWithProfile(user, profile),
    loyaltyPoints: loyaltyPoints?.points || 0
  };
};

const updateProfile = async (userId, reqBody, avatarFile) => {
  const user = await User.findOneById(userId);
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found.');
  }

  const updateData = {};

  if (reqBody.fullName) updateData.fullName = reqBody.fullName;
  if (reqBody.phone) updateData.phone = reqBody.phone;
  if (reqBody.address) updateData.address = reqBody.address;

  if (avatarFile) {
    const uploadResult = await CloudinaryProvider.streamUpload(
      avatarFile.buffer,
      'laundrypro/avatars'
    );
    updateData.avatar = uploadResult.secure_url;
  }

  const updatedProfile = await Profile.createOrUpdate(userId, updateData);

  return pickUserWithProfile(user, updatedProfile);
};

const getAllUsers = async ({ page = 1, limit = 10, role, status, search }) => {
  const query = { _destroy: false };

  if (role) query.role = role;
  if (status) query.status = status;
  if (search) {
    query.$or = [
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [users, total] = await Promise.all([
    User.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 }),
    User.countDocuments(query)
  ]);

  // Get profiles for all users
  const userIds = users.map(u => u._id);
  const profiles = await Profile.find({ userId: { $in: userIds } });
  const profileMap = new Map(profiles.map(p => [p.userId.toString(), p]));

  const usersWithProfiles = users.map(user =>
    pickUserWithProfile(user, profileMap.get(user._id.toString()))
  );

  return {
    users: usersWithProfiles,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / parseInt(limit))
    }
  };
};

const getUserById = async (userId) => {
  const user = await User.findOneById(userId);
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found.');
  }

  const profile = await Profile.findByUserId(userId);
  return pickUserWithProfile(user, profile);
};

const updateUserStatus = async (userId, status) => {
  const user = await User.findOneById(userId);
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found.');
  }

  if (!Object.values(USER_STATUS).includes(status)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid status.');
  }

  const updatedUser = await User.updateUser(userId, { status });
  return pickUser(updatedUser);
};

const deleteUser = async (userId) => {
  const user = await User.findOneById(userId);
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found.');
  }

  await User.updateUser(userId, { _destroy: true });
};

export const userService = {
  register,
  verifyEmail,
  login,
  refreshToken,
  forgotPassword,
  resetPassword,
  changePassword,
  getProfile,
  updateProfile,
  getAllUsers,
  getUserById,
  updateUserStatus,
  deleteUser
};