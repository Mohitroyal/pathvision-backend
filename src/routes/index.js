// backend/src/routes/index.js
const express = require('express');
const router = express.Router();

// Import all route modules
const authRoutes = require('./auth.routes');
const taskRoutes = require('./task.routes');
const projectRoutes = require('./project.routes');
const plannerRoutes = require('./planner.routes');
const riskRoutes = require('./risk.routes');
const milestoneRoutes = require('./milestone.routes');
const teamRoutes = require('./team.routes');
const brainDumpRoutes = require('./brainDump.routes');
const reminderRoutes = require('./reminder.routes');
const dashboardRoutes = require('./dashboard.routes');
const aiRoutes = require('./ai.routes');
const translationRoutes = require('./translationRoutes');
const pinnedRoutes = require('./pinned.routes');
const financeRoutes = require('./finance.routes');
const goalRoutes = require('./goal.routes');
const weeklyReportRoutes = require('./weeklyReport.routes');
const decisionLogRoutes = require('./decisionLog.routes');

// Versioned API Mounting
router.use('/auth', authRoutes);
router.use('/tasks', taskRoutes);
router.use('/projects', projectRoutes);
router.use('/planner', plannerRoutes);
router.use('/risks', riskRoutes);
router.use('/milestones', milestoneRoutes);
router.use('/users', teamRoutes);
router.use('/brain-dump', brainDumpRoutes);
router.use('/reminders', reminderRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/ai', aiRoutes);
router.use('/translations', translationRoutes);
router.use('/pinned', pinnedRoutes);
router.use('/finance', financeRoutes);
router.use('/goals', goalRoutes);
router.use('/weekly-reports', weeklyReportRoutes);
router.use('/decision-log', decisionLogRoutes);

module.exports = router;
