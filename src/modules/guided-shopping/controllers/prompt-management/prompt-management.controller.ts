import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { PromptManagementService } from '../../services/prompt-management/prompt-management.service';
import {
  CreatePromptTemplateDto,
  UpdatePromptTemplateDto,
} from '../../dto/prompt-template.dto';
import { TemplateType } from '../../enums/chatbot.enum';
import { RolesGuard } from 'src/modules/auth/guards/role.guard';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guards';
import { UserRole } from 'src/modules/user/entities/user.entity';

@Controller('admin/prompts')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class PromptManagementController {
  constructor(private readonly promptService: PromptManagementService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreatePromptTemplateDto) {
    return await this.promptService.createTemplate(dto);
  }

  @Get()
  async findAll(@Query('type') type?: TemplateType) {
    return await this.promptService.getAllTemplates(type);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdatePromptTemplateDto) {
    return await this.promptService.updateTemplate(id, dto);
  }

  @Patch(':id/activate')
  async activate(@Param('id') id: string) {
    await this.promptService.activateTemplate(id);
    return { message: 'Template activated successfully' };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    return await this.promptService.deleteTemplate(id);
  }
}
