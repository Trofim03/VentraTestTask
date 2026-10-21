import React, { useCallback, useState } from "react";
import PageSelector from "./components/PageSelector/PageSelector";

/** Демо-стенд: не является частью задания, ничего в этом файле менять не нужно */

const TOTAL_ITEMS = 137;
const PART_SIZE = 20;

type MockItem = {
  id: string;
  page: number;
  index: number;
};

function generatePageItems(page: number, size: number): MockItem[] {
  const start = page * size;
  const end = Math.min(start + size, TOTAL_ITEMS);
  const items: MockItem[] = [];
  for (let i = start; i < end; i++) {
    items.push({ id: `item-${i}`, page, index: i });
  }
  return items;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function App() {
  const [items, setItems] = useState<MockItem[]>([]);
  const [resetTrigger] = useState<Date>(new Date());

  const clearItemsHandler = useCallback(() => {
    setItems([]);
  }, []);

  // Имитация запроса к бэкенду за страницей данных (с сетевой задержкой)
  const addItemsHandler = useCallback(async (page: number, size: number) => {
    await delay(300 + Math.random() * 700);
    const newItems = generatePageItems(page, size);
    setItems((prev) => [...prev, ...newItems]);
  }, []);

  return (
    <div style={{ maxWidth: 700, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h2>Стенд для проверки PageSelector</h2>
      <p style={{ color: "#717680" }}>
        Ниже показаны загруженные элементы с меткой страницы, с которой они
        пришли — так удобно заметить, если после клика отображаются данные не
        той страницы.
      </p>

      <div
        style={{
          border: "1px solid #e9eaeb",
          borderRadius: 8,
          padding: 16,
          marginBottom: 20,
          // minHeight: 80,
          minHeight: 500,
        }}
      >
        {items.length === 0 && <i>Нет загруженных элементов</i>}
        {items.map((item) => (
          <div key={item.id}>
            Элемент #{item.index} <b>(страница {item.page + 1})</b>
          </div>
        ))}
      </div>

      <PageSelector
        elementsCount={TOTAL_ITEMS}
        filteredElementsCount={TOTAL_ITEMS}
        clearItemsHandler={clearItemsHandler}
        addItemsHandler={addItemsHandler}
        resetTrigger={resetTrigger}
        isVisible={true}
      />
    </div>
  );
}
