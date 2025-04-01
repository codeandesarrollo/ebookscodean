import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import archiver from 'archiver';

const JWT_SECRET = process.env.JWT_SECRET;
let usedTokens = [];

export default async function handler(req, res) {
  const { token } = req.query;

  if (!token) {
    return res.status(400).send('Falta el token');
  }

  try {
    // Verificar el token y extraer el payload
    const payload = jwt.verify(token, JWT_SECRET);

    // Se puede recibir { fileName } o { fileNames: [] }
    const { fileName, fileNames } = payload;

    // Verificar si el token ya fue usado
    if (usedTokens.includes(token)) {
      return res.status(403).send('Este enlace ya ha sido utilizado.');
    }
    usedTokens.push(token);

    // Si se recibió un solo archivo, se descarga directamente
    if (fileName && !fileNames) {
      const pdfPath = path.join(process.cwd(), 'private', fileName);
      
      if (!fs.existsSync(pdfPath)) {
        return res.status(404).send('Archivo no encontrado.');
      }
      
      const fileBuffer = fs.readFileSync(pdfPath);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      return res.send(fileBuffer);
    }

    // Si se recibieron múltiples archivos, se crea un ZIP
    if (fileNames && Array.isArray(fileNames) && fileNames.length > 0) {
      // Configurar cabeceras para el ZIP
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="archivos.zip"`);

      const archive = archiver('zip', {
        zlib: { level: 9 }
      });

      // Capturar errores en el archive
      archive.on('error', err => {
        throw err;
      });

      // Enviar el stream al response
      archive.pipe(res);

      // Agregar cada archivo PDF al ZIP
      for (const file of fileNames) {
        const pdfPath = path.join(process.cwd(), 'private', file);
        if (fs.existsSync(pdfPath)) {
          archive.file(pdfPath, { name: file });
        }
      }

      // Finalizar el ZIP (esto envía los datos al response)
      await archive.finalize();
      return;
    }

    return res.status(400).send('Token no contiene información válida de archivo(s).');

  } catch (error) {
    console.error(error);
    return res.status(403).send('Token inválido o expirado');
  }
}
