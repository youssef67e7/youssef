import { MongooseModuleOptions } from '@nestjs/mongoose';

export const getDatabaseConfig = (): MongooseModuleOptions => ({
  uri: process.env.MONGODB_URI || 'mongodb+srv://Vercel-Admin-clinicDB:jVB1Dk0hkKGmB9Wj@clinicdb.0qyfdxo.mongodb.net/clinicDB?appName=Cluster0&retryWrites=true&w=majority',
  autoIndex: process.env.NODE_ENV !== 'production',
});
