import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import configuration from './config/configuration';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { validationSchema } from './config/validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
    }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const username = encodeURIComponent(configService.get<string>('mongo.username'));
        const password = encodeURIComponent(configService.get<string>('mongo.password'));
        const dbname = encodeURIComponent(configService.get<string>('mongo.db'));
        const uri = `mongodb+srv://${username}:${password}@cluster0.cnocwqd.mongodb.net/${dbname}?retryWrites=true&w=majority`;

        return { uri };
      },
    }),

    UsersModule,
    AuthModule,
  ],
})
export class AppModule {}
