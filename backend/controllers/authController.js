const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/emailService');

const prisma = new PrismaClient({
  // Use the library engine explicitly
  __internal: {
    engine: {
      type: 'library'
    }
  }
});

// 1. REGISTER
exports.register = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // Validate inputs
    if (!email || !password || !name) {
      return res.status(400).json({ message: "Email, password, and name are required" });
    }
    
    if (name.trim().length < 2) {
      return res.status(400).json({ message: "Name must be at least 2 characters long" });
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }
    
    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const vToken = crypto.randomBytes(32).toString('hex');
    const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const verificationEmailSentAt = new Date();

    const user = await prisma.user.create({
      data: { 
        email, 
        password: hashedPassword, 
        name, 
        verificationToken: vToken,
        tokenExpires,
        verificationEmailSentAt
      }
    });

    const emailResult = await sendVerificationEmail(user.email, vToken);
    if (emailResult.previewUrl) {
      console.log('Verification email preview URL:', emailResult.previewUrl);
    }

    res.status(201).json({ message: "Success! Please check your email to verify account." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// 2. VERIFY EMAIL
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const user = await prisma.user.findFirst({
      where: {
        verificationToken: token,
        tokenExpires: {
          gt: new Date()
        }
      }
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true, verificationToken: null, tokenExpires: null }
    });
    res.json({ message: "Email verified successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Verification failed" });
  }
};

// 3. LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    if (!user.isVerified) {
      return res.status(403).json({ message: "Please verify your email first" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ 
      token, 
      user: { id: user.id, name: user.name, email: user.email, role: user.role } 
    });
  } catch (err) {
    res.status(500).json({ message: "Login error. msg: " + err.message });
  }
};

// 4. FORGOT PASSWORD
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      const now = new Date();
      if (user.passwordResetEmailSentAt) {
        const elapsedMs = now.getTime() - new Date(user.passwordResetEmailSentAt).getTime();
        const minIntervalMs = 60 * 1000;

        if (elapsedMs < minIntervalMs) {
          const waitSeconds = Math.ceil((minIntervalMs - elapsedMs) / 1000);
          return res.status(429).json({ message: `Please wait ${waitSeconds}s before requesting another reset email.` });
        }
      }

      const rToken = crypto.randomBytes(32).toString('hex');
      const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await prisma.user.update({
        where: { email },
        data: { resetToken: rToken, resetTokenExpiry: expiry, passwordResetEmailSentAt: now }
      });

      const emailResult = await sendPasswordResetEmail(email, rToken);
      if (emailResult.previewUrl) {
        console.log('Password reset email preview URL:', emailResult.previewUrl);
      }
    }

    // Return a generic message to avoid revealing whether the email exists.
    return res.json({ message: "If an account exists for this email, a reset link has been sent." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to process forgot password request" });
  }
};

// 5. RESET PASSWORD
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    if (!password || !confirmPassword) {
      return res.status(400).json({ message: "Password and confirm password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date()
        }
      }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      }
    });

    return res.json({ message: "Password has been reset successfully." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Password reset failed" });
  }
};

// Add this to your authController.js
exports.getProfile = async (req, res) => {
  try {
    // Since verifyToken already ran, we have req.user.id
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isVerified: true,
        createdAt: true,
        profile: {
          select: {
            phone: true,
            address: true,
            city: true,
            state: true,
            postalCode: true,
            country: true
          }
        },
        _count: {
          select: {
            orders: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (err) {
    console.error("Profile Fetch Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const name = String(req.body?.name || '').trim();
    const phone = String(req.body?.phone || '').trim();
    const address = String(req.body?.address || '').trim();

    if (!name || name.length < 2) {
      return res.status(400).json({ message: 'Name must be at least 2 characters long' });
    }

    if (phone && !/^\+?[0-9()\-\s]{8,20}$/.test(phone)) {
      return res.status(400).json({ message: 'Phone number must match Finnish/European format' });
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: req.user.id },
        data: { name }
      });

      await tx.userProfile.upsert({
        where: { userId: req.user.id },
        create: {
          userId: req.user.id,
          phone: phone || null,
          address: address || null
        },
        update: {
          phone: phone || null,
          address: address || null
        }
      });
    });

    const updatedUser = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isVerified: true,
        createdAt: true,
        profile: {
          select: {
            phone: true,
            address: true,
            city: true,
            state: true,
            postalCode: true,
            country: true
          }
        },
        _count: {
          select: {
            orders: true
          }
        }
      }
    });

    return res.status(200).json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (err) {
    console.error('Profile Update Error:', err);
    return res.status(500).json({ message: 'Failed to update profile' });
  }
};

// 2.1 RESEND VERIFICATION EMAIL
exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Your email is already verified. Please login." });
    }

    const now = new Date();
    if (user.verificationEmailSentAt) {
      const elapsedMs = now.getTime() - new Date(user.verificationEmailSentAt).getTime();
      const minIntervalMs = 60 * 1000;

      if (elapsedMs < minIntervalMs) {
        const waitSeconds = Math.ceil((minIntervalMs - elapsedMs) / 1000);
        return res.status(429).json({ message: `Please wait ${waitSeconds}s before requesting another verification email.` });
      }
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const tokenExpires = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken,
        tokenExpires,
        verificationEmailSentAt: now
      }
    });

    const emailResult = await sendVerificationEmail(user.email, verificationToken);
    if (emailResult.previewUrl) {
      console.log('Resend verification email preview URL:', emailResult.previewUrl);
    }

    return res.json({ message: "New link sent! Check your inbox (and spam folder)." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to resend verification email" });
  }
};