export enum SessionStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  EXPIRED = 'EXPIRED',
  ABANDONED = 'ABANDONED',
}

export enum MessageRole {
  USER = 'USER',
  BOT = 'BOT',
  SYSTEM = 'SYSTEM',
}

export enum TemplateType {
  SYSTEM_PROMPT = 'SYSTEM_PROMPT',
  CLARIFICATION = 'CLARIFICATION',
  RECOMMENDATION_REASONING = 'RECOMMENDATION_REASONING',
}

export enum ChatActionType {
  CLARIFICATION = 'CLARIFICATION',
  RECOMMENDATION = 'RECOMMENDATION',
  GENERAL = 'GENERAL',
  ERROR = 'ERROR',
}

export enum DeviceType {
  MOBILE = 'MOBILE',
  DESKTOP = 'DESKTOP',
  TABLET = 'TABLET',
}

export class SessionMetadata {
  deviceType?: DeviceType;
  ipAddress?: string;
  userAgent?: string;
  isBot?: boolean;
  originUrl?: string;
  customFlags?: Record<string, any>;
}

export interface IAuditData {
  entityId: string;
  fields: Record<string, any>;
  version?: number;
  metadata?: Record<string, any>;
}

export interface ITokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface IShoppingDimensions {
  height: number;
  width: number;
  length: number;
}

export interface IShoppingFeatures {
  color?: string;
  size?: string;
  material?: string;
  weight?: string;
  dimensions?: IShoppingDimensions;
  brand?: string;
  style?: string;
  fit?: string;
  occasion?: string;
  attributes?: Record<string, string | number | boolean>;
}
