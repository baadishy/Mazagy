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

    // 3. Create Sellers (Disabled to avoid mock items)
    /*
    const sellers = [];
    ...
    */

    console.log('Seed: Mock data seeding is currently disabled to allow for real products.');
  } catch (error) {
    console.error('Seed Error:', error);
  }
};
