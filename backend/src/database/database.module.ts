import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { getDatabaseConfig } from '../config/database.config';

@Global()
@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: () => getDatabaseConfig(),
    }),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}
