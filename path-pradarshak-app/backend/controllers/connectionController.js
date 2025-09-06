const Connection = require('../models/Connection');
const User = require('../models/User');
const { sendConnectionRequestEmail, sendConnectionRequestNotification } = require('../utils/notifications');

// Send connection request
const sendRequest = async (req, res) => {
  try {
    const { recipientId, message } = req.body;
    const requesterId = req.user._id;

    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent self-connection
    if (requesterId.toString() === recipientId.toString()) {
      return res.status(400).json({ message: 'Cannot connect with yourself' });
    }

    // Check if already connected or request exists (in either direction)
    const existingConnection = await Connection.findOne({
      $or: [
        { requester: requesterId, recipient: recipientId },
        { requester: recipientId, recipient: requesterId }
      ]
    });

    if (existingConnection) {
      if (existingConnection.status === 'pending') {
        if (existingConnection.requester.toString() === requesterId.toString()) {
          return res.status(400).json({ 
            message: 'Connection request already sent to this user'
          });
        } else {
          return res.status(400).json({ 
            message: 'Connection request already received from this user. Please accept or reject it first.'
          });
        }
      } else if (existingConnection.status === 'accepted') {
        return res.status(400).json({ message: 'Already connected with this user' });
      } else if (existingConnection.status === 'rejected') {
        // Allow sending a new request if previous was rejected
        await Connection.findByIdAndDelete(existingConnection._id);
      } else if (existingConnection.status === 'blocked') {
        return res.status(400).json({ message: 'Cannot connect with this user (blocked)' });
      }
    }

    // Additional validation: Check if the recipient has already sent a request to the requester
    const reverseConnection = await Connection.findOne({
      requester: recipientId,
      recipient: requesterId,
      status: 'pending'
    });

    if (reverseConnection) {
      return res.status(400).json({ 
        message: 'This user has already sent you a connection request. Please check your received requests.'
      });
    }

    // Create connection request
    const connection = new Connection({
      requester: requesterId,
      recipient: recipientId,
      message: message || ''
    });

    await connection.save();

    // Populate requester details for notification
    await connection.populate('requester', 'name avatar skills goals bio');

    // Send email notification (disabled)
    await sendConnectionRequestEmail(recipient, connection.requester);

    // Send real-time notification
    const io = req.app.get('io');
    if (io) {
      sendConnectionRequestNotification(io, recipientId, connection.requester);
    }

    res.status(201).json({
      message: 'Connection request sent successfully',
      connection: {
        _id: connection._id,
        requester: connection.requester,
        recipient: connection.recipient,
        message: connection.message,
        status: connection.status,
        createdAt: connection.createdAt
      }
    });
  } catch (error) {
    console.error('Send request error:', error);
    res.status(500).json({ message: 'Failed to send request' });
  }
};

// Get connection requests (received)
const getReceivedRequests = async (req, res) => {
  try {
    const connections = await Connection.find({
      recipient: req.user._id,
      status: 'pending'
    }).populate('requester', 'name avatar skills goals bio');

    res.json({ connections });
  } catch (error) {
    console.error('Get received requests error:', error);
    res.status(500).json({ message: 'Failed to get requests' });
  }
};

// Get sent requests
const getSentRequests = async (req, res) => {
  try {
    const connections = await Connection.find({
      requester: req.user._id,
      status: 'pending'
    }).populate('recipient', 'name avatar skills goals bio');

    res.json({ connections });
  } catch (error) {
    console.error('Get sent requests error:', error);
    res.status(500).json({ message: 'Failed to get requests' });
  }
};

// Accept connection request
const acceptRequest = async (req, res) => {
  try {
    const { connectionId } = req.params;

    const connection = await Connection.findOne({
      _id: connectionId,
      recipient: req.user._id,
      status: 'pending'
    }).populate('requester', 'name avatar skills goals bio')
      .populate('recipient', 'name avatar skills goals bio');

    if (!connection) {
      return res.status(404).json({ message: 'Connection request not found' });
    }

    connection.status = 'accepted';
    connection.acceptedAt = new Date();
    await connection.save();

    // Send real-time notification to requester
    const io = req.app.get('io');
    if (io) {
      const notification = {
        type: 'connection_accepted',
        message: `${req.user.name} accepted your connection request!`,
        data: {
          connectionId: connection._id,
          recipient: req.user
        },
        timestamp: new Date()
      };
      io.to(`user-${connection.requester._id}`).emit('notification', notification);
    }

    res.json({
      message: 'Connection request accepted',
      connection: {
        _id: connection._id,
        requester: connection.requester,
        recipient: connection.recipient,
        status: connection.status,
        message: connection.message,
        createdAt: connection.createdAt,
        acceptedAt: connection.acceptedAt
      }
    });
  } catch (error) {
    console.error('Accept request error:', error);
    res.status(500).json({ message: 'Failed to accept request' });
  }
};

