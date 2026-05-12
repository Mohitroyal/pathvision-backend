// src/services/jarvis.action.service.js
// Intent parser + system action executor for JARVIS

const { supabase } = require('../config/supabase');

// ─────────────────────────────────────────────
// DATE / TIME PARSER
// ─────────────────────────────────────────────
function parseDateTime(text) {
  const now = new Date();
  let date = new Date(now);
  const lower = text.toLowerCase();

  // Day offsets
  if (lower.includes('today')) { /* keep today */ }
  else if (lower.includes('tomorrow')) { date.setDate(date.getDate() + 1); }
  else if (lower.includes('day after')) { date.setDate(date.getDate() + 2); }
  else if (/next (monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i.test(lower)) {
    const days = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
    const match = lower.match(/next (\w+)/i);
    const target = days.indexOf(match[1].toLowerCase());
    if (target !== -1) {
      const diff = (target - now.getDay() + 7) % 7 || 7;
      date.setDate(date.getDate() + diff);
    }
  }

  // Time extraction
  const timeMatch = lower.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/);
  if (timeMatch) {
    let hours = parseInt(timeMatch[1]);
    const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
    const ampm = timeMatch[3];
    if (ampm === 'pm' && hours < 12) hours += 12;
    if (ampm === 'am' && hours === 12) hours = 0;
    date.setHours(hours, minutes, 0, 0);
  } else {
    // Default to 9 AM if no time given
    date.setHours(9, 0, 0, 0);
  }

  return date;
}

// ─────────────────────────────────────────────
// INTENT DETECTION
// ─────────────────────────────────────────────
function detectIntent(text) {
  const t = text.toLowerCase();

  if (/remind|reminder|alert me|notify me/i.test(t)) return 'CREATE_REMINDER';
  if (/add task|create task|new task|add a task/i.test(t)) return 'CREATE_TASK';
  if (/add goal|create goal|set goal|new goal/i.test(t)) return 'CREATE_GOAL';
  if (/schedule|block time|add to planner|plan block/i.test(t)) return 'CREATE_PLANNER_BLOCK';
  if (/brain dump|dump this|note this|quick note|jot down/i.test(t)) return 'CREATE_BRAIN_DUMP';
  if (/translate|translation/i.test(t)) return 'TRANSLATE';
  if (/list tasks|show tasks|my tasks|pending tasks/i.test(t)) return 'LIST_TASKS';
  if (/weekly summary|weekly report|week summary/i.test(t)) return 'WEEKLY_SUMMARY';
  if (/plan.*(\d+ days|next \d+|this week)/i.test(t)) return 'PLAN_DAYS';

  return 'CONVERSATION';
}

// ─────────────────────────────────────────────
// ACTION HANDLERS
// ─────────────────────────────────────────────
async function createReminder(text, userId) {
  console.log(`[JARVIS ACTION] Creating reminder for user: ${userId}`);

  // Extract the message content after "remind me to/about/that"
  const msgMatch = text.match(/remind(?:\s+me)?(?:\s+to|\s+about|\s+that)?\s+(.+?)(?:\s+(?:tomorrow|today|at|on|by|next)|$)/i);
  const message = msgMatch ? msgMatch[1].trim() : text;
  const remindAt = parseDateTime(text);

  console.log(`[JARVIS ACTION] Reminder: "${message}" at ${remindAt.toISOString()}`);

  const { data, error } = await supabase
    .from('reminders')
    .insert({
      user_id: userId,
      message: message,
      remind_at: remindAt.toISOString(),
      is_sent: false
    })
    .select()
    .single();

  if (error) {
    console.error('[JARVIS ACTION] Reminder insert error:', error.message);
    throw new Error(error.message);
  }

  return {
    success: true,
    action: 'reminder_created',
    data,
    message: `⏰ **Reminder set**: "${message}" scheduled for **${remindAt.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}**. I'll alert you on time.`
  };
}

