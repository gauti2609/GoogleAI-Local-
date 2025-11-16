import { IsNotEmpty, IsObject, IsString, IsNumber } from 'class-validator';
import { Masters } from '../../types';

export class SuggestMappingDto {
  @IsString()
  @IsNotEmpty()
  ledgerName: string;

  @IsNumber()
  @IsNotEmpty()
  closingBalance: number;

  @IsObject()
  @IsNotEmpty()
  masters: Masters;
}
