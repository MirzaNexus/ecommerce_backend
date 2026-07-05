import { Expose } from 'class-transformer';

export class TrackingResponseDto {
  @Expose()
  success!: boolean;

  @Expose()
  message!: string;

  @Expose()
  tracked_at!: Date;
}
