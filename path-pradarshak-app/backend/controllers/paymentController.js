const Payment = require('../models/Payment');
// Agreements removed in CivicSync
const Wallet = require('../models/Wallet');
const { createOrder, verifyPayment, processRefund, createPenaltyPaymentLink } = require('../utils/razorpay');

// Test endpoint to check Razorpay configuration
const testRazorpayConfig = async (req, res) => {
  try {
    console.log('=== TESTING RAZORPAY CONFIG ===');
    console.log('Environment variables:', {
      RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID ? 'Set' : 'Not set',
      RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET ? 'Set' : 'Not set',
      NODE_ENV: process.env.NODE_ENV
    });
    
    // Test creating a small order
    const testOrder = await createOrder(1, 'INR', 'test_receipt');
    console.log('Test order created:', testOrder.id);
    
    res.json({
      message: 'Razorpay configuration is working',
      testOrderId: testOrder.id,
      config: {
        keyIdSet: !!process.env.RAZORPAY_KEY_ID,
        keySecretSet: !!process.env.RAZORPAY_KEY_SECRET,
        environment: process.env.NODE_ENV
      }
    });
  } catch (error) {
    console.error('❌ Razorpay config test failed:', error);
    res.status(500).json({
      message: 'Razorpay configuration test failed',
      error: error?.message,
      config: {
        keyIdSet: !!process.env.RAZORPAY_KEY_ID,
        keySecretSet: !!process.env.RAZORPAY_KEY_SECRET,
        environment: process.env.NODE_ENV
      }
    });
  }
};

// Create payment order for deposit
const createDepositOrder = async (req, res) => {
  try {
    console.log('=== CREATE DEPOSIT ORDER START ===');
    const { agreementId } = req.body;
    const userId = req.user._id;
    
    console.log('Request data:', { agreementId, userId });

    // Verify agreement exists and user is part of it
    const agreement = await Agreement.findOne({
      _id: agreementId,
      $or: [
        { user1: userId },
        { user2: userId }
      ],
      status: { $in: ['active', 'pending'] } // Allow both active and pending agreements
    });

    if (!agreement) {
      console.log('Agreement not found - checking if it exists with different status');
      // Check if agreement exists but with different status
      const allAgreements = await Agreement.find({
        _id: agreementId,
        $or: [
          { user1: userId },
          { user2: userId }
        ]
      });
      console.log('All agreements with this ID and user:', allAgreements);
      
      return res.status(404).json({ message: 'Agreement not found' });
    }
    
    console.log('Agreement found:', {
      id: agreement._id,
      status: agreement.status,
      user1: agreement.user1,
      user2: agreement.user2
    });

    // Enforce that the current user has set their personal goals before paying (if per-user goals are used)
    const payingAsUser1 = agreement.user1.toString() === userId.toString();
    const myGoals = payingAsUser1 ? agreement.user1Goals : agreement.user2Goals;
    if (!myGoals || !myGoals.what || !myGoals.why || !myGoals.how || !myGoals.where) {
      return res.status(400).json({ message: 'Please set your goals before making payment' });
    }

    // Ensure paymentStatus is initialized
    if (!agreement.paymentStatus) {
      agreement.paymentStatus = {
        user1Paid: false,
        user2Paid: false
      };
      await agreement.save();
    }

    // Check if user has already paid
    const existingPayment = await Payment.findOne({
      user: userId,
      agreement: agreementId,
      type: 'deposit',
      status: 'completed'
    });

    if (existingPayment) {
      return res.status(400).json({ message: 'Deposit already paid' });
    }

    console.log('Creating Razorpay order for agreement:', agreementId, 'user:', userId);
    
    // Create Razorpay order with shorter receipt ID
    const shortReceipt = `dep_${agreementId.slice(-8)}_${userId.toString().slice(-8)}`;
    let order;
    
    try {
      order = await createOrder(500, 'INR', shortReceipt);
      console.log('Razorpay order created:', order.id);
    } catch (razorpayError) {
      console.error('❌ Razorpay order creation failed:', {
        error: razorpayError?.message,
        statusCode: razorpayError?.statusCode,
        description: razorpayError?.description
      });
      throw new Error(`Razorpay order creation failed: ${razorpayError?.message || 'Unknown error'}`);
    }

    // Create payment record
    let payment;
    try {
      payment = new Payment({
        user: userId,
        agreement: agreementId,
        type: 'deposit',
        amount: 500,
        currency: 'INR',
        razorpayOrderId: order.id,
        status: 'pending',
        description: `Deposit for agreement: ${agreement.what}`
      });

      await payment.save();
      console.log('Payment record saved:', payment._id);
    } catch (paymentError) {
      console.error('❌ Payment record creation failed:', {
        error: paymentError?.message,
        stack: paymentError?.stack
      });
      throw new Error(`Payment record creation failed: ${paymentError?.message || 'Unknown error'}`);
    }

    res.json({
      message: 'Payment order created',
      order,
      payment
    });
    
    console.log('=== CREATE DEPOSIT ORDER END ===');
  } catch (error) {
    console.error('❌ Create deposit order error:', {
      message: error?.message,
      stack: error?.stack,
      statusCode: error?.statusCode,
      error: error?.error,
      description: error?.description,
      code: error?.code,
      fullError: JSON.stringify(error, null, 2)
    });
    
    // Create a more descriptive error message
    let errorMessage = 'Failed to create payment order';
    if (error?.statusCode === 401) {
      errorMessage = 'Authentication failed - Invalid Razorpay keys';
    } else if (error?.statusCode === 400) {
      errorMessage = `Bad request: ${error?.error?.description || error?.description || error?.message}`;
    } else if (error?.message) {
      errorMessage = error.message;
    }
    
    res.status(500).json({ 
      message: errorMessage,
      error: error?.message || 'Unknown error',
      details: process.env.NODE_ENV === 'development' ? error?.stack : undefined
    });
  }
};

