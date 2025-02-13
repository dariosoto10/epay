const initiatePayment = async (req, res) => {
  try {
    const { document, phone, amount } = req.body;
    
    // Validate client exists and has sufficient balance
    const client = await Client.findOne({ where: { document, phone } });
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    
    if (client.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Generate session ID and token
    const sessionId = generateUniqueSessionId();
    const token = generateSixDigitToken();

    // Store payment session
    await PaymentSession.create({
      sessionId,
      token,
      clientId: client.id,
      amount,
      status: 'pending'
    });

    // Check EMAIL_FEATURE flag
    const emailFeatureEnabled = process.env.EMAIL_FEATURE === 'true';

    if (emailFeatureEnabled && process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
      try {
        // Send token via email
        await sendEmail(client.email, 'Payment Confirmation Token', 
          `Your payment confirmation token is: ${token}\nSession ID: ${sessionId}`);
        
        // Only return session ID in response
        return res.status(200).json({
          message: 'Payment initiated. Check your email for the token.',
          sessionId,
          emailSent: true
        });
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        // If email fails, fall back to returning token in response
        return res.status(200).json({
          message: 'Payment initiated (email delivery failed)',
          sessionId,
          token,
          emailSent: false
        });
      }
    } else {
      // Return both token and session ID in response when email is disabled
      return res.status(200).json({
        message: 'Payment initiated',
        sessionId,
        token,
        emailSent: false
      });
    }

  } catch (error) {
    console.error('Payment initiation error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const confirmPayment = async (req, res) => {
  try {
    const { sessionId, token } = req.body;

    // Find payment session
    const session = await PaymentSession.findOne({
      where: { sessionId, status: 'pending' }
    });

    if (!session) {
      return res.status(404).json({ message: 'Invalid or expired session' });
    }

    // Validate token
    if (session.token !== token) {
      return res.status(400).json({ message: 'Invalid token' });
    }

    // Get client
    const client = await Client.findByPk(session.clientId);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Update balance
    const newBalance = client.balance - session.amount;
    await client.update({ balance: newBalance });

    // Update session status
    await session.update({ status: 'completed' });

    return res.status(200).json({
      message: 'Payment confirmed successfully',
      newBalance
    });

  } catch (error) {
    console.error('Payment confirmation error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Helper functions
const generateUniqueSessionId = () => {
  return `SES${Date.now()}${Math.random().toString(36).substr(2, 4)}`;
};

const generateSixDigitToken = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

module.exports = {
  initiatePayment,
  confirmPayment
}; 