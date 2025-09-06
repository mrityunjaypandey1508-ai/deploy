const Razorpay = require('razorpay');
const crypto = require('crypto');

// Use environment variables for Razorpay keys
const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

// Validate keys are present
if (!keyId || !keySecret) {
  console.error('❌ Razorpay keys not configured!');
  console.error('Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables');
  throw new Error('Razorpay keys not configured');
}

console.log('Razorpay configuration:', {
  keyId: keyId.slice(0, 8) + '...',
  keySecretLength: keySecret.length,
  keySecretPreview: keySecret.slice(0, 4) + '...' + keySecret.slice(-4)
});

const razorpay = new Razorpay({
  key_id: keyId,
  key_secret: keySecret,
});

// Create order
const createOrder = async (amount, currency = 'INR', receipt = null) => {
  try {
    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
      payment_capture: 1,
    };

    console.log('Creating Razorpay order with options:', options);
    const order = await razorpay.orders.create(options);
    console.log('Razorpay order created successfully:', order.id);
    return order;
  } catch (error) {
    console.error('Razorpay order creation error details:', {
      message: error?.message,
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
    
    throw new Error(errorMessage);
  }
};

// Verify payment signature
const verifyPayment = (orderId, paymentId, signature) => {
  try {
    const text = `${orderId}|${paymentId}`;
    const generatedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(text)
      .digest('hex');

    return generatedSignature === signature;
  } catch (error) {
    console.error('Payment verification error:', error);
    return false;
  }
};

// Process refund
const processRefund = async (paymentId, amount, reason = 'Refund') => {
  try {
    const refund = await razorpay.payments.refund(paymentId, {
      amount: amount * 100,
      reason,
    });
    return refund;
  } catch (error) {
    console.error('Refund processing error:', error);
    throw new Error('Failed to process refund');
  }
};

// Get payment details
const getPaymentDetails = async (paymentId) => {
  try {
    const payment = await razorpay.payments.fetch(paymentId);
    return payment;
  } catch (error) {
    console.error('Payment fetch error:', error);
    throw new Error('Failed to fetch payment details');
  }
};

// Create payment link for penalty
const createPenaltyPaymentLink = async (amount, description, referenceId) => {
  try {
    const paymentLink = await razorpay.paymentLink.create({
      amount: amount * 100,
      currency: 'INR',
      description,
      reference_id: referenceId,
      callback_url: `http://localhost:3000`, // Replace with actual frontend URL
      callback_method: 'get',
    });
    return paymentLink;
  } catch (error) {
    console.error('Payment link creation error:', error);
    throw new Error('Failed to create payment link');
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  processRefund,
  getPaymentDetails,
  createPenaltyPaymentLink,
};
