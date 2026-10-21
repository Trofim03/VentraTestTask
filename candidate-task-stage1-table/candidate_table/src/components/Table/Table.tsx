import { useMemo, useState } from "react";
import type { IData, ISortState, ITableProps } from "../../types";
import "./Table.css";
import { COLUMNS_NAMES, SORT_SYMBOLS, THEAD_CELLS } from "./constants";
import { Filter } from "../Filter";
import { delay } from "../../helpers";

function Table({ data }: ITableProps) {
  // Текущие настройки сортировки
  const [currentSort, setCurrentSort] = useState<ISortState>({
    column: COLUMNS_NAMES.fullName,
    type: "none",
  });

  // Текущая строка для фильтрации
  const [filterString, setFilterString] = useState("");

  // Текущие выбранные строки
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  // Флаг для эмуляции задержки
  const [isPending, setIsPending] = useState(false);

  const sortIsNone = currentSort.type === "none";

  const sortedFilteredData = useMemo(() => {
    const typedColumnId = currentSort.column as keyof typeof COLUMNS_NAMES;

    let newData = data;

    // Используем toSorted чтобы не изменить исходный массив и можно было сброситься к нему
    if (currentSort.type === "asc") {
      newData = data.toSorted((a, b) =>
        a[typedColumnId] > b[typedColumnId] ? 1 : -1,
      );
    } else if (currentSort.type === "desc") {
      newData = data.toSorted((a, b) =>
        a[typedColumnId] < b[typedColumnId] ? 1 : -1,
      );
    }

    if (filterString.length > 0) {
      newData = newData.filter((row) => {
        return (
          row.department.toLowerCase().includes(filterString.toLowerCase()) ||
          row.fullName.toLowerCase().includes(filterString.toLowerCase())
        );
      });
    }

    return newData;
  }, [data, currentSort, filterString]);

  // Обработчик кликов сортировки
  const handleColumnSort = (columnId: string) => {
    const typedColumnId = columnId as keyof typeof COLUMNS_NAMES;
    let type: keyof typeof SORT_SYMBOLS = "asc";

    if (currentSort.column === columnId && currentSort.type === "asc") {
      type = "desc";
    } else if (currentSort.column === columnId && currentSort.type === "desc") {
      type = "none";
    }

    setCurrentSort({
      column: COLUMNS_NAMES[typedColumnId],
      type: type,
    });
  };

  const handleSetFilter = async (newFilter: string) => {
    setIsPending(true);
    await delay(300 + Math.random() * 700);
    setFilterString(newFilter);

    setIsPending(false);
  };

  const handleChangeSelect = (rowId: number) => {
    if (selectedRows.includes(rowId)) {
      setSelectedRows((prev) => prev.filter((id) => id !== rowId));
    } else {
      setSelectedRows((prev) => [...prev, rowId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedRows.length === sortedFilteredData.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(sortedFilteredData.map((el) => el.id));
    }
  };

  const getBodyRow = (el: IData, index: number) => {
    return (
      <tr key={`tableBodyRow_${el.id}_${index}`}>
        <th>
          <input
            type="checkbox"
            onChange={() => handleChangeSelect(el.id)}
            checked={selectedRows.includes(el.id)}
          />
        </th>
        {Object.keys(COLUMNS_NAMES).map((key) => (
          <th
            key={`tableBodyRowCell_${index}_${key}`}
            className={
              currentSort.column === key && !sortIsNone ? "active" : ""
            }
          >
            {el[key as keyof typeof el]}
          </th>
        ))}
      </tr>
    );
  };

  const getHeadRow = (cell: (typeof THEAD_CELLS)[number]) => {
    return (
      <th
        scope="col"
        className={
          currentSort.column === cell.id && !sortIsNone ? "active" : ""
        }
        key={`theadCell_${cell.id}`}
        onClick={() => handleColumnSort(cell.id)}
      >
        {cell.name}{" "}
        {currentSort.column === cell.id ? SORT_SYMBOLS[currentSort.type] : ""}
      </th>
    );
  };

  const getContent = () => {
    if (isPending) return <>Загрузка</>;

    if (sortedFilteredData.length <= 0) return <>Данных нет</>;

    return (
      <table className="personsTable">
        <thead>
          <tr>
            <th scope="col">Выбор строки</th>
            {THEAD_CELLS.map((cell) => getHeadRow(cell))}
          </tr>
        </thead>
        <tbody>
          {sortedFilteredData.map((el, index) => getBodyRow(el, index))}
        </tbody>
        <tfoot>
          <tr>
            <th scope="row">Всего записей</th>
            <td>{sortedFilteredData.length}</td>
          </tr>
        </tfoot>
      </table>
    );
  };

  return (
    <>
      <Filter handleSetFilter={handleSetFilter} />
      <div className="selectContainer">
        <button onClick={() => handleSelectAll()}>Выбрать все</button>
        <span>Выбрано: {selectedRows.length}</span>
      </div>
      {getContent()}
    </>
  );
}

export { Table };