// Verify payment
const verifyPaymentWebhook = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Verify signature
    const isValid = verifyPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    // Find payment record
    const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Mark payment as completed
    await payment.markCompleted(razorpay_payment_id, razorpay_signature);

    // Update agreement payment status
    const agreement = await Agreement.findById(payment.agreement);
    if (agreement) {
      console.log('Updating agreement payment status:', {
        agreementId: agreement._id,
        currentStatus: agreement.status,
        currentPaymentStatus: agreement.paymentStatus,
        paymentUserId: payment.user.toString(),
        agreementUser1: agreement.user1.toString(),
        agreementUser2: agreement.user2.toString()
      });
      
      if (agreement.user1.toString() === payment.user.toString()) {
        agreement.paymentStatus.user1Paid = true;
        console.log('Marked user1 as paid');
      } else {
        agreement.paymentStatus.user2Paid = true;
        console.log('Marked user2 as paid');
      }
      
      // Check if both users have paid and change status to active
      if (agreement.paymentStatus.user1Paid && agreement.paymentStatus.user2Paid) {
        agreement.status = 'active';
        agreement.trackingStartDate = new Date(); // Set tracking start date when both users pay
        console.log('Both users paid, changing status to active and setting tracking start date');
      } else {
        console.log('Still waiting for payment. User1 paid:', agreement.paymentStatus.user1Paid, 'User2 paid:', agreement.paymentStatus.user2Paid);
      }
      
      await agreement.save();
      console.log('Agreement saved with new status:', agreement.status, 'and payment status:', agreement.paymentStatus);
    } else {
      console.log('Agreement not found for payment:', payment.agreement);
    }

    // Add funds to user's wallet after successful payment
    if (payment.type === 'deposit') {
      try {
        let wallet = await Wallet.findOne({ user: payment.user });
        
        if (!wallet) {
          wallet = new Wallet({
            user: payment.user,
            balance: 0,
            transactions: []
          });
        }
        
        // Add ₹500 to wallet
        wallet.balance += payment.amount;
        
        // Add transaction record
        wallet.transactions.push({
          type: 'deposit',
          amount: payment.amount,
          description: `Agreement deposit: ${agreement?.what || 'Unknown agreement'}`,
          agreementId: payment.agreement,
          paymentId: payment._id,
          timestamp: new Date()
        });
        
        await wallet.save();
        console.log(`Added ₹${payment.amount} to wallet for user ${payment.user}`);
      } catch (walletError) {
        console.error('Failed to update wallet:', walletError);
        // Don't fail the payment verification if wallet update fails
      }
    }

    res.json({ message: 'Payment verified successfully' });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ message: 'Failed to verify payment' });
  }
};

// Get user payments
const getUserPayments = async (req, res) => {
  try {
    const userId = req.user._id;
    const { type, status } = req.query;

    let query = { user: userId };

    if (type) query.type = type;
    if (status) query.status = status;

    const payments = await Payment.find(query)
      .populate('agreement', 'what when')
      .sort({ createdAt: -1 });

    res.json({ payments });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ message: 'Failed to get payments' });
  }
};

