const SORT_SYMBOLS = {
  asc: "▲",
  desc: "▼",
  none: "",
};

const COLUMNS_NAMES = {
  fullName: "fullName",
  department: "department",
  hireDate: "hireDate",
  status: "status",
};

const THEAD_CELLS = [
  {
    name: "Имя",
    id: "fullName",
  },
  {
    name: "Отдел",
    id: "department",
  },
  {
    name: "Дата найма",
    id: "hireDate",
  },
  {
    name: "Статус",
    id: "status",
  },
];

export {COLUMNS_NAMES, SORT_SYMBOLS, THEAD_CELLS}