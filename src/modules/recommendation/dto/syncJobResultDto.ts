import { Expose } from 'class-transformer';

export class SyncJobResultDto {
  @Expose()
  success!: boolean;

  @Expose()
  total_processed!: number;

  @Expose()
  timestamp!: Date;

  @Expose()
  index_name!: string;

  @Expose()
  execution_time_ms!: number;
}
