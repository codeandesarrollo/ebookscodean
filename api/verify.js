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
      // Obtenemos los line items para extraer los priceId
      const lineItems = await stripe.checkout.sessions.listLineItems(session_id);

      // Mapear cada item a su archivo correspondiente (si existe)
      const fileNames = lineItems.data
        .map(item => {
          const priceId = item.price.id;
          return priceFileMap[priceId];
        })
        .filter(fileName => fileName); // Filtrar si no se encuentra archivo

      if (fileNames.length === 0) {
        return res.status(400).json({ error: 'No se encontraron archivos para los productos adquiridos' });
      }

      // Genera un token único que expira en 1 hora e incluye el arreglo de archivos
      const downloadToken = jwt.sign({ sessionId: session.id, fileNames }, JWT_SECRET, { expiresIn: '1h' });

      // Construye la URL de descarga apuntando a tu endpoint de descarga
      const downloadUrl = `https://ebookscodean.vercel.app/api/descarga?token=${downloadToken}`;

      return res.status(200).json({ success: true, downloadUrl });
    } else {
      return res.status(200).json({ success: false, message: 'El pago no está confirmado' });
    }
  } catch (error) {
    console.error('Error creando la sesión de Checkout:', error);
    return res.status(400).json({ error: error.message });
  }
}
