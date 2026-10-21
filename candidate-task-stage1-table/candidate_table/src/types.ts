import type { COLUMNS_NAMES, SORT_SYMBOLS } from "./components/Table/constants";

export interface IData {
  id: number;
  fullName: string;
  department: string;
  hireDate: string;
  status: string;
}

export interface ITableProps {
  data: IData[];
}

export interface ISortState {
  column: (typeof COLUMNS_NAMES)[keyof typeof COLUMNS_NAMES];
  type: keyof typeof SORT_SYMBOLS;
}