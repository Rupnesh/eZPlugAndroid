export interface ActiveTransactionForUser {
  transactionId?: any;
  userId?: any;
  stationId?: any;
  stationName?: any;
  connectorNumber: number;
  isInvoiceAvailable: boolean;
  isActive: boolean;
  errorCode: string;
  errorDescription: string;
  hasError: boolean;
  hasException: boolean;
  exception?: any;
  chargingStatus: any
}