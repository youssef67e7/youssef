import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './database/schemas/user.schema';
import * as bcrypt from 'bcryptjs';

const users = [
  {
    name: 'Super Admin',
    email: 'admin@pharmaworld.com',
    phone: '+201000000000',
    password: 'Admin@123',
    role: 'SUPER_ADMIN',
    referralCode: 'ADMIN001',
  },
  {
    name: 'Pharmacy Manager',
    email: 'pharmacy@pharmaworld.com',
    phone: '+201000000001',
    password: 'Admin@123',
    role: 'ADMIN',
    referralCode: 'PHARM001',
  },
  {
    name: 'Pharmacy Employee',
    email: 'employee@pharmaworld.com',
    phone: '+201000000002',
    password: 'Admin@123',
    role: 'PHARMACIST',
    referralCode: 'EMP001',
  },
];

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const userModel = app.get<Model<UserDocument>>(getModelToken(User.name));

  console.log('===========================================');
  console.log('  PharmaWorld - Seeding All Users');
  console.log('===========================================');

  for (const userData of users) {
    const existing = await userModel.findOne({ email: userData.email });
    if (existing) {
      console.log(`  [SKIP] Already exists: ${userData.email}`);
      continue;
    }

    const hashedPassword = await bcrypt.hash(userData.password, 12);
    const user = new userModel({
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      password: hashedPassword,
      role: userData.role,
      isActive: true,
      isVerified: true,
      isEmailVerified: true,
      isPhoneVerified: true,
      referralCode: userData.referralCode,
    });

    await user.save();
    console.log(`  [OK] Created: ${userData.email} (${userData.role})`);
  }

  console.log('===========================================');
  console.log('  Login Credentials:');
  console.log('-------------------------------------------');
  console.log('  Super Admin (Platform Owner):');
  console.log('    Email:    admin@pharmaworld.com');
  console.log('    Password: Admin@123');
  console.log('    Panel:    /super-admin/');
  console.log('-------------------------------------------');
  console.log('  Admin (Pharmacy Manager):');
  console.log('    Email:    pharmacy@pharmaworld.com');
  console.log('    Password: Admin@123');
  console.log('    Panel:    /admin/');
  console.log('-------------------------------------------');
  console.log('  Employee (Staff):');
  console.log('    Email:    employee@pharmaworld.com');
  console.log('    Password: Admin@123');
  console.log('    Panel:    /dashboard/');
  console.log('===========================================');

  await app.close();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
