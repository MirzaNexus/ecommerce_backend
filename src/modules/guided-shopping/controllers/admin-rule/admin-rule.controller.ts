// src/modules/guided-shopping/interface-adapters/controllers/admin-rule.controller.ts

import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { RuleManagementService } from '../../services/rule-management/rule-management.service';

@Controller('admin/rules')
export class AdminRuleController {
  constructor(private readonly ruleService: RuleManagementService) {}

  @Post()
  async create(@Body() dto: any, @Req() req: any) {
    // adminId user request (JWT) se ayega
    const adminId = req.user.id;
    return await this.ruleService.createRule(dto, adminId);
  }

  @Get()
  async findAll() {
    return await this.ruleService.getRulesForBot();
  }

  @Patch(':id/toggle')
  async toggle(@Param('id') id: string, @Req() req: any) {
    const adminId = req.user.id;
    return await this.ruleService.toggleRuleStatus(id, adminId);
  }
}
