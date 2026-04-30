import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { put } from '@vercel/blob';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Configure formidable
  const formOptions = {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    keepExtensions: true,
  };

  const form = formidable(formOptions);

  return new Promise((resolve) => {
    form.parse(req, async (err, fields, files) => {
      if (err) {
        // eslint-disable-next-line no-console
        console.error('Upload error:', err);
        res.status(500).json({ message: 'Error uploading file', error: err.message });
        resolve();
        return;
      }

      const fileData = files.file;

      if (!fileData) {
        // eslint-disable-next-line no-console
        console.error('No file in request. Files object:', files);
        res.status(400).json({ message: 'No file uploaded' });
        resolve();
        return;
      }

      const uploadedFile = Array.isArray(fileData) ? fileData[0] : fileData;

      try {
        // Upload to Vercel Blob
        const fileBuffer = fs.readFileSync(uploadedFile.filepath);
        const originalFilename = uploadedFile.originalFilename || uploadedFile.newFilename;
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(7);
        const fileExt = path.extname(originalFilename);
        const filename = `products/${timestamp}-${randomString}${fileExt}`;

        const blob = await put(filename, fileBuffer, {
          access: 'public',
          contentType: uploadedFile.mimetype || 'image/jpeg',
        });

        // eslint-disable-next-line no-console
        console.log('File uploaded to Vercel Blob:', blob.url);

        res.status(200).json({ url: blob.url });
        resolve();
      } catch (uploadError) {
        // eslint-disable-next-line no-console
        console.error('Upload error:', uploadError);
        res.status(500).json({
          message: 'Error uploading file',
          error: uploadError.message,
        });
        resolve();
      }
    });
  });
}
