const stripe = require('stripe')('sk_live_...'); // Tu clave secreta
app.post('/api/server', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: 'prod_S1TfHiN3Itp6c6', // ID de precio de tu producto
          quantity: 1,
        },
      ],
      mode: 'payment',
      // Define la URL de éxito con el placeholder de la sesión
      success_url: 'https://ebookscodean.vercel.app/exito.html?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://ebookscodean.vercel.app/cancel',
    });
    res.json({ id: session.id });
  } catch (error) {
    res.status(500).send('Error creando la sesión de Checkout');
  }
});
