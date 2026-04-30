export interface AlgoliaPayload {
  eventName: string;
  userToken: string;
  index: string;
  objectIDs: string[];
  timestamp: number;
  queryID?: string;
}
