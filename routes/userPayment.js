
const express = require('express');
const stripe = require('stripe')("sk_test_51NL7SRGtkA0JzOs1tV5a6mbMY3dD8z7cGOZT5oIVyzvUJsNSOBnftc3hc5kXZuWOi8ZLo9gSob329K63k6Wwabcy00JmZVSjhT");
const controller = require('../Controller/userController')
const UserSchema = require('../Model/userModel')

const router = express.Router();
const { isAdminAndisUser } = require('./../Middlewares/authenticatedMiddleware')




// Route to handle successful payment
router.get('/success', async (req, res, next) => {
  const { session_id } = req.query;
  try {
    // Retrieve the session details from Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id);

    // Check if the payment was successful
    if (session && session.payment_status === 'paid') {
      // Retrieve the user by session ID
      const user = await UserSchema.findOne({ stripeCheckoutSessionId: session_id });

      if (!user) {
        throw new Error('User not found');
      }

      // Update the user's pro status
      user.pro = true;
      await user.save();

      // Close the payment window
      res.send('<script>window.close();</script>');
      res.status(200).json({ message: 'Payment successful' });
    } else {
      throw new Error('Payment failed');
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
});


// Route to handle canceled payment
router.get('/cancel', (req, res) => {
  res.send('<script>window.close();</script>');
  res.status(200).json({ message: 'Payment canceled' });
});


// Route to check payment status
router.get('/payment/status/:sessionId', (req, res, next) => {
  const session_id = req.params.sessionId;
  console.log(session_id);
  stripe.checkout.sessions
    .retrieve(session_id)
    .then((session) => {
      if (session && session.payment_status === 'paid') {
        // Payment was successful
        res.status(200).json({ status: 'paid' });
      } else {
        // Payment was canceled or failed
        res.status(200).json({ status: 'canceled' });
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ error: 'Failed to check payment status' });
    });
});

module.exports = router;

