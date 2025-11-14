import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { FinancialEntityModule } from './financial-entity/financial-entity.module';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [PrismaModule, AuthModule, UsersModule, FinancialEntityModule, AiModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