// Reject connection request
const rejectRequest = async (req, res) => {
  try {
    const { connectionId } = req.params;

    const connection = await Connection.findOne({
      _id: connectionId,
      recipient: req.user._id,
      status: 'pending'
    });

    if (!connection) {
      return res.status(404).json({ message: 'Connection request not found' });
    }

    connection.status = 'rejected';
    connection.rejectedAt = new Date();
    await connection.save();

    res.json({
      message: 'Connection request rejected',
      connection
    });
  } catch (error) {
    console.error('Reject request error:', error);
    res.status(500).json({ message: 'Failed to reject request' });
  }
};

// Get active connections
const getActiveConnections = async (req, res) => {
  try {
    const connections = await Connection.find({
      $or: [
        { requester: req.user._id },
        { recipient: req.user._id }
      ],
      status: 'accepted'
    }).populate('requester', 'name avatar skills goals bio')
      .populate('recipient', 'name avatar skills goals bio');

    // Format connections to show partner details
    const formattedConnections = connections.map(connection => {
      const isRequester = connection.requester._id.toString() === req.user._id.toString();
      const partner = isRequester ? connection.recipient : connection.requester;
      
      return {
        _id: connection._id,
        partner,
        createdAt: connection.createdAt,
        acceptedAt: connection.acceptedAt
      };
    });

    res.json({ connections: formattedConnections });
  } catch (error) {
    console.error('Get active connections error:', error);
    res.status(500).json({ message: 'Failed to get connections' });
  }
};

// Cancel sent request
const cancelRequest = async (req, res) => {
  try {
    const { connectionId } = req.params;

    const connection = await Connection.findOneAndDelete({
      _id: connectionId,
      requester: req.user._id,
      status: 'pending'
    });

    if (!connection) {
      return res.status(404).json({ message: 'Connection request not found' });
    }

    res.json({
      message: 'Connection request cancelled',
      connection
    });
  } catch (error) {
    console.error('Cancel request error:', error);
    res.status(500).json({ message: 'Failed to cancel request' });
  }
};

// Get connection status between current user and another user
const getConnectionStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    // Check if there's an existing connection
    const connection = await Connection.findOne({
      $or: [
        { requester: currentUserId, recipient: userId },
        { requester: userId, recipient: currentUserId }
      ]
    }).populate('requester', 'name avatar')
      .populate('recipient', 'name avatar');

    if (!connection) {
      return res.json({ 
        status: 'none',
        connection: null
      });
    }

    // Determine the role of current user in this connection
    const isRequester = connection.requester._id.toString() === currentUserId.toString();
    const otherUser = isRequester ? connection.recipient : connection.requester;

    // Determine the appropriate display status based on user's role
    let displayStatus = connection.status;
    
    if (connection.status === 'pending') {
      // If current user is the requester, show "Request Sent"
      // If current user is the recipient, show "Connect" (none)
      if (isRequester) {
        displayStatus = 'pending'; // Requester sees "Request Sent"
      } else {
        displayStatus = 'none'; // Recipient sees "Connect" button
      }
    }

    res.json({ 
      status: displayStatus,
      connection: {
        _id: connection._id,
        status: connection.status,
        message: connection.message,
        createdAt: connection.createdAt,
        acceptedAt: connection.acceptedAt,
        rejectedAt: connection.rejectedAt,
        isRequester,
        otherUser: {
          _id: otherUser._id,
          name: otherUser.name,
          avatar: otherUser.avatar
        }
      }
    });
  } catch (error) {
    console.error('Get connection status error:', error);
    res.status(500).json({ message: 'Failed to get connection status' });
  }
};

