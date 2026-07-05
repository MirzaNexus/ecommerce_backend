import { PartialType } from '@nestjs/mapped-types';
import { CreateGuidedShoppingDto } from './create-guided-shopping.dto';

export class UpdateGuidedShoppingDto extends PartialType(CreateGuidedShoppingDto) {}