async function createTask(text, userId) {
  console.log(`[JARVIS ACTION] Creating task for user: ${userId}`);

  // Extract task title
  const titleMatch = text.match(/(?:add|create|new)\s+(?:a\s+)?task\s+(?:to\s+|for\s+)?(.+?)(?:\s+by\s+|\s+due\s+|\s+before\s+|$)/i);
  const title = titleMatch ? titleMatch[1].trim() : text.replace(/add|create|task|new/gi, '').trim();

  // Extract due date if present
  let dueDate = null;
  if (/by |due |before |tomorrow|today|at \d/i.test(text)) {
    dueDate = parseDateTime(text);
  }

  console.log(`[JARVIS ACTION] Task: "${title}", due: ${dueDate}`);

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      title,
      status: 'backlog',
      priority: 'medium',
      due_date: dueDate ? dueDate.toISOString() : null,
      metadata: { created_by: 'JARVIS', user_id: userId }
    })
    .select()
    .single();

  if (error) {
    console.error('[JARVIS ACTION] Task insert error:', error.message);
    throw new Error(error.message);
  }

  return {
    success: true,
    action: 'task_created',
    data,
    message: `✅ **Task created**: "${title}"${dueDate ? ` due **${dueDate.toLocaleDateString('en-IN', { dateStyle: 'medium' })}**` : ''}. Task is now live in your board.`
  };
}

async function createGoal(text, userId) {
  console.log(`[JARVIS ACTION] Creating goal for user: ${userId}`);

  const titleMatch = text.match(/(?:add|create|set|new)\s+(?:a\s+)?goal\s+(?:to\s+|for\s+)?(.+?)(?:\s+by\s+|\s+due\s+|$)/i);
  const title = titleMatch ? titleMatch[1].trim() : text.replace(/add|create|set|goal|new/gi, '').trim();

  let deadline = null;
  if (/by |due |before |next /i.test(text)) {
    deadline = parseDateTime(text);
  }

  const { data, error } = await supabase
    .from('goals')
    .insert({
      user_id: userId,
      title,
      description: `Created via JARVIS: "${text}"`,
      target_value: 100,
      current_value: 0,
      deadline: deadline ? deadline.toISOString().split('T')[0] : null,
    })
    .select()
    .single();

  if (error) {
    console.error('[JARVIS ACTION] Goal insert error:', error.message);
    throw new Error(error.message);
  }

  return {
    success: true,
    action: 'goal_created',
    data,
    message: `🎯 **Goal set**: "${title}"${deadline ? ` with deadline **${deadline.toLocaleDateString('en-IN')}**` : ''}. Goal is now tracked in your system.`
  };
}

async function createBrainDump(text, userId) {
  console.log(`[JARVIS ACTION] Creating brain dump for user: ${userId}`);

  const contentMatch = text.match(/(?:brain dump|dump this|note this|quick note|jot down)[:\s]+(.+)/i);
  const content = contentMatch ? contentMatch[1].trim() : text;

  const { data, error } = await supabase
    .from('brain_dump')
    .insert({
      user_id: userId,
      content,
      metadata: { source: 'JARVIS' }
    })
    .select()
    .single();

  if (error) {
    console.error('[JARVIS ACTION] Brain dump insert error:', error.message);
    throw new Error(error.message);
  }

  return {
    success: true,
    action: 'brain_dump_created',
    data,
    message: `🧠 **Brain dump captured**: "${content.substring(0, 80)}${content.length > 80 ? '...' : ''}". Note is saved to your intelligence buffer.`
  };
}

async function createPlannerBlock(text, userId) {
  console.log(`[JARVIS ACTION] Creating planner block for user: ${userId}`);

  const titleMatch = text.match(/(?:schedule|block time for|add to planner|plan)[:\s]+(.+?)(?:\s+(?:tomorrow|today|at|on|from)|$)/i);
  const title = titleMatch ? titleMatch[1].trim() : 'Scheduled Block';

  const startTime = parseDateTime(text);
  const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // Default 1 hour

  const { data, error } = await supabase
    .from('planner_blocks')
    .insert({
      user_id: userId,
      title,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      metadata: { source: 'JARVIS' }
    })
    .select()
    .single();

  if (error) {
    console.error('[JARVIS ACTION] Planner block insert error:', error.message);
    throw new Error(error.message);
  }

  return {
    success: true,
    action: 'planner_block_created',
    data,
    message: `📅 **Planner block added**: "${title}" from **${startTime.toLocaleTimeString('en-IN', { timeStyle: 'short' })}** to **${endTime.toLocaleTimeString('en-IN', { timeStyle: 'short' })}** on ${startTime.toLocaleDateString('en-IN', { dateStyle: 'medium' })}.`
  };
}

module.exports = {
  detectIntent,
  createReminder,
  createTask,
  createGoal,
  createBrainDump,
  createPlannerBlock,
};
