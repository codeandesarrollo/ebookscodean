const stripe = require('stripe')('sk_live_...OWYZ');

app.post('/create-checkout-session', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: 'prod_S1TfHiN3Itp6c6', // Reemplaza con el ID de precio de tu producto
          quantity: 1,
        },
      ],
      mode: 'payment',
      // Aquí defines la URL de éxito:
      success_url: 'https://ebookscodean.vercel.app/exito.html?session_id={CHECKOUT_SESSION_ID}',
      // Y la URL de cancelación:
      cancel_url: 'https://ebookscodean.vercel.app/cancel',
    });

    res.json({ id: session.id });
  } catch (error) {
    res.status(500).send('Error creando la sesión de Checkout');
  }
});
