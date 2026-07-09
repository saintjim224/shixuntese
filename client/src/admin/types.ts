import type { FormInstance } from 'antd';

export type AdminFormInstance = FormInstance<Record<string, unknown>>;
export type FilterValue = string | number | undefined | null;
export type FilterMap = Record<string, FilterValue>;
