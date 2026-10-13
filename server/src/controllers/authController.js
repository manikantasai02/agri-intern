// server/src/controllers/authController.js
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const { db, generateUuid } = require('../db');
const { JWT_SECRET } = require('../middleware/auth');

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  mobile: z.string().min(10, 'Mobile must be at least 10 digits'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['farmer', 'buyer', 'distributor', 'admin']),
  farm_name: z.string().optional(),
  location_text: z.string().optional(),
  producer_type: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

const register = (req, res) => {
  const result = registerSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      success: false,
      error: result.error.errors.map(e => e.message).join(', ')
    });
  }

  const { name, email, mobile, password, role, farm_name, location_text, producer_type } = result.data;

  // Check unique constraints
  const existingEmail = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existingEmail) {
    return res.status(400).json({ success: false, error: 'Email already registered.' });
  }

  const existingMobile = db.users.find(u => u.mobile === mobile);
  if (existingMobile) {
    return res.status(400).json({ success: false, error: 'Mobile number already registered.' });
  }

  const userId = 'u-' + generateUuid();
  const authId = 'auth-' + generateUuid();

  const newUser = {
    id: userId,
    auth_id: authId,
    name,
    email,
    mobile,
    role,
    password, // in production hash with bcrypt
    verification_status: role === 'farmer' ? 'verified' : 'verified',
    created_at: new Date().toISOString()
  };

  db.users.push(newUser);

  if (role === 'farmer') {
    db.farmer_profiles.push({
      user_id: userId,
      farm_name: farm_name || `${name}'s Agro Farm`,
      location_text: location_text || 'Rural Agricultural Zone',
      producer_type: producer_type || 'Individual Farmer'
    });
  }

  // Audit log
  db.audit_logs.push({
    id: 'log-' + generateUuid(),
    actor_id: userId,
    action: 'USER_REGISTERED',
    entity_type: 'user',
    entity_id: userId,
    metadata: { role, email },
    timestamp: new Date().toISOString()
  });

  const token = jwt.sign(
    { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        mobile: newUser.mobile,
        role: newUser.role,
        verification_status: newUser.verification_status
      }
    }
  });
};

const login = (req, res) => {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      success: false,
      error: 'Invalid email or password parameters'
    });
  }

  const { email, password } = result.data;
  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!user || user.password !== password) {
    return res.status(401).json({
      success: false,
      error: 'Invalid credentials. Please verify your email and password.'
    });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  const farmerProfile = db.farmer_profiles.find(fp => fp.user_id === user.id);

  return res.json({
    success: true,
    message: 'Logged in successfully',
    data: {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        verification_status: user.verification_status,
        farmer_profile: farmerProfile || null
      }
    }
  });
};

const getMe = (req, res) => {
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ success: false, error: 'User not found' });
  const farmerProfile = db.farmer_profiles.find(fp => fp.user_id === user.id);

  return res.json({
    success: true,
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
      verification_status: user.verification_status,
      farmer_profile: farmerProfile || null
    }
  });
};

module.exports = {
  register,
  login,
  getMe
};
