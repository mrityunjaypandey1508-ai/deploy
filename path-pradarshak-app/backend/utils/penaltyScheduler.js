// Agreements removed in CivicSync
const Progress = require('../models/Progress');
const Wallet = require('../models/Wallet');

// Check for missed days and apply penalties
const checkMissedDays = async () => {
  try {
    console.log('Checking for missed days...');
    
    // Get all active agreements where both users have paid
    const activeAgreements = await Agreement.find({ 
      status: 'active',
      'paymentStatus.user1Paid': true,
      'paymentStatus.user2Paid': true
    });
    
    for (const agreement of activeAgreements) {
      const today = new Date();
      const startDate = new Date(agreement.when.startDate);
      const endDate = new Date(agreement.when.endDate);
      
      // Only check if today is within agreement period
      if (today >= startDate && today <= endDate) {
        // Check both users
        const users = [agreement.user1, agreement.user2];
        
        for (const userId of users) {
          // Check if progress was submitted for today
          const todayProgress = await Progress.findOne({
            user: userId,
            agreement: agreement._id,
            date: {
              $gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
              $lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
            }
          });
          
          // If no progress for today and it's past the deadline (e.g., end of day)
          if (!todayProgress && today.getHours() >= 23) {
            // Check if penalty was already applied for today
            const existingPenalty = await Progress.findOne({
              user: userId,
              agreement: agreement._id,
              date: {
                $gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
                $lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
              },
              status: 'missed',
              penaltyApplied: true
            });
            
            if (!existingPenalty) {
              // Create missed progress entry and apply penalty
              const missedProgress = new Progress({
                user: userId,
                agreement: agreement._id,
                date: today,
                status: 'missed',
                description: 'Automatically marked as missed - no progress submitted',
                penaltyApplied: false
              });
              
              await missedProgress.save();
              await missedProgress.applyPenalty();
              
              console.log(`Applied penalty for user ${userId} on agreement ${agreement._id} for ${today.toDateString()}`);
            }
          }
        }
      }
    }
    
    console.log('Missed days check completed');
  } catch (error) {
    console.error('Error checking missed days:', error);
  }
};

// Schedule penalty checks (run daily at 11:59 PM)
const schedulePenaltyChecks = () => {
  // For development, run every hour
  setInterval(checkMissedDays, 60 * 60 * 1000);
  
  // For production, you might want to use a proper cron job
  // or run this at specific times
  console.log('Penalty scheduler started - checking every hour');
};

module.exports = {
  checkMissedDays,
  schedulePenaltyChecks
};

