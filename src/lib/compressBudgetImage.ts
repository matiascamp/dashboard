const MAX_IMAGE_SIDE = 1280;
const JPEG_QUALITY = 0.6;

export async function compressBudgetImage(file: File): Promise<File> {
  if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
    throw new Error('Solo se permiten imágenes JPG o PNG.');
  }

  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, MAX_IMAGE_SIDE / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');
    if (!context) throw new Error('No se pudo preparar la imagen para el presupuesto.');

    // Flatten transparent PNGs on white as part of the JPEG conversion.
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, width, height);
    context.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) => result ? resolve(result) : reject(new Error('No se pudo comprimir la imagen.')),
        'image/jpeg',
        JPEG_QUALITY,
      );
    });

    const baseName = file.name.replace(/\.[^.]+$/, '') || 'imagen';
    return new File([blob], `${baseName}.jpg`, {
      type: 'image/jpeg',
      lastModified: Date.now(),
    });
  } finally {
    bitmap.close();
  }
}
