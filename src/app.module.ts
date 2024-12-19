import { Module } from '@nestjs/common';
import { PromotionModule } from './promotion/promotion.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PromotionModule, 
    PrismaModule,
    RedisModule,
  ],
})
export class AppModule {}
