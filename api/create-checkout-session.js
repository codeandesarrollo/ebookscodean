import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'No se proporcionaron productos' });
    }

    const line_items = items.map(item => ({
      price: item.priceId,
      quantity: item.quantity || 1,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: 'https://ebookscodean.vercel.app/exito.html?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://ebookscodean.vercel.app/',
    });

    return res.status(200).json({ id: session.id });
  } catch (error) {
    console.error('Error creando la sesión de Checkout:', error);
    return res.status(500).json({ error: 'Error creando la sesión de Checkout' });
  }
}
