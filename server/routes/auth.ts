import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db, StoredUser } from '../data/store';
import {
  AuthenticatedRequest,
  generateToken,
  requireAuth,
} from '../middleware/auth';

const router = Router();

// Helper to sanitize user output (never send password hash)
function sanitizeUser(user: StoredUser) {
  const { passwordHash, ...rest } = user;
  return rest;
}

// POST /api/auth/register
router.post('/register', async (req, res: Response) => {
  try {
    const { fullName, email, phone, password, confirmPassword, country } = req.body;

    // Validation
    if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
      return res.status(400).json({ error: 'Please enter a valid full name.' });
    }

    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    if (!phone || typeof phone !== 'string' || phone.trim().length < 7) {
      return res.status(400).json({ error: 'Please enter a valid phone number (e.g. 0300 1234567).' });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Password confirmation does not match.' });
    }

    // Check if user already exists
    const existing = db.findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    // Hash password securely
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // CRITICAL: Force role to 'customer' server-side
    const newUser: StoredUser = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      country: country?.trim() || 'Pakistan',
      role: 'customer',
      passwordHash,
      createdAt: new Date().toISOString(),
    };

    db.createUser(newUser);
    const token = generateToken(newUser);

    res.status(201).json({
      message: 'Account created successfully!',
      user: sanitizeUser(newUser),
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error during registration.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = db.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken(user);
    res.json({
      message: 'Login successful!',
      user: sanitizeUser(user),
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error during login.' });
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  res.json({ user: sanitizeUser(req.user!) });
});

// PUT /api/auth/profile
router.put('/profile', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { fullName, phone, country } = req.body;
    const updates: Partial<StoredUser> = {};

    if (fullName && typeof fullName === 'string' && fullName.trim().length >= 2) {
      updates.fullName = fullName.trim();
    }
    if (phone && typeof phone === 'string' && phone.trim().length >= 7) {
      updates.phone = phone.trim();
    }
    if (country && typeof country === 'string') {
      updates.country = country.trim();
    }

    const updated = db.updateUser(req.user!.id, updates);
    if (!updated) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({
      message: 'Profile updated successfully!',
      user: sanitizeUser(updated),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

// POST /api/auth/change-password
router.post('/change-password', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters.' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'New password confirmation does not match.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, req.user!.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect.' });
    }

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);

    db.updateUser(req.user!.id, { passwordHash: newHash });

    res.json({ message: 'Password updated successfully! Please use your new password next time.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to change password.' });
  }
});

// POST /api/auth/reset-password-request (Mock/Self-service secure reset simulation)
router.post('/reset-password-request', (req, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }
  const user = db.findUserByEmail(email);
  // Always return success for privacy/anti-enumeration
  res.json({
    message: 'If an account exists with that email, instructions have been dispatched. For this development environment, contact administrator or test directly.',
  });
});

// GET /api/auth/addresses
router.get('/addresses', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const addresses = db.getAddressesByUserId(req.user!.id);
  res.json({ addresses });
});

// POST /api/auth/addresses
router.post('/addresses', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { fullName, phone, addressLine, city, state, country, postalCode, isDefault } = req.body;
    if (!fullName || !phone || !addressLine || !city) {
      return res.status(400).json({ error: 'Name, phone, city, and address line are required.' });
    }

    const newAddr = db.addAddress({
      userId: req.user!.id,
      fullName: fullName.trim(),
      phone: phone.trim(),
      addressLine: addressLine.trim(),
      city: city.trim(),
      state: state?.trim() || '',
      country: country?.trim() || 'Pakistan',
      postalCode: postalCode?.trim() || '',
      isDefault: Boolean(isDefault),
    });

    res.status(201).json({ address: newAddr, message: 'Address saved!' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save address.' });
  }
});

// DELETE /api/auth/addresses/:id
router.delete('/addresses/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const success = db.deleteAddress(req.params.id, req.user!.id);
  if (!success) {
    return res.status(404).json({ error: 'Address not found.' });
  }
  res.json({ message: 'Address deleted.' });
});

export default router;
