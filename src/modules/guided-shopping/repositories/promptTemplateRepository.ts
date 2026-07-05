import { Injectable } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { PromptTemplate } from '../entities/prompt-template.entity';
import { TemplateType } from '../enums/chatbot.enum';
import * as lodash from 'lodash';

@Injectable()
export class PromptTemplateRepository {
  constructor(private readonly manager: EntityManager) {}

  private repo(manager?: EntityManager): Repository<PromptTemplate> {
    return (manager ?? this.manager).getRepository(PromptTemplate);
  }

  /**
   * Fetches the currently active template for a specific purpose (e.g., SYSTEM_PROMPT).
   */
  async findActiveByType(
    type: TemplateType,
    manager?: EntityManager,
  ): Promise<PromptTemplate | null> {
    return await this.repo(manager).findOne({
      where: { type, isActive: true },
      order: { version: 'DESC' }, // Hamesha latest version uthayein
    });
  }

  /**
   * Creates or updates a template. Uses deep merge for configuration objects if present.
   */
  async upsertTemplate(
    data: Partial<PromptTemplate>,
    manager?: EntityManager,
  ): Promise<PromptTemplate> {
    const existing = await this.repo(manager).findOne({
      where: { type: data.type, version: data.version },
    });

    if (existing) {
      const merged = lodash.merge({}, existing, data);
      return await this.repo(manager).save(merged);
    }

    const newTemplate = this.repo(manager).create(data);
    return await this.repo(manager).save(newTemplate);
  }

  /**
   * Disables all templates of a specific type before activating a new one.
   */
  async deactivateAllByType(
    type: TemplateType,
    manager?: EntityManager,
  ): Promise<void> {
    await this.repo(manager).update({ type }, { isActive: false });
  }

  async getLatestVersionNumber(
    type: TemplateType,
    manager?: EntityManager,
  ): Promise<number> {
    const result = await this.repo(manager)
      .createQueryBuilder('template')
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
    const repository = this.repo(manager);

    await repository.findOne({
      where: { id },
      lock: { mode: 'pessimistic_write' },
    });

    await repository.update({ type }, { isActive: false });
    await repository.update({ id }, { isActive: true });
  }

  async findOne(
    options: any,
    manager?: EntityManager,
  ): Promise<PromptTemplate | null> {
    return await this.repo(manager).findOne(options);
  }

  async find(options: any, manager?: EntityManager): Promise<PromptTemplate[]> {
    return await this.repo(manager).find(options);
  }

  create(
    data: Partial<PromptTemplate>,
    manager?: EntityManager,
  ): PromptTemplate {
    return this.repo(manager).create(data);
  }

  async save(
    template: PromptTemplate,
    manager?: EntityManager,
  ): Promise<PromptTemplate> {
    return await this.repo(manager).save(template);
  }

  async remove(
    template: PromptTemplate,
    manager?: EntityManager,
  ): Promise<PromptTemplate> {
    return await this.repo(manager).remove(template);
  }
}
