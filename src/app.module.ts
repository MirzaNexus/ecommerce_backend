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
@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    EventEmitterModule.forRoot(),
    UserModule,
    AuthModule,
    ProductsModule,
    MediaModule,
    OrderModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
