import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './database/schemas/user.schema';
import * as bcrypt from 'bcryptjs';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const userModel = app.get<Model<UserDocument>>(getModelToken(User.name));

  const adminEmail = 'admin@pharmaworld.com';
  const existing = await userModel.findOne({ email: adminEmail });

  if (existing) {
    console.log(`Admin already exists: ${adminEmail}`);
    await app.close();
    return;
  }

  const hashedPassword = await bcrypt.hash('Admin@123', 12);

  const admin = new userModel({
    name: 'Super Admin',
    email: adminEmail,
    phone: '+201000000000',
    password: hashedPassword,
    role: 'SUPER_ADMIN',
    isActive: true,
    isVerified: true,
    isEmailVerified: true,
    isPhoneVerified: true,
    referralCode: 'ADMIN001',
  });

  await admin.save();
  console.log('===========================================');
  console.log('  Admin user created successfully!');
  console.log('===========================================');
  console.log(`  Email:    ${adminEmail}`);
  console.log(`  Password: Admin@123`);
  console.log(`  Role:     SUPER_ADMIN`);
  console.log('===========================================');

  await app.close();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
