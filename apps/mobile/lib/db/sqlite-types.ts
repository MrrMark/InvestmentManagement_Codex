export type SqlValue = string | number | null;

export type MobileSqlRunResult = {
  changes: number;
};

export type MobileSqlDatabase = {
  execAsync(source: string): Promise<void>;
  getFirstAsync<T>(source: string, ...params: SqlValue[]): Promise<T | null>;
  getAllAsync<T>(source: string, ...params: SqlValue[]): Promise<T[]>;
  runAsync(source: string, ...params: SqlValue[]): Promise<MobileSqlRunResult>;
  withTransactionAsync(task: () => Promise<void>): Promise<void>;
};
