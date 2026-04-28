import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  v2 as cloudinary,
  UploadApiResponse,
  UploadApiErrorResponse,
} from 'cloudinary';

@Injectable()
export class MediaService {
  constructor(private configService: ConfigService) {
    // Cloudinary Configuration
    cloudinary.config({
      cloud_name: this.configService.get('cloudinary.cloudName'),
      api_key: this.configService.get('cloudinary.apiKey'),
      api_secret: this.configService.get('cloudinary.apiSecret'),
    });
  }

  async uploadImage(
    file: Express.Multer.File,
    folder: string = 'general',
  ): Promise<string> {
    if (!file) {
      throw new BadRequestException('File is missing');
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `fyp-ecommerce/${folder}`, // Organized folder structure
          resource_type: 'auto',
        },
        (error?: UploadApiErrorResponse, result?: UploadApiResponse) => {
          if (error) return reject(error);
          if (!result)
            return reject(new Error('Cloudinary upload failed: No result'));

          resolve(result.secure_url);
        },
      );

      // Buffer (RAM data) ko stream ke zariye Cloudinary bhejna
      uploadStream.end(file.buffer);
    });
  }
}