// Get all connection statuses for multiple users at once
const getBulkConnectionStatus = async (req, res) => {
  try {
    const { userIds } = req.body;
    const currentUserId = req.user._id;

    console.log('Bulk status request:', { userIds, currentUserId });

    if (!userIds || !Array.isArray(userIds)) {
      return res.status(400).json({ message: 'User IDs array is required' });
    }

    // Get all connections involving current user and the specified users
    const connections = await Connection.find({
      $or: [
        { requester: currentUserId, recipient: { $in: userIds } },
        { recipient: currentUserId, requester: { $in: userIds } }
      ]
    });

    console.log('Found connections:', connections);

    // Create a map of user ID to connection status
    const statusMap = {};
    userIds.forEach(userId => {
      statusMap[userId] = 'none';
    });

    connections.forEach(connection => {
      const otherUserId = connection.requester.toString() === currentUserId.toString() 
        ? connection.recipient.toString() 
        : connection.requester.toString();
      
      if (userIds.includes(otherUserId)) {
        // Determine the appropriate status based on user's role in the connection
        let displayStatus = connection.status;
        
        if (connection.status === 'pending') {
          // If current user is the requester, show "Request Sent"
          // If current user is the recipient, show "Connect" (none)
          if (connection.recipient.toString() === currentUserId.toString()) {
            displayStatus = 'none'; // Recipient sees "Connect" button
          } else {
            displayStatus = 'pending'; // Requester sees "Request Sent"
          }
        }
        
        // Only update if we don't have a status yet or if this is more relevant
        if (!statusMap[otherUserId] || statusMap[otherUserId] === 'none') {
          statusMap[otherUserId] = displayStatus;
        }
      }
    });

    console.log('Final status map:', statusMap);
    res.json({ statusMap });
  } catch (error) {
    console.error('Get bulk connection status error:', error);
    res.status(500).json({ message: 'Failed to get bulk connection status' });
  }
};

// Clean up duplicate connections (admin function)
const cleanupDuplicateConnections = async (req, res) => {
  try {
    // Find all connections
    const allConnections = await Connection.find({});
    const duplicates = [];
    const seen = new Set();

    allConnections.forEach(connection => {
      const key1 = `${connection.requester}-${connection.recipient}`;
      const key2 = `${connection.recipient}-${connection.requester}`;
      
      if (seen.has(key1) || seen.has(key2)) {
        duplicates.push(connection._id);
      } else {
        seen.add(key1);
        seen.add(key2);
      }
    });

    if (duplicates.length > 0) {
      await Connection.deleteMany({ _id: { $in: duplicates } });
      console.log(`Cleaned up ${duplicates.length} duplicate connections`);
    }

    res.json({
      message: `Cleaned up ${duplicates.length} duplicate connections`,
      duplicatesRemoved: duplicates.length
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({ message: 'Failed to cleanup duplicates' });
  }
};

// Get user's partners (accepted connections)
const getPartners = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    // Find all accepted connections where the current user is either requester or recipient
    const connections = await Connection.find({
      $or: [
        { requester: currentUserId, status: 'accepted' },
        { recipient: currentUserId, status: 'accepted' }
      ]
    }).populate('requester', 'name email avatar skills goals interests bio location isVerified lastActive')
      .populate('recipient', 'name email avatar skills goals interests bio location isVerified lastActive');

    // Extract partner information
    const partners = connections.map(connection => {
      // Determine which user is the partner (not the current user)
      const partner = connection.requester._id.toString() === currentUserId.toString() 
        ? connection.recipient 
        : connection.requester;
      
      return {
        _id: partner._id,
        name: partner.name,
        email: partner.email,
        avatar: partner.avatar,
        skills: partner.skills || [],
        goals: partner.goals || [],
        interests: partner.interests || [],
        bio: partner.bio,
        location: partner.location,
        isVerified: partner.isVerified,
        lastActive: partner.lastActive,
        connectionId: connection._id,
        connectedSince: connection.acceptedAt || connection.createdAt
      };
    });

    res.json({
      partners,
      total: partners.length
    });
  } catch (error) {
    console.error('Get partners error:', error);
    res.status(500).json({ message: 'Failed to get partners' });
  }
};

// Block user
const blockUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find existing connection and update status to blocked
    const connection = await Connection.findOneAndUpdate(
      {
        $or: [
          { requester: req.user._id, recipient: userId },
          { requester: userId, recipient: req.user._id }
        ]
      },
      { status: 'blocked' },
      { new: true, upsert: true }
    );

    res.json({
      message: 'User blocked successfully',
      connection
    });
  } catch (error) {
    console.error('Block user error:', error);
    res.status(500).json({ message: 'Failed to block user' });
  }
};

module.exports = {
  sendRequest,
  getReceivedRequests,
  getSentRequests,
  acceptRequest,
  rejectRequest,
  getActiveConnections,
  getPartners,
  getConnectionStatus,
  getBulkConnectionStatus,
  cancelRequest,
  blockUser,
  cleanupDuplicateConnections
};


