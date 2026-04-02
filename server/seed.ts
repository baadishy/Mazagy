import mongoose from 'mongoose';
import { User } from './models/User';
import { Product } from './models/Product';
import { Order } from './models/Order';
import { Notification } from './models/Notification';
import { Review } from './models/Review';

export const seedData = async () => {
  try {
    // 1. Clear existing data (optional, but recommended for a clean start on a new DB)
    // Uncomment these if you want to wipe the DB every time the server starts and seed is missing
    // await User.deleteMany({ role: { $ne: 'admin' } }); 
    
    const adminId = '65f1a2b3c4d5e6f7a8b9c0d1';
    const adminEmail = 'markboss726@gmail.com';
    
    const existingAdmin = await User.findOne({ 
      $or: [{ _id: adminId }, { email: adminEmail }] 
    });
    
    if (existingAdmin) {
      console.log('Seed: Admin already exists (ID or Email match), skipping seed.');
      return;
    }

    console.log('Seed: Starting data seeding for new database...');

    // 2. Create Admin
    const admin = new User({
      _id: new mongoose.Types.ObjectId(adminId),
      name: 'Mark Admin',
      email: adminEmail,
      phone: '0123456789',
      location: {
        address: 'Cairo, Egypt',
        lat: 30.0444,
        lng: 31.2357
      },
      password: 'adminpassword123',
      role: 'admin'
    });
    await admin.save();
    console.log('-----------------------------------');
    console.log('ADMIN CREATED SUCCESSFULLY');
    console.log(`ID: ${adminId}`);
    console.log(`Email: ${adminEmail}`);
    console.log('Password: adminpassword123');
    console.log('-----------------------------------');

    // 3. Create Sellers
    const sellers = [];
    const sellerNames = ['Tech World', 'Fashion Hub', 'Home Style'];
    for (const name of sellerNames) {
      const s = new User({
        name,
        email: `${name.toLowerCase().replace(' ', '')}@example.com`,
        phone: '0100000000',
        location: { address: 'Alexandria', lat: 31.2, lng: 29.9 },
        password: 'password123',
        role: 'seller'
      });
      sellers.push(await s.save());
    }

    // 4. Create Products
    const categories = ['Electronics', 'Fashion', 'Home', 'Beauty'];
    const products = [];
    for (let i = 0; i < 12; i++) {
      const p = new Product({
        name: `Premium Item ${i + 1}`,
        description: 'This is a high-quality mock product for testing the dashboard and listing pages.',
        price: Math.floor(Math.random() * 1000) + 100,
        category: categories[i % categories.length],
        images: [`https://picsum.photos/seed/shop${i}/600/600`],
        sellerId: sellers[i % sellers.length]._id,
        stock: Math.floor(Math.random() * 50) + 5,
        condition: 'new'
      });
      products.push(await p.save());
    }

    // 5. Create Orders
    const statuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    for (let i = 0; i < 8; i++) {
      const order = new Order({
        productId: products[i]._id,
        sellerId: sellers[i % sellers.length]._id,
        buyerId: admin._id, // Using admin as a buyer for mock orders
        buyerName: admin.name,
        buyerPhone: admin.phone,
        buyerAddress: admin.location.address,
        quantity: 1,
        price: products[i].price,
        deliveryFee: 50,
        status: statuses[i % statuses.length],
        paymentMethod: 'cash_on_delivery'
      });
      await order.save();
    }

    console.log('Seed: Mock data populated (Sellers, Products, Orders).');
  } catch (error) {
    console.error('Seed Error:', error);
  }
};
