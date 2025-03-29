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
    // Verificar el token y extraer el payload
    const payload = jwt.verify(token, JWT_SECRET);
    // Supongamos que el payload incluye el nombre del archivo, por ejemplo: { fileName: 'una-aventura-magica.pdf', ... }
    const { fileName } = payload;

    if (!fileName) {
      return res.status(400).send('Token no contiene el nombre del archivo.');
    }

    // Verificar si el token ya fue usado
    if (usedTokens.includes(token)) {
      return res.status(403).send('Este enlace ya ha sido utilizado.');
    }
    usedTokens.push(token);

    // Construir la ruta al PDF usando el nombre obtenido del token
    const pdfPath = path.join(process.cwd(), 'private', fileName);
    
    // Verificar que el archivo exista
    if (!fs.existsSync(pdfPath)) {
      return res.status(404).send('Archivo no encontrado.');
    }
    
    const fileBuffer = fs.readFileSync(pdfPath);

    // Configurar cabeceras para forzar la descarga
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    // Enviar el PDF como respuesta
    return res.send(fileBuffer);

  } catch (error) {
    return res.status(403).send('Token inválido o expirado');
  }
}
