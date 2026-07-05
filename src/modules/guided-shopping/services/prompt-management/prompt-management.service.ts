// src/modules/guided-shopping/application/services/prompt-management.service.ts

import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';

import { PromptTemplateRepository } from '../../repositories/promptTemplateRepository';
import {
  CreatePromptTemplateDto,
  UpdatePromptTemplateDto,
} from '../../dto/prompt-template.dto';
import { PromptTemplateResponseDto } from '../../dto/response/guided-shoping-response.dto';
import { TemplateType } from '../../enums/chatbot.enum';
import { DataSource } from 'typeorm';
import { PromptTemplate } from '../../entities/prompt-template.entity';

@Injectable()
export class PromptManagementService {
  private readonly logger = new Logger(PromptManagementService.name);

  constructor(
    private readonly promptRepo: PromptTemplateRepository,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Create a new version of a prompt
   */
  async createTemplate(
    dto: CreatePromptTemplateDto,
  ): Promise<PromptTemplateResponseDto> {
    return await this.dataSource.transaction(async (manager) => {
      const latestVersion = await this.promptRepo.getLatestVersionNumber(
        dto.type,
        manager,
      );

      const newTemplate = this.promptRepo.create({
        ...dto,
        version: (latestVersion || 0) + 1,
        isActive: false,
      });

      const saved = await this.promptRepo.save(newTemplate);
      return this.mapToResponse(saved);
    });
  }

  /**
   * Activate a template using DataSource Transaction
   */
  async activateTemplate(id: string): Promise<void> {
    const template = await this.promptRepo.findOne({ where: { id } });
    if (!template) throw new NotFoundException('Template not found');

    try {
      // Use dataSource.transaction for automatic commit/rollback
      await this.dataSource.transaction(async (transactionalEntityManager) => {
        // 1. Atomic DB Update through the manager
        await this.promptRepo.activateTemplate(
          id,
          template.type,
          transactionalEntityManager,
        );
      });

      this.logger.log(`Template ${id} of type ${template.type} activated.`);
    } catch (err) {
      this.logger.error(
        `Activation failed for template ${id}`,
        (err as any).stack,
      );
      throw new InternalServerErrorException('Failed to activate template');
    }
  }

  /**
   * Fetch active prompt (Now directly from DB since Redis is removed)
   */
  async getActivePrompt(type: TemplateType): Promise<PromptTemplate> {
    const template = await this.promptRepo.findActiveByType(type);

    if (!template) {
      this.logger.warn(`No active template found for ${type}. Using fallback.`);

      return {
        id: 'default-fallback',
        type: type,
        content:
          'Default Store Instructions: You are a professional shopping assistant.',
        version: 0,
        isActive: true,
      } as PromptTemplate;
    }

    return template;
  }

  /**
   * Update an existing template
   */
  async updateTemplate(
    id: string,
    dto: UpdatePromptTemplateDto,
  ): Promise<PromptTemplateResponseDto> {
    const template = await this.promptRepo.findOne({ where: { id } });
    if (!template) throw new NotFoundException('Template not found');

    Object.assign(template, dto);
    const updated = await this.promptRepo.save(template);

    return this.mapToResponse(updated);
  }

  /**
   * Delete template (Ensuring active ones are protected)
   */
  async deleteTemplate(id: string): Promise<void> {
    const template = await this.promptRepo.findOne({ where: { id } });
    if (!template) throw new NotFoundException('Template not found');

    if (template.isActive) {
      throw new InternalServerErrorException(
        'Cannot delete an active prompt. Please activate another version first.',
      );
    }

    await this.promptRepo.remove(template);
  }

  /**
   * Get all templates for Admin view
   */
  async getAllTemplates(
    type?: TemplateType,
  ): Promise<PromptTemplateResponseDto[]> {
    const templates = await this.promptRepo.find({
      where: type ? { type } : {},
      order: { version: 'DESC' },
    });
    return templates.map((t) => this.mapToResponse(t));
  }

  private mapToResponse(template: any): PromptTemplateResponseDto {
    return {
      id: template.id,
      type: template.type,
      content: template.content,
      version: template.version,
      isActive: template.isActive,
      updatedAt: template.updatedAt,
    };
  }
}
