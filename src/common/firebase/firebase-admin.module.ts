import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import * as path from 'path';

@Global()
@Module({
  providers: [
    {
      provide: 'FIREBASE_ADMIN',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        if (admin.apps.length === 0) {
          const serviceAccountPath = configService.get<string>(
            'firebase.serviceAccountPath',
          );

          if (!serviceAccountPath) {
            console.error('❌ FIREBASE_SERVICE_ACCOUNT_PATH is missing!');
            return null;
          }

          const resolvedPath = path.resolve(process.cwd(), serviceAccountPath);

          try {
            const app = admin.initializeApp({
              credential: admin.credential.cert(resolvedPath),
            });
            console.log(
              '✅ Firebase Admin Initialized Successfully at:',
              resolvedPath,
            );
            return app;
          } catch (error) {
            console.error(
              '❌ Firebase Initialization Error:',
              (error as Error).message,
            );
            return null;
          }
        }
        return admin.app();
      },
    },
  ],
  exports: ['FIREBASE_ADMIN'],
})
export class FirebaseAdminModule {}
