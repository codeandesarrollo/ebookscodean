import Stripe from 'stripe';
import jwt from 'jsonwebtoken';

const stripe = new Stripe(process.env.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);
const JWT_SECRET = process.env.JWT_SECRET;

// Mapeo inline: priceId -> nombre del archivo PDF
const priceFileMap = {
  'price_1R7mzeCAX45Er1QqKB375ePk': 'una-aventura-magica.pdf',
  'price_1R7QiPCAX45Er1QqMDE26iz': 'El-legado-maldito.pdf',
  'price_1R81oMCAX45Er1QqOzEIzu6n': 'Piedra-Filosofal.pdf',
  'price_1R82VHCAX45Er1QqdlcymSH2': 'El-misterio-del-principe.pdf',
};

export default async function handler(req, res) {
  const { session_id } = req.query;

  if (!session_id) {
    return res.status(400).json({ error: 'Falta el parámetro session_id' });
  }

  try {
    // Consultar a Stripe la sesión de Checkout para verificar el pago
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status === 'paid') {
      // Obtenemos los line items para extraer el priceId
      const lineItems = await stripe.checkout.sessions.listLineItems(session_id);
      // Asumimos que el primer item es el producto comprado
      const priceId = lineItems.data[0].price.id;
      
      // Obtenemos el nombre del archivo asociado al priceId
      const fileName = priceFileMap[priceId];
      if (!fileName) {
        return res.status(400).json({ error: 'No se encontró archivo para este producto' });
      }

      // Genera un token único que expira en 1 hora e incluye el nombre del archivo
      const downloadToken = jwt.sign({ sessionId: session.id, fileName }, JWT_SECRET, { expiresIn: '1h' });

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
