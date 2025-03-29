import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // 1. Obtenemos el priceId que se envía desde el front-end
    const { priceId } = req.body;

    // 2. Creamos la sesión de Checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId, // Usamos el priceId recibido
          quantity: 1,    // Ajusta la cantidad según tu caso
        },
      ],
      mode: 'payment',
      success_url: 'https://ebookscodean.vercel.app/exito.html?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://ebookscodean.vercel.app/cancel',
    });

    return res.status(200).json({ id: session.id });
  } catch (error) {
    console.error('Error creando la sesión de Checkout:', error);
    return res.status(500).json({ error: 'Error creando la sesión de Checkout' });
  }
}