// Test endpoint to manually verify payment (for development/testing)
const testPaymentVerification = async (req, res) => {
  try {
    const { agreementId } = req.body;
    
    if (!agreementId) {
      return res.status(400).json({ message: 'Agreement ID is required' });
    }

    // Find the payment for this agreement
    const payment = await Payment.findOne({ agreement: agreementId, status: 'pending' });
    if (!payment) {
      return res.status(404).json({ message: 'Pending payment not found for this agreement' });
    }

    // Mark payment as completed
    await payment.markCompleted('test_payment_id', 'test_signature');

    // Update agreement payment status
    const agreement = await Agreement.findById(agreementId);
    if (agreement) {
      console.log('Test: Updating agreement payment status:', {
        agreementId: agreement._id,
        currentStatus: agreement.status,
        currentPaymentStatus: agreement.paymentStatus
      });
      
      if (agreement.user1.toString() === payment.user.toString()) {
        agreement.paymentStatus.user1Paid = true;
        console.log('Test: Marked user1 as paid');
      } else {
        agreement.paymentStatus.user2Paid = true;
        console.log('Test: Marked user2 as paid');
      }
      
      // Check if both users have paid and change status to active
      if (agreement.paymentStatus.user1Paid && agreement.paymentStatus.user2Paid) {
        agreement.status = 'active';
        console.log('Test: Both users paid, changing status to active');
      } else {
        console.log('Test: Still waiting for payment. User1 paid:', agreement.paymentStatus.user1Paid, 'User2 paid:', agreement.paymentStatus.user2Paid);
      }
      
      await agreement.save();
      console.log('Test: Agreement saved with new status:', agreement.status, 'and payment status:', agreement.paymentStatus);
      
      res.json({ 
        message: 'Test payment verification completed',
        agreement: {
          status: agreement.status,
          paymentStatus: agreement.paymentStatus
        }
      });
    } else {
      res.status(404).json({ message: 'Agreement not found' });
    }
  } catch (error) {
    console.error('Test payment verification error:', error);
    res.status(500).json({ message: 'Failed to test payment verification' });
  }
};

// Create penalty payment link
const createPenaltyPayment = async (req, res) => {
  try {
    const { agreementId, reason } = req.body;
    const userId = req.user._id;

    // Verify agreement exists and user is part of it
    const agreement = await Agreement.findOne({
      _id: agreementId,
      $or: [
        { user1: userId },
        { user2: userId }
      ],
      status: 'active'
    });

    if (!agreement) {
      return res.status(404).json({ message: 'Agreement not found' });
    }

    // Create payment link for penalty with shorter reference ID
    const shortRefId = `pen_${agreementId.slice(-8)}_${userId.toString().slice(-8)}`;
    const paymentLink = await createPenaltyPaymentLink(
      50,
      `Penalty: ${reason}`,
      shortRefId
    );

    // Create penalty payment record
    const payment = new Payment({
      user: userId,
      agreement: agreementId,
      type: 'penalty',
      amount: 50,
      currency: 'INR',
      status: 'pending',
      description: `Penalty: ${reason}`,
      metadata: {
        reason,
        paymentLinkId: paymentLink.id
      }
    });

    await payment.save();

    res.json({
      message: 'Penalty payment link created',
      paymentLink,
      payment
    });
  } catch (error) {
    console.error('Create penalty payment error:', error);
    res.status(500).json({ message: 'Failed to create penalty payment' });
  }
};

// Process refund
const processRefundPayment = async (req, res) => {
  try {
    const { paymentId, amount, reason } = req.body;
    const userId = req.user._id;

    // Find payment
    const payment = await Payment.findOne({
      _id: paymentId,
      user: userId,
      status: 'completed'
    });

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Process refund through Razorpay
    const refund = await processRefund(payment.razorpayPaymentId, amount, reason);

    // Mark payment as refunded
    await payment.markRefunded();

    res.json({
      message: 'Refund processed successfully',
      refund
    });
  } catch (error) {
    console.error('Process refund error:', error);
    res.status(500).json({ message: 'Failed to process refund' });
  }
};

// Get payment statistics
const getPaymentStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const stats = await Payment.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$type',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          }
        }
      }
    ]);

    res.json({ stats });
  } catch (error) {
    console.error('Get payment stats error:', error);
    res.status(500).json({ message: 'Failed to get payment statistics' });
  }
};

