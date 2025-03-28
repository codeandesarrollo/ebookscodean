const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Aquí colocas el código de tu endpoint:
const stripe = require('stripe')('sk_live_...'); // Tu clave secreta

app.post('/api/server', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          // ¡OJO! Asegúrate de usar el ID de precio (price_xxx), no el ID de producto (prod_xxx)
          price: 'price_1R7QiPCAX45Er1QqpMDE26iz',
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: 'https://ebookscodean.vercel.app/exito.html?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://ebookscodean.vercel.app/cancel',
    });
    // Retornamos el ID de la sesión
    res.json({ id: session.id });
  } catch (error) {
    console.error(error);
    // Devuelve JSON en caso de error, para que el frontend pueda parsearlo con response.json()
    res.status(500).json({ error: 'Error creando la sesión de Checkout' });
  }
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
