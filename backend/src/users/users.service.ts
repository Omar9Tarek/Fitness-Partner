import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AddressDto, User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import { MailService } from '../auth/mail/mail.service';
import { Product, ProductDocument } from '../products/schema/product.schema';
@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly mailService: MailService,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findById(id: string): Promise<User> {
    const user = await this.userModel.findOne({ id }).exec();
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findByEmailAndUpdate(
    email: string,
    updateData: any,
  ): Promise<User | null> {
    return this.userModel
      .findOneAndUpdate({ email }, { $set: updateData }, { new: true })
      .exec();
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const newUser = new this.userModel({
      ...createUserDto,
      id: uuidv4(),
      orders: [],
    });
    return newUser.save();
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const updatedUser = await this.userModel
      .findOneAndUpdate({ id }, updateUserDto, { new: true })
      .exec();

    if (!updatedUser) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    return updatedUser;
  }

  async delete(id: string): Promise<User | null> {
    return this.userModel.findByIdAndDelete(id).exec();
  }

  async remove(id: string): Promise<User> {
    const deletedUser = await this.userModel.findOneAndDelete({ id }).exec();

    if (!deletedUser) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    return deletedUser;
  }

  async updatePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.userModel.findOne({ id: userId });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return { message: 'Password updated successfully' };
  }

  async addOrder(userId: string, orderData: any): Promise<any> {
    try {
      console.log('Adding order - original data:', JSON.stringify(orderData, null, 2));
      
      // Ensure products array exists
      if (!orderData.products || !Array.isArray(orderData.products)) {
        orderData.products = [];
      }

      // For each product, fetch additional details if needed
      const validatedProducts = await Promise.all(orderData.products.map(async (product) => {
        // If price is missing or invalid, try to fetch from product database
        let price = this.parseNumberStrict(product.price);
        let name = product.name;
        
        if (price === 0 || !name) {
          try {
            const productDetails = await this.productModel.findOne({ id: product.productId }).exec();
            if (productDetails) {
              if (price === 0) {
                price = this.parseNumberStrict(productDetails.price);
                console.log(`Updated price for ${product.productId} from DB: ${price}`);
              }
              if (!name) {
                name = productDetails.name || 'Unknown Product';
              }
            }
          } catch (err) {
            console.error(`Error fetching product details for ${product.productId}:`, err);
          }
        }
        
        // Ensure quantity is at least 1
        const quantity = Math.max(1, this.parseNumberStrict(product.quantity));
        
        return {
          productId: product.productId || '',
          name: name || 'Unknown Product',
          price: price,
          quantity: quantity,
          flavor: product.flavor || ''
        };
      }));

      // Log the validated products for debugging
      console.log('Validated products:', JSON.stringify(validatedProducts, null, 2));

      // Calculate total with strict number handling
      const total = validatedProducts.reduce((sum, product) => {
        const subtotal = product.price * product.quantity;
        console.log(`Product subtotal calculation: ${product.price} * ${product.quantity} = ${subtotal}`);
        return sum + subtotal;
      }, 0);

      console.log(`Total order value calculated: ${total}`);

      const order = {
        ...orderData,
        products: validatedProducts,
        total: total,
        status: 'confirmed'
      };

      const updatedUser = await this.userModel.findOneAndUpdate(
        { id: userId },
        { $push: { orders: order } },
        { new: true }
      ).exec();

      if (!updatedUser) {
        throw new NotFoundException(`User with ID "${userId}" not found`);
      }
      await this.mailService.sendOrderConfirmationEmail(updatedUser.email,order)
      return updatedUser;
    } catch (error) {
      console.error('Error adding order:', error);
      throw error;
    }
  }

  // Improved number parsing with stricter validation
  private parseNumberStrict(value: any, defaultValue: number = 0): number {
    // Handle empty strings, null, undefined
    if (value === '' || value === null || value === undefined) {
      return defaultValue;
    }
    
    // Convert to number if it's a string
    const parsed = typeof value === 'string' ? Number(value) : value;
    
    // Validate the result is a finite number
    if (typeof parsed !== 'number' || isNaN(parsed) || !isFinite(parsed)) {
      return defaultValue;
    }
    
    return parsed;
  }

  // Helper to ensure values are valid numbers - maintained for backward compatibility
  private ensureNumber(value: any, defaultValue: number = 0): number {
    return this.parseNumberStrict(value, defaultValue);
  }

  private async enrichOrderProducts(products: any[]): Promise<any[]> {
    return Promise.all(products.map(async (product) => {
      try {
        const productDetails = await this.productModel.findOne({ id: product.productId }).exec();
        const price = this.parseNumberStrict(productDetails?.price);
        
        console.log(`Enriched product ${product.productId}: found price ${price}`);
        
        return {
          ...product,
          name: productDetails?.name || 'Unknown Product',
          price: price
        };
      } catch (error) {
        console.error(`Error enriching product ${product.productId}:`, error);
        return {
          ...product,
          name: product.name || 'Unknown Product',
          price: this.parseNumberStrict(product.price)
        };
      }
    }));
  }

  async updateRoleByAdmin(id: string, newRole: string): Promise<User> {
    const updatedUser = await this.userModel.findOneAndUpdate(
      { id },
      { $set: { role: newRole } },
      { new: true }
    ).exec();

    if (!updatedUser) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    return updatedUser;
  }

  async updateByAdmin(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    // Admin can update any fields including restricted ones
    const updatedUser = await this.userModel.findOneAndUpdate(
      { id },
      updateUserDto,
      { new: true }
    ).exec();

    if (!updatedUser) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    return updatedUser;
  }

  async fixInvalidOrders() {
    try {
      console.log('Starting to fix invalid orders...');
      
      const users = await this.userModel.find().exec();
      console.log(`Found ${users.length} users to check for invalid orders`);
      
      let fixCount = 0;
      
      for (const user of users) {
        if (!user.orders || !Array.isArray(user.orders)) {
          continue;
        }
        
        let modified = false;
        
        for (const order of user.orders) {
          // Check if total is NaN, null, undefined, 0, or not a finite number
          if (order.total === null || order.total === undefined || 
              isNaN(order.total) || !isFinite(order.total) || order.total === 0) {
            
            console.log(`Fixing order ${order.id} for user ${user.id || 'unknown'}`);
            console.log('Original order details:', JSON.stringify({
              products: order.products?.length || 0,
              total: order.total
            }, null, 2));
            
            // Calculate correct total from products - with more detailed debugging
            let calculatedTotal = 0;
            
            if (order.products && Array.isArray(order.products)) {
              // First, try to enrich products with actual prices if needed
              const enrichedProducts = await this.enrichOrderProducts(order.products);
              order.products = enrichedProducts;
              
              // Then calculate the total
              calculatedTotal = enrichedProducts.reduce((sum, product) => {
                const price = this.parseNumberStrict(product.price);
                const quantity = this.parseNumberStrict(product.quantity, 1);
                const subtotal = price * quantity;
                
                console.log(`Product calculation: ${product.name} - ${price} * ${quantity} = ${subtotal}`);
                
                return sum + subtotal;
              }, 0);
            }
            
            console.log(`Calculated new total: ${calculatedTotal}`);
            
            // Set the corrected total - only if we actually have a non-zero value
            if (calculatedTotal > 0) {
              order.total = calculatedTotal;
              modified = true;
              fixCount++;
            } else {
              console.log('Could not calculate a valid non-zero total');
            }
          }
        }
        
        if (modified) {
          await user.save();
          console.log(`Fixed orders for user ${user.id}`);
        }
      }
      
      console.log(`Fixed ${fixCount} invalid orders`);
      return { fixedCount: fixCount };
    } catch (error) {
      console.error('Error fixing invalid orders:', error);
      throw error;
    }
  }

  async getOrderStats() {
    try {
      const users = await this.userModel.find({}, 'id orders').lean().exec();
      console.log('Fetched users with orders:', users.length);

      let totalOrders = 0;
      let totalRevenue = 0;
      let invalidOrders = 0;
      let zeroValueOrders = 0;

      users.forEach(user => {
        console.log(`User ${user.id} has ${user.orders?.length || 0} orders`);
        
        if (user.orders && Array.isArray(user.orders)) {
          user.orders.forEach(order => {
            // Convert to number to handle any string values
            const orderTotal = this.parseNumberStrict(order.total);
            
            console.log('Order details:', {
              id: order.id,
              total: orderTotal,
              originalTotal: order.total,
              valid: !isNaN(orderTotal) && isFinite(orderTotal),
              products: order.products?.length || 0
            });
            
            // Log product details for debugging
            if (order.products && Array.isArray(order.products)) {
              order.products.forEach((product, index) => {
                console.log(`  Product ${index + 1}: ${product.name}, price: ${product.price}, qty: ${product.quantity}`);
              });
            }
            
            if (!isNaN(orderTotal) && isFinite(orderTotal)) {
              if (orderTotal > 0) {
                totalOrders++;
                totalRevenue += orderTotal;
              } else {
                zeroValueOrders++;
              }
            } else {
              invalidOrders++;
            }
          });
        }
      });
      
      console.log('Order stats:', { 
        totalOrders, 
        totalRevenue, 
        invalidOrders,
        zeroValueOrders,
        avgOrderValue: totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : 0
      });
      
      return { 
        totalOrders, 
        totalRevenue,
        invalidOrders,
        zeroValueOrders,
        avgOrderValue: totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : 0
      };
    } catch (error) {
      console.error('Error in getOrderStats:', error);
      throw error;
    }
  }

  async getAllOrders(): Promise<any[]> {
    try {
      const users = await this.userModel.find({}, 'id email orders')
        .lean<Array<{ id: string; email: string; orders: any[] }>>()
        .exec();

      const allOrders: any[] = [];
      
      users.forEach(user => {
        if (user.orders?.length) {
          user.orders.forEach(order => {
            // Ensure total is a valid number
            const validTotal = this.parseNumberStrict(order.total);
            
            // Convert LeanOrder to Order with validated values
            const formattedOrder: any = {
              ...order,
              userId: user.id,
              userEmail: user.email,
              // Ensure total is a valid number
              total: validTotal,
              products: Array.isArray(order.products) ? order.products.map(p => ({
                productId: p.productId || '',
                quantity: this.parseNumberStrict(p.quantity, 1),
                flavor: p.flavor || '',
                price: this.parseNumberStrict(p.price),
                name: p.name || 'Unknown Product'
              })) : [],
              address: order.address || { 
                street: '', 
                city: '', 
                state: '', 
                zipCode: '', 
                country: '' 
              }
            };
            
            allOrders.push(formattedOrder);
          });
        }
      });
      
      return allOrders;
    } catch (error) {
      console.error('Error getting all orders:', error);
      throw error;
    }
  }

  async cancelOrder(userId: string, orderId: string): Promise<User> {
    const updatedUser = await this.userModel.findOneAndUpdate(
      { id: userId, 'orders.id': orderId },
      { $set: { 'orders.$.status': 'cancelled' } },
      { new: true }
    ).exec();

    if (!updatedUser) {
      throw new NotFoundException('Order or user not found');
    }

    // Send cancellation email
    await this.mailService.sendOrderCancellation(
      updatedUser.email, orderId
    );

    return updatedUser;
  }

  async updateOrder(userId: string, orderId: string, updateData: any): Promise<User> {
    try {
      const updateObject: any = {};
      
      // Build dynamic update object
      for (const key in updateData) {
        if (key !== 'products') { // Handle products separately
          updateObject[`orders.$.${key}`] = updateData[key];
        }
      }

      // Recalculate total if products change
      if (updateData.products && Array.isArray(updateData.products)) {
        // First, enrich products with actual prices from db if needed
        const enrichedProducts = await this.enrichOrderProducts(updateData.products);
        
        // Validate products with enriched data
        const validatedProducts = enrichedProducts.map(product => ({
          productId: product.productId || '',
          name: product.name || 'Unknown Product',
          price: this.parseNumberStrict(product.price),
          quantity: this.parseNumberStrict(product.quantity, 1),
          flavor: product.flavor || ''
        }));
        
        // Calculate total with strict number handling and detailed logging
        let calculatedTotal = 0;
        validatedProducts.forEach(product => {
          const subtotal = product.price * product.quantity;
          console.log(`Update order calculation: ${product.name} - ${product.price} * ${product.quantity} = ${subtotal}`);
          calculatedTotal += subtotal;
        });
        
        console.log(`Update order: calculated new total: ${calculatedTotal}`);
        
        updateObject['orders.$.products'] = validatedProducts;
        updateObject['orders.$.total'] = calculatedTotal;
      }

      const updatedUser = await this.userModel.findOneAndUpdate(
        { id: userId, 'orders.id': orderId },
        { $set: updateObject },
        { new: true }
      ).exec();

      if (!updatedUser) {
        throw new NotFoundException('Order or user not found');
      }

      return updatedUser;
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  }

    // Address related methods
    async saveUserAddress(userId: string, addressData: AddressDto): Promise<any> {
      try {
        // Find user using both possible ID fields
        const user = await this.userModel.findOne({
          $or: [
            { uuid: userId },
            { id: userId }
          ]
        });
        
        if (!user) {
          throw new NotFoundException(`User with ID ${userId} not found`);
        }
    
        // Fix validation issues with existing orders
        if (user.orders && user.orders.length > 0) {
          // Ensure all orders have required userId and userEmail fields
          user.orders = user.orders.map(order => {
            // Use markModified if you're using mongoose and updating nested properties
            if (!order.userId) {
              order.userId = userId;
            }
            if (!order.userEmail) {
              order.userEmail = user.email; // Assuming user object has email
            }
            return order;
          });
          
          // Mark the orders array as modified to ensure Mongoose detects the changes
          user.markModified('orders');
        }
    
        // Create address with a unique ID
        const addressId = uuidv4();
        const newAddress = {
          id: addressId,
          street: addressData.street,
          city: addressData.city,
          state: addressData.state,
          zipCode: addressData.zipCode,
          country: addressData.country,
          isDefault: addressData.isDefault || false
        };
    
        // Handle default address logic
        if (addressData.isDefault === true || !user.addresses || user.addresses.length === 0) {
          if (user.addresses && user.addresses.length > 0) {
            user.addresses = user.addresses.map(addr => ({
              ...addr,
              isDefault: false
            }));
          }
          newAddress.isDefault = true;
        }
    
        // Add the new address to the user's addresses array
        if (!user.addresses) {
          user.addresses = [];
        }
        user.addresses.push(newAddress);
        user.markModified('addresses');
    
        // Save the updated user document
        await user.save();
        
        return newAddress;
      } catch (error) {
        console.error('Error in saveUserAddress service method:', error);
        throw new Error(error.message || 'Failed to save address');
      }
    }
    
    // 2. Alternative approach: Create a fix-user-orders utility function
    async fixUserOrders(userId: string): Promise<boolean> {
      try {
        // Find the user first
        const user = await this.userModel.findOne({ id: userId });
        if (!user) {
          throw new Error(`User with ID ${userId} not found`);
        }
    
        // Skip if no orders or already valid
        if (!user.orders || user.orders.length === 0) {
          return true;
        }
    
        // Check if we need to update any orders
        let needsUpdate = false;
        user.orders.forEach(order => {
          if (!order.userId || !order.userEmail) {
            needsUpdate = true;
            order.userId = order.userId || userId;
            order.userEmail = order.userEmail || user.email;
          }
        });
    
        // Save only if updates were needed
        if (needsUpdate) {
          user.markModified('orders');
          await user.save();
          console.log(`Fixed orders for user ${userId}`);
        }
    
        return true;
      } catch (error) {
        console.error('Error fixing user orders:', error);
        throw error;
      }
    }



    async getUserAddresses(userId: string) {
      const user = await this.userModel.findOne({
        $or: [
          { uuid: userId },
          { id: userId }
        ]
      }).exec();
      
      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }
      return user.addresses || [];
    }
    
    // 4. And fix the setDefaultAddress method
    async setDefaultAddress(userId: string, addressId: string) {
      try {
        const user = await this.userModel.findOne({
          $or: [
            { uuid: userId },
            { id: userId }
          ]
        }).exec();
        
        if (!user) {
          throw new NotFoundException(`User with ID ${userId} not found`);
        }
    
        const addressIndex = user.addresses.findIndex(addr => addr.id === addressId);
        if (addressIndex === -1) {
          throw new NotFoundException(`Address with ID ${addressId} not found`);
        }
    
        user.addresses.forEach(addr => addr.isDefault = false);
        user.addresses[addressIndex].isDefault = true;
        
        await user.save();
        
        return { 
          message: 'Default address updated successfully',
          address: user.addresses[addressIndex]
        };
      } catch (error) {
        console.error('Error setting default address:', error);
        throw error;
      }
    }
    
    async getUserByUuid(uuid: string): Promise<any> {
      try {
        // Check both uuid and id fields to handle any inconsistencies
        const user = await this.userModel.findOne({ 
          $or: [
            { uuid: uuid },
            { id: uuid }
          ] 
        }).exec();
        
        if (!user) {
          throw new NotFoundException(`User with UUID ${uuid} not found`);
        }
        return user;
      } catch (error) {
        console.error('Error in getUserByUuid:', error);
        throw error;
      }
    }
}