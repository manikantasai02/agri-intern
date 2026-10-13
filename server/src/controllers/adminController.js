// server/src/controllers/adminController.js
const { db, generateUuid } = require('../db');

/**
 * GET /api/v1/admin/users - List users with verification status
 */
const getUsers = (req, res) => {
  const users = db.users.map(u => {
    const profile = db.farmer_profiles.find(fp => fp.user_id === u.id);
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      mobile: u.mobile,
      role: u.role,
      verification_status: u.verification_status,
      created_at: u.created_at,
      farm_name: profile ? profile.farm_name : null,
      location: profile ? profile.location_text : null
    };
  });

  return res.json({
    success: true,
    data: users
  });
};

/**
 * PATCH /api/v1/admin/users/:id/verify - Update verification status
 */
const verifyUser = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['pending', 'verified', 'suspended'].includes(status)) {
    return res.status(400).json({ success: false, error: 'Invalid verification status' });
  }

  const user = db.users.find(u => u.id === id);
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }

  user.verification_status = status;

  db.audit_logs.push({
    id: 'log-' + generateUuid(),
    actor_id: req.user.id,
    action: `USER_STATUS_UPDATED_${status.toUpperCase()}`,
    entity_type: 'user',
    entity_id: user.id,
    metadata: { new_status: status },
    timestamp: new Date().toISOString()
  });

  return res.json({
    success: true,
    message: `User status changed to ${status}`,
    data: user
  });
};

/**
 * GET /api/v1/admin/audit-logs
 */
const getAuditLogs = (req, res) => {
  return res.json({
    success: true,
    data: db.audit_logs.slice().reverse()
  });
};

/**
 * GET /api/v1/admin/stats
 */
const getPlatformStats = (req, res) => {
  const totalVolume = db.orders.reduce((acc, o) => acc + (o.status !== 'cancelled' ? o.total_amount : 0), 0);
  return res.json({
    success: true,
    data: {
      totalUsers: db.users.length,
      farmersCount: db.users.filter(u => u.role === 'farmer').length,
      buyersCount: db.users.filter(u => u.role === 'buyer').length,
      distributorsCount: db.users.filter(u => u.role === 'distributor').length,
      activeProducts: db.products.filter(p => p.status === 'active').length,
      totalOrders: db.orders.length,
      grossTurnover: totalVolume
    }
  });
};

module.exports = {
  getUsers,
  verifyUser,
  getAuditLogs,
  getPlatformStats
};
