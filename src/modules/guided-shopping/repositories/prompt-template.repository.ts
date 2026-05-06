import { Injectable } from '@nestjs/common';
import { DataSource, Repository, EntityManager } from 'typeorm';
import { PromptTemplate } from '../entities/prompt-template.entity';
import { TemplateType } from '../enums/chatbot.enum';

@Injectable()
export class PromptTemplateRepository extends Repository<PromptTemplate> {
  constructor(private dataSource: DataSource) {
    super(PromptTemplate, dataSource.createEntityManager());
  }

  async findActiveByType(type: TemplateType): Promise<PromptTemplate | null> {
    return this.findOne({
      where: { type, isActive: true },
    });
  }

  async getLatestVersionNumber(type: TemplateType): Promise<number> {
    const result = await this.createQueryBuilder('template')
      .select('MAX(template.version)', 'max')
      .where('template.type = :type', { type })
      .getRawOne();

    return result?.max ? parseInt(result.max) : 0;
  }

  async activateTemplate(
    id: string,
    type: TemplateType,
    manager?: EntityManager,
  ): Promise<void> {
    const repo = manager ? manager.getRepository(PromptTemplate) : this;

    await repo.update({ type }, { isActive: false });

    await repo.update({ id }, { isActive: true });
  }

  async findHistoryByType(type: TemplateType): Promise<PromptTemplate[]> {
    return this.find({
      where: { type },
      order: { version: 'DESC' },
    });
  }
}
