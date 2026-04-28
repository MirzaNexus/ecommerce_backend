import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
} from 'class-validator';

export class SubscribeNewsletterDto {
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsOptional()
  fcmToken?: string;
}

export class UpdateSubscriptionStatusDto {
  @IsBoolean()
  @IsNotEmpty()
  isSubscribed!: boolean;
}

export class BroadcastNewsDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  body!: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}
