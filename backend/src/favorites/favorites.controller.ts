// src/favorites/favorites.controller.ts
import { Controller, Get, Post, Delete, Param, UseGuards, Req } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('favorites')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  getFavorites(@Req() req) {
    return this.favoritesService.getFavorites(req.user.email); // <-- email
  }
  
  @Post(':productId')
async addFavorite(@Param('productId') productId: string, @Req() req) {
  const user = await this.favoritesService.addFavorite(req.user.email, productId);
  return user?.favorites || []; // Return just the favorites array or an empty array if user is null
}
  
@Delete(':productId')
async removeFavorite(@Param('productId') productId: string, @Req() req) {
  const user = await this.favoritesService.removeFavorite(req.user.email, productId);
  return user?.favorites || []; // Return just the favorites array
}
  @Delete()
  clearFavorites(@Req() req) {
  return this.favoritesService.clearFavorites(req.user.email);
}
}
