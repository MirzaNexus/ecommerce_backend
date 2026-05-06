import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';
import { ProductsModule } from './modules/products/products.module';
import { MediaModule } from './modules/media/media.module';
import { OrderModule } from './modules/order/order.module';
import { NotificationModule } from './modules/notification/notification.module';
import { FirebaseAdminModule } from './common/firebase/firebase-admin.module';
import { RecommendationModule } from './modules/recommendation/recommendation.module';
import { GuidedShoppingModule } from './modules/guided-shopping/guided-shopping.module';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    ConfigModule,
    CacheModule.register({
      isGlobal: true,
      ttl: 300000,
    }),
    FirebaseAdminModule,
    DatabaseModule,
    EventEmitterModule.forRoot(),
    UserModule,
    AuthModule,
    ProductsModule,
    MediaModule,
    OrderModule,
    NotificationModule,
    EventEmitterModule.forRoot({
      wildcard: false,
      delimiter: '.',
      newListener: false,
      removeListener: false,
      maxListeners: 10,
      verboseMemoryLeak: false,
      ignoreErrors: false,
    }),
    RecommendationModule,
    GuidedShoppingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
