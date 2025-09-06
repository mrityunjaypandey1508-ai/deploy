// Email functionality has been removed
// All email-related functions are now no-op functions to prevent errors

// Send welcome email (no-op)
const sendWelcomeEmail = async (user) => {
  console.log(`Welcome email would be sent to ${user.name} (${user.email}) - Email functionality disabled`);
  return Promise.resolve();
};

// Send connection request email (no-op)
const sendConnectionRequestEmail = async (recipient, requester) => {
  console.log(`Connection request email would be sent to ${recipient.name} (${recipient.email}) - Email functionality disabled`);
  return Promise.resolve();
};

// Send progress reminder email (no-op)
const sendProgressReminderEmail = async (user, agreement) => {
  console.log(`Progress reminder email would be sent to ${user.name} (${user.email}) - Email functionality disabled`);
  return Promise.resolve();
};

// Send penalty notification email (no-op)
const sendPenaltyEmail = async (user, amount, reason) => {
  console.log(`Penalty email would be sent to ${user.name} (${user.email}) - Email functionality disabled`);
  return Promise.resolve();
};

// Send dispute notification email (no-op)
const sendDisputeEmail = async (user, dispute) => {
  console.log(`Dispute email would be sent to ${user.name} (${user.email}) - Email functionality disabled`);
  return Promise.resolve();
};

// Real-time notification via Socket.io
const sendRealTimeNotification = (io, userId, notification) => {
  io.to(`user-${userId}`).emit('notification', notification);
};

// Send progress update notification
const sendProgressUpdateNotification = (io, partnerId, progressData) => {
  const notification = {
    type: 'progress_update',
    message: 'Your partner has submitted their daily progress',
    data: progressData,
    timestamp: new Date()
  };
  
  sendRealTimeNotification(io, partnerId, notification);
};

// Send connection request notification
const sendConnectionRequestNotification = (io, recipientId, requesterData) => {
  const notification = {
    type: 'connection_request',
    message: 'You have a new accountability partner request',
    data: requesterData,
    timestamp: new Date()
  };
  
  sendRealTimeNotification(io, recipientId, notification);
};

module.exports = {
  sendWelcomeEmail,
  sendConnectionRequestEmail,
  sendProgressReminderEmail,
  sendPenaltyEmail,
  sendDisputeEmail,
  sendRealTimeNotification,
  sendProgressUpdateNotification,
  sendConnectionRequestNotification
};