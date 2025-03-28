import Stripe from 'stripe';
import jwt from 'jsonwebtoken';

// Inicializa Stripe con tu clave secreta (ya configurada en las variables de entorno en Vercel)
const stripe = new Stripe(process.env.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);
// Usamos la misma clave para firmar el token JWT (asegúrate de tener JWT_SECRET en tus variables)
const JWT_SECRET = process.env.JWT_SECRET;

export default async function handler(req, res) {
  const { session_id } = req.query;

  if (!session_id) {
    return res.status(400).json({ error: 'Falta el parámetro session_id' });
  }

  try {
    // Consultar a Stripe la sesión de Checkout para verificar el pago
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status === 'paid') {
      // Genera un token único que expira en 1 hora
      const downloadToken = jwt.sign({ sessionId: session.id }, JWT_SECRET, { expiresIn: '1h' });

      // Construye la URL de descarga apuntando a tu endpoint descarga.js
      const downloadUrl = `https://ebookscodean.vercel.app/api/descarga?token=${downloadToken}`;

      return res.status(200).json({ success: true, downloadUrl });
    } else {
      return res.status(200).json({ success: false, message: 'El pago no está confirmado' });
    }
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}
