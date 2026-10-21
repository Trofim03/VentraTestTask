import "./Filter.css";

interface IFilterProps {
  handleSetFilter: (newFilter: string) => void;
}
// чтобы не было лишних вызовов без изменения данных
let lastValue = ""

export function Filter({ handleSetFilter }: IFilterProps) {
    // чтобы не вызывать и не придумывать дебаунс проще сделать поиск по привычному нажатьию на enter или при блюре (анфокусе)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      // Действие при Enter
      handleSetFilter(e.currentTarget.value);
      lastValue = e.currentTarget.value
    }
  };

  const handleOnBlur = (e:  React.FocusEvent<HTMLInputElement, Element>) => {
    if (lastValue !== e.target.value) {
        handleSetFilter(e.target.value)
        lastValue = e.target.value
    }
  };

  return (
    <div className="filterContainer">
      <label htmlFor="filterInput">Фильтрация по имени или отделу:</label>
      <input
        id="filterInput"
        className="filterInput"
        onBlur={handleOnBlur}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
}
