
import { Module } from '@nestjs/common';
import { FavoritesController } from './favorites.controller';
import { FavoritesService } from './favorites.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../users/schemas/user.schema';

@Module({
  imports: [
    // Grant access to User model operations
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])
  ],
  controllers: [FavoritesController],
  providers: [FavoritesService],
  exports: [FavoritesService] // <-- Add this if other modules need favorites functionality
})
export class FavoritesModule {}