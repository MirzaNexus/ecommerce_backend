import { Injectable, Inject } from '@nestjs/common';
import * as algolia from 'algoliasearch';
import { ALGOLIA_CLIENT } from './algolia.provider';

@Injectable()
export class AlgoliaService {
  constructor(
    @Inject(ALGOLIA_CLIENT)
    private readonly client: algolia.SearchClient,
  ) {}

  async saveObject(indexName: string, data: any) {
    return await this.client.saveObject({
      indexName,
      body: data,
    });
  }

  async deleteObject(indexName: string, objectID: string) {
    return await this.client.deleteObject({
      indexName,
      objectID,
    });
  }
}
