import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import appConfig from './app.config';
import ormConfig from './orm.config';
import cloudinaryConfig from './cloudinary.config';
import firebaseConfig from './firebase.config';
import geminiConfig from './gemini.config';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      load: [
        firebaseConfig,
        appConfig,
        ormConfig,
        cloudinaryConfig,
        geminiConfig,
      ],
      envFilePath:
        process.env.NODE_ENV === 'production' ? '.env.production' : '.env',
    }),
  ],
})
export class ConfigModule {}
