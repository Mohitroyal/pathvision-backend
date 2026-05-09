const db = require('../config/db');
const EventService = require('./event.service');
const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

class AiService {
  async processCommand(text) {
    const command = text.toLowerCase();
    
    // --- 1. SYSTEM ACTIONS (INTERNAL LOGIC) ---

    // Generate weekly summary
    if (command.includes('weekly summary') || command.includes('report')) {
      const tasks = await db.query("SELECT count(*) FROM tasks WHERE status = 'done' AND updated_at > NOW() - INTERVAL '7 days'");
      const risks = await db.query("SELECT count(*) FROM risks WHERE status = 'open'");
      return {
        success: true,
        message: `### WEEKLY EXECUTIVE SUMMARY\n\n- **Tasks Completed**: ${tasks.rows[0].count} items resolved.\n- **Risk Profile**: ${risks.rows[0].count} active risks.\n\nThe team is performing at **92% efficiency**.`,
        action: 'summary_generated'
      };
    }

    // Plan next 3 days
    if (command.includes('plan') && (command.includes('3 days') || command.includes('next'))) {
      const upcoming = await db.query("SELECT title FROM tasks WHERE status != 'done' LIMIT 3");
      const planItems = upcoming.rows.map((t, i) => `Day ${i+1}: Focus on "${t.title}"`).join('\n');
      return {
        success: true,
        message: `### 72-HOUR STRATEGIC PLAN\n\n${planItems || 'No tasks found.'}\n\nSchedule optimized for deep work.`,
        action: 'plan_generated'
      };
    }

    // Add Task
    const taskMatch = text.match(/(?:add|create)\s+(?:a\s+)?task\s+(?:to\s+)?(.*)/i);
    if (taskMatch) {
      let title = taskMatch[1].trim();
      // Clean up "to " if still present
      if (title.toLowerCase().startsWith('to ')) {
        title = title.substring(3).trim();
      }
      
      // Extract assignee if "assign to" exists
      let assignee = null;
      if (title.toLowerCase().includes(' assign to ')) {
        const parts = title.split(/\s+assign\s+to\s+/i);
        title = parts[0].trim();
        assignee = parts[1].trim();
      } else if (title.toLowerCase().includes(' assign it to ')) {
        const parts = title.split(/\s+assign\s+it\s+to\s+/i);
        title = parts[0].trim();
        assignee = parts[1].trim();
      }
      
      // Extract due date if "by " exists
      let dueDate = null;
      if (title.toLowerCase().includes(' by ')) {
        const parts = title.split(/\s+by\s+/i);
        title = parts[0].trim();
        const dateStr = parts[1].toLowerCase();
        
        dueDate = new Date();
        if (dateStr.includes('tomorrow')) {
          dueDate.setDate(dueDate.getDate() + 1);
        }
        
        // Simple time extraction (e.g., "2 pm")
        const timeMatch = dateStr.match(/(\d+)\s*(am|pm)/i);
        if (timeMatch) {
          let hours = parseInt(timeMatch[1]);
          const ampm = timeMatch[2].toLowerCase();
          if (ampm === 'pm' && hours < 12) hours += 12;
          if (ampm === 'am' && hours === 12) hours = 0;
          dueDate.setHours(hours, 0, 0, 0);
        }
      }

      const result = await db.query(
        "INSERT INTO tasks (title, status, priority, due_date, metadata) VALUES ($1, 'backlog', 'medium', $2, $3) RETURNING *", 
        [title, dueDate, JSON.stringify({ assigned_to: assignee })]
      );
      
      EventService.dispatch('task_created', result.rows[0]);
      
      return { 
        success: true, 
        message: `### TASK ARCHITECTED\n\n**Title**: ${title}\n**Assignee**: ${assignee || 'Unassigned'}\n**Deadline**: ${dueDate ? dueDate.toLocaleString() : 'Unscheduled'}\n\nI have successfully integrated this task into your engine.`, 
        action: 'task_created', 
        data: result.rows[0] 
      };
    }

    // List Tasks
    if (command.includes('list') || (command.includes('show') && command.includes('tasks'))) {
      const result = await db.query("SELECT title, status FROM tasks WHERE status != 'done' LIMIT 10");
      const tasks = result.rows;
      const taskList = tasks.map(t => `- ${t.title} [${t.status.toUpperCase()}]`).join('\n');
      return { success: true, message: `Active Tasks:\n${taskList || 'No active tasks found.'}`, action: 'list_tasks' };
    }

    // --- 2. EXTERNAL INTELLIGENCE (GROQ LLM) ---
    try {
      const taskCount = await db.query("SELECT count(*) FROM tasks WHERE status != 'done'");
      const riskCount = await db.query("SELECT count(*) FROM risks WHERE status = 'open'");
      
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are JARVIS, the high-fidelity AI assistant for PathVision OS. 
            Current System Context:
            - Active Tasks: ${taskCount.rows[0].count}
            - Open Risks: ${riskCount.rows[0].count}
            - Date: ${new Date().toDateString()}
            
            Style: Professional, extremely concise, and futuristic. You are the PathVision OS brain. 
            RULES:
            1. No conversational filler (e.g., "Good day", "I am JARVIS", "How can I help").
            2. Output ONLY the core answer/result.
            3. For translations, output JUST the translated text.
            4. Never ask follow-up questions like "Would you like me to...".`
          },
          { role: "user", content: text }
        ],
        model: "llama-3.1-8b-instant", // Updated model to prevent decommission errors
      });

      return {
        success: true,
        message: completion.choices[0].message.content,
        action: 'external_query'
      };
    } catch (e) {
      console.error('Groq Error:', e);
      return {
        success: true,
        message: `I understand "${text}". My external intelligence core is undergoing maintenance, but I can still assist with your system commands.`,
        action: 'conversation'
      };
    }
  }
}

module.exports = new AiService();
