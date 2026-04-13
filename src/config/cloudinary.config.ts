import { registerAs } from '@nestjs/config';

export default registerAs('cloudinary', () => ({
  cloudName: process.env.CLOUDINARY_NAME,
  apiKey: process.env.CLOUDINARY_API_KEY,
  apiSecret: process.env.CLOUDINARY_API_SECRET,
}));
/**
 * CLOUDINARY_NAME=db4af9uxi
CLOUDINARY_API_KEY=987966835611187
CLOUDINARY_API_SECRET=gOK57bkn6r3tAZLukhDgVWOT-nw
 */
