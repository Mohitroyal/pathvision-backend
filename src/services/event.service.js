const EventEmitter = require('events');

class EventService extends EventEmitter {
  constructor() {
    super();
    this.setupListeners();
  }

  setupListeners() {
    // These will be linked to other services
    this.on('task_created', async (data) => {
      console.log('Event: task_created', data.id);
      try {
        const reminderService = require('./reminder.service');
        const activityService = require('./activity.service');
        // const plannerService = require('./planner.service'); // Missing service

        await activityService.log('task_created', 'task', data.id, { title: data.title });
        
        if (data.metadata && data.metadata.reminder) {
          await reminderService.createFromTask(data);
        }
      } catch (e) {
        console.error('Error in task_created listener:', e.message);
      }
    });

    this.on('task_completed', async (data) => {
      console.log('Event: task_completed', data.id);
      try {
        const milestoneService = require('./milestone.service');
        const riskService = require('./risk.service');
        const activityService = require('./activity.service');
        // const projectService = require('./project.service'); // Missing service

        await activityService.log('task_completed', 'task', data.id, { title: data.title });
        await milestoneService.updateFromTask(data);
        await riskService.resolveFromTask(data.id);
      } catch (e) {
        console.error('Error in task_completed listener:', e.message);
      }
    });

    this.on('milestone_updated', async (data) => {
      console.log('Event: milestone_updated', data.id);
    });
    
    this.on('risk_detected', async (data) => {
      console.log('Event: risk_detected', data.title);
      try {
        const activityService = require('./activity.service');
        await activityService.log('risk_detected', 'risk', data.id, { title: data.title });
      } catch (e) {
        console.error('Error in risk_detected listener:', e.message);
      }
    });
  }

  dispatch(eventName, data) {
    this.emit(eventName, data);
    // Broadcast via Socket.IO for real-time UI updates
    if (global.io) {
      global.io.emit('system_event', { event: eventName, data });
    }
  }
}

module.exports = new EventService();
