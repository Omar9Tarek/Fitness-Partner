import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { EmailModule } from './email/email.module';
import { ProductsModule } from './products/products.module';
import { ExerciseModule } from './exercise/exercise.module';
import { CartModule } from './cart/cart.module'; // <<== ADD THIS LINE!
import { FavoritesModule } from './favorites/favorites.module';
import { TrainerModule } from './trainers/trainers.module';
import { MailModule } from './auth/mail/mail.module';
import { GymMachineController } from './gym-machine/gym-machine.controller';
import { GymMachineModule } from './gym-machine/gym-machine.module';
import { DietGeminiModule } from './diet-ai/diet-ai.module';
import { WorkoutsModule } from './workouts/workout.model';
import { MeasurementsModule } from './measurement/measurements.module';
import { ContactModule } from './contact/contact.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const uri = configService.get<string>('MONGODB_URI');
        return { uri };
      },
    }),
    AuthModule,
    UsersModule,
    EmailModule,
    ProductsModule,
    ExerciseModule,
    CartModule,
    FavoritesModule,
    MailModule,
    TrainerModule,
  GymMachineModule,
  DietGeminiModule,
  WorkoutsModule,
  MeasurementsModule,
  ContactModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
