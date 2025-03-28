import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
let usedTokens = [];

export default function handler(req, res) {
  const { token } = req.query;

  if (!token) {
    return res.status(400).send('Falta el token');
  }

  try {
    // Verificar el token
    jwt.verify(token, JWT_SECRET);

    // Verificar si el token ya fue usado
    if (usedTokens.includes(token)) {
      return res.status(403).send('Este enlace ya ha sido utilizado.');
    }
    usedTokens.push(token);

    // Leer el PDF desde la carpeta 'private'
    const pdfPath = path.join(process.cwd(), 'private', 'una-aventura-magica.pdf');
    const fileBuffer = fs.readFileSync(pdfPath);

    // Configurar cabeceras para forzar la descarga
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="una-aventura-magica.pdf"');

    // Enviar el PDF como respuesta
    return res.send(fileBuffer);

  } catch (error) {
    return res.status(403).send('Token inválido o expirado');
  }
}
