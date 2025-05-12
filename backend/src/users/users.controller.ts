import {
  Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Req,
  UsePipes,
  ValidationPipe,
  HttpException,
  HttpStatus,
  NotFoundException
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { AddressDto } from './schemas/user.schema';
import { v4 as uuidv4 } from 'uuid';
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ✅ Admin: Get all users
  @Get()
  @Roles('admin')
  findAll() {
    return this.usersService.findAll();
  }

  // ✅ Admin: Get single user by ID
  @Get(':id')
  // @Roles('admin')
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  // ✅ Admin: Create a new user manually (not signup)
  @Post('admin')
  @Roles('admin')
  createByAdmin(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // ✅ Admin: Update a user's information
  @Put('admin/:id')
  @Roles('admin')
  async updateByAdmin(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  // ✅ Admin: Delete a user
  @Delete('admin/:id')
  @Roles('admin')
  async deleteByAdmin(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  // 👤 User: Update own profile (no admin role needed)
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  // 👤 User: Update own password
  @Put(':id/password')
  async updatePassword(
    @Param('id') id: string,
    @Body() passwordUpdateDto: { currentPassword: string; newPassword: string },
    @Req() request,
  ) {
    const requestingUserId = request.user.userId;
    return this.usersService.updatePassword(
      id,
      passwordUpdateDto.currentPassword,
      passwordUpdateDto.newPassword,
    );
  }

  // 👤 User: Delete own account
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Post(':id/orders')
  async addOrder(@Param('id') id: string, @Body() order: any) {
    return this.usersService.addOrder(id, order);
  }


  // 👤 User: Add a new address
  @Post(':id/addresses')
  @UsePipes(new ValidationPipe({ transform: true }))
  async saveUserAddress(
    @Param('id') id: string,
    @Body() addressData: AddressDto
  ) {
    console.log('Received address data for user ID:', id, addressData);
    try {
      // First attempt to fix any existing orders
      try {
        await this.usersService.fixUserOrders(id);
      } catch (fixError) {
        console.warn('Non-critical error when fixing orders:', fixError);
      }
      
      // Then try to save the address
      const newAddress = await this.usersService.saveUserAddress(id, addressData);
      return newAddress;
    } catch (error) {
      console.error('Error saving address:', error);
      
      // Check for validation errors specifically
      if (error.name === 'ValidationError' || 
          (error.message && error.message.includes('validation failed'))) {
        
        throw new HttpException(
          `Failed to save address: Please contact support with error code USR-ORD-VAL`,
          HttpStatus.BAD_REQUEST
        );
      }
      
      // Handle other error types
      if (error instanceof NotFoundException) {
        throw new HttpException(
          `Failed to save address: ${error.message}`,
          HttpStatus.NOT_FOUND
        );
      }
      
      throw new HttpException(
        `Failed to save address: ${error.message || 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
  

  // 👤 User: Get all addresses
  @UseGuards(JwtAuthGuard)
  @Get(':id/addresses')
  async getUserAddresses(@Param('id') id: string) {
    return this.usersService.getUserAddresses(id);
  }

  // 👤 User: Set default address
  @UseGuards(JwtAuthGuard)
  @Put(':id/addresses/:addressId/default')
  async setDefaultAddress(
    @Param('id') id: string,
    @Param('addressId') addressId: string
  ) {
    return this.usersService.setDefaultAddress(id, addressId);
  }

  //////

  @Put('admin/:id/role')
  @Roles('admin')
  async updateUserRoleByAdmin(
    @Param('id') id: string,
    @Body() dto: { role: 'user' | 'admin' | 'moderator' }
  ) {
    return this.usersService.updateRoleByAdmin(id, dto.role);
  }

  @Get('admin/order-stats')
  @Roles('admin')
  getOrderStats() {
    return this.usersService.getOrderStats();
  }

  @Get('admin/orders')
  @Roles('admin')
  getAllOrders() {
    return this.usersService.getAllOrders();
  }

  @Delete('admin/orders/:userId/:orderId')
  @Roles('admin')
  async cancelOrder(
    @Param('userId') userId: string,
    @Param('orderId') orderId: string
  ) {
    return this.usersService.cancelOrder(userId, orderId);
  }

  @Put('admin/orders/:userId/:orderId')
  @Roles('admin')
  async updateOrder(
    @Param('userId') userId: string,
    @Param('orderId') orderId: string,
    @Body() updateOrderDto: any
  ) {
    return this.usersService.updateOrder(userId, orderId, updateOrderDto);
  }
}
