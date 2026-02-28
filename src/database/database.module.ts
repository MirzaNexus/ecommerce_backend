import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule], // ConfigModule globally loaded
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: +configService.get('DB_PORT'), // string → number
        username: configService.get('DB_USER'),
        password: configService.get('DB_PASS'),
        database: configService.get('DB_NAME'),
        entities: ['dist/**/*.entity.js'],
        migrations: ['dist/database/migrations/*.js'],
        synchronize:
          configService.get('DB_SYNCHRONIZE') === 'true' &&
          configService.get('NODE_ENV') !== 'production', // always false in prod
        logging:
          configService.get('DB_LOGGING') === 'true' &&
          configService.get('NODE_ENV') !== 'production', // dev only
      }),
    }),
  ],
})
export class DatabaseModule {}
