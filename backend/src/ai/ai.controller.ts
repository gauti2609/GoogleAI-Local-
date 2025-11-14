import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { SuggestMappingDto } from './dto/suggest-mapping.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @UseGuards(JwtAuthGuard)
  @Post('suggest-mapping')
  async suggestMapping(@Body() suggestMappingDto: SuggestMappingDto) {
    const { ledgerName, masters } = suggestMappingDto;
    return this.aiService.getMappingSuggestion(ledgerName, masters);
  }
}
