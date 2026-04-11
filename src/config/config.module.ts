import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import appConfig from './app.config';
import ormConfig from './orm.config';
import cloudinaryConfig from './cloudinary.config';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, ormConfig, cloudinaryConfig],
      envFilePath:
        process.env.NODE_ENV === 'production' ? '.env.production' : '.env',
    }),
  ],
})
export class ConfigModule {}
