import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
} from '@nestjs/common';
import { FinancialEntityService } from './financial-entity.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

class CreateEntityDto {
  name: string;
  entityType: string;
}

@Controller('entities')
@UseGuards(JwtAuthGuard)
export class FinancialEntityController {
  constructor(private readonly financialEntityService: FinancialEntityService) {}

  @Post()
  create(@Request() req, @Body() createEntityDto: CreateEntityDto) {
    return this.financialEntityService.create(
      req.user.userId,
      createEntityDto.name,
      createEntityDto.entityType,
    );
  }

  @Get()
  findAll(@Request() req) {
    return this.financialEntityService.findAll(req.user.userId);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.financialEntityService.findOneData(id, req.user.userId);
  }

  @Put(':id')
  update(@Request() req, @Param('id') id: string, @Body() data: any) {
    return this.financialEntityService.update(id, req.user.userId, data);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Request() req, @Param('id') id: string) {
    await this.financialEntityService.remove(id, req.user.userId);
  }
}