// Reset payment status for an agreement (when payments are deleted)
const resetPaymentStatus = async (req, res) => {
  try {
    const { agreementId } = req.body;
    
    if (!agreementId) {
      return res.status(400).json({ message: 'Agreement ID is required' });
    }
    
    console.log('=== RESET PAYMENT STATUS START ===');
    console.log('Agreement ID:', agreementId);
    
    // Find the agreement
    const agreement = await Agreement.findById(agreementId);
    if (!agreement) {
      console.log('Agreement not found');
      return res.status(404).json({ message: 'Agreement not found' });
    }
    
    console.log('Found agreement:', {
      id: agreement._id,
      status: agreement.status,
      paymentStatus: agreement.paymentStatus,
      user1: agreement.user1,
      user2: agreement.user2
    });
    
    // Check if there are any completed payments for this agreement
    const completedPayments = await Payment.find({
      agreement: agreementId,
      status: 'completed'
    });
    
    console.log('Found completed payments:', completedPayments.length);
    console.log('Payment details:', completedPayments.map(p => ({
      id: p._id,
      user: p.user,
      status: p.status,
      amount: p.amount
    })));
    
    // Reset payment status
    const originalPaymentStatus = { ...agreement.paymentStatus };
    agreement.paymentStatus.user1Paid = false;
    agreement.paymentStatus.user2Paid = false;
    
    console.log('Reset payment status to false for both users');
    
    // Mark users as paid based on actual payment records
    for (const payment of completedPayments) {
      console.log('Processing payment:', {
        paymentId: payment._id,
        paymentUser: payment.user,
        agreementUser1: agreement.user1,
        agreementUser2: agreement.user2
      });
      
      if (agreement.user1.toString() === payment.user.toString()) {
        agreement.paymentStatus.user1Paid = true;
        console.log('✅ Marked user1 as paid');
      } else if (agreement.user2.toString() === payment.user.toString()) {
        agreement.paymentStatus.user2Paid = true;
        console.log('✅ Marked user2 as paid');
      } else {
        console.log('❌ Payment user does not match agreement users');
      }
    }
    
    console.log('Final payment status:', agreement.paymentStatus);
    
    // Update agreement status
    const originalStatus = agreement.status;
    if (agreement.paymentStatus.user1Paid && agreement.paymentStatus.user2Paid) {
      agreement.status = 'active';
      console.log('✅ Both users paid, setting status to active');
    } else {
      agreement.status = 'pending';
      console.log('❌ Not all users paid, setting status to pending');
    }
    
    console.log('Status change:', originalStatus, '→', agreement.status);
    
    // Save the agreement
    const savedAgreement = await agreement.save();
    console.log('Agreement saved successfully');
    
    // Verify the save worked by fetching again
    const verifyAgreement = await Agreement.findById(agreementId);
    console.log('Verification - Saved agreement:', {
      id: verifyAgreement._id,
      status: verifyAgreement.status,
      paymentStatus: verifyAgreement.paymentStatus
    });
    
    console.log('=== RESET PAYMENT STATUS END ===');
    
    res.json({
      message: 'Payment status reset successfully',
      originalStatus: originalStatus,
      newStatus: savedAgreement.status,
      originalPaymentStatus: originalPaymentStatus,
      newPaymentStatus: savedAgreement.paymentStatus,
      completedPayments: completedPayments.length,
      agreement: {
        id: savedAgreement._id,
        status: savedAgreement.status,
        paymentStatus: savedAgreement.paymentStatus
      }
    });
    
  } catch (error) {
    console.error('Reset payment status error:', error);
    res.status(500).json({ 
      message: 'Failed to reset payment status',
      error: error.message 
    });
  }
};

// Debug endpoint to check database state
const debugPaymentState = async (req, res) => {
  try {
    const { agreementId } = req.params;
    
    if (!agreementId) {
      return res.status(400).json({ message: 'Agreement ID is required' });
    }
    
    console.log('=== DEBUG PAYMENT STATE ===');
    console.log('Agreement ID:', agreementId);
    
    // Find the agreement
    const agreement = await Agreement.findById(agreementId);
    if (!agreement) {
      return res.status(404).json({ message: 'Agreement not found' });
    }
    
    // Find all payments for this agreement
    const allPayments = await Payment.find({ agreement: agreementId });
    const completedPayments = await Payment.find({ 
      agreement: agreementId, 
      status: 'completed' 
    });
    
    console.log('Agreement:', {
      id: agreement._id,
      status: agreement.status,
      paymentStatus: agreement.paymentStatus,
      user1: agreement.user1,
      user2: agreement.user2
    });
    
    console.log('All payments:', allPayments.length);
    console.log('Completed payments:', completedPayments.length);
    
    res.json({
      agreement: {
        id: agreement._id,
        status: agreement.status,
        paymentStatus: agreement.paymentStatus,
        user1: agreement.user1,
        user2: agreement.user2
      },
      payments: {
        all: allPayments.length,
        completed: completedPayments.length,
        allPayments: allPayments.map(p => ({
          id: p._id,
          user: p.user,
          status: p.status,
          amount: p.amount,
          type: p.type
        })),
        completedPayments: completedPayments.map(p => ({
          id: p._id,
          user: p.user,
          status: p.status,
          amount: p.amount,
          type: p.type
        }))
      }
    });
    
  } catch (error) {
    console.error('Debug payment state error:', error);
    res.status(500).json({ 
      message: 'Failed to debug payment state',
      error: error.message 
    });
  }
};

module.exports = {
  testRazorpayConfig,
  createDepositOrder,
  verifyPaymentWebhook,
  testPaymentVerification,
  resetPaymentStatus,
  debugPaymentState,
  getUserPayments,
  createPenaltyPayment,
  processRefundPayment,
  getPaymentStats
};







