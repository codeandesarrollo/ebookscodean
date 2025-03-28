import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          // Usa el ID de precio (price_...) y no el ID del producto
          price: 'price_1R7QiPCAX45Er1QqpMDE26iz',
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: 'https://ebookscodean.vercel.app/exito.html?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://ebookscodean.vercel.app/cancel',
    });

    return res.status(200).json({ id: session.id });
  } catch (error) {
    console.error('Error creando la sesión de Checkout:', error);
    console.log('STRIPE_SECRET_KEY:', JSON.stringify(process.env.STRIPE_SECRET_KEY));

    return res.status(500).json({ error: 'Error creando la sesión de Checkout' });
  }
}
