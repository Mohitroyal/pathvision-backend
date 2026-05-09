const dashboardService = require('../services/dashboard.service');

exports.getDashboardData = async (req, res, next) => {
  try {
    const data = await dashboardService.getStats();
    res.json(data);
  } catch (error) {
    next(error);
  }
};
