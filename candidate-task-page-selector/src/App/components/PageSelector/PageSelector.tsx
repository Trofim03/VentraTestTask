import { max } from "moment";
import React, { useEffect, useState } from "react";
import Loader from "../../../UIKit/Loader/Loader";
import { SortData } from "../../shared/types";

/** Возможное количество отображаемых страниц слева и справа от текущей */
const PAGES_RANGE = 2;
/** Количество отображаемых элементов на одной странице */
// const PART_SIZE = 20;

// Хардкод выше не нужен, будем использовать варианты
const PAGE_SIZE_VARIANTS = [10, 20, 50]

/** Получение параметров селектора: минимальная и максимальная отображаемые страницы, флаг отображения многоточий слева и справа  */
function getPagesParams(currentPage: number, pagesCount: number) {
  let minPage = currentPage - PAGES_RANGE;
  let maxPage = currentPage + PAGES_RANGE;
  let isShowLeftEllispes = true;
  let isShowRightEllispes = true;

  const leftBorder = 2;
  const rightBorder = pagesCount - 1;

  if (pagesCount <= 2 * PAGES_RANGE + 5) {
    isShowLeftEllispes = false;
    isShowRightEllispes = false;
    minPage = leftBorder;
    maxPage = rightBorder;

    return { minPage, maxPage, isShowLeftEllispes, isShowRightEllispes };
  }

  if (minPage < leftBorder) minPage = leftBorder;
  if (maxPage > rightBorder) maxPage = rightBorder;

  const rightBorderNoEllipses = leftBorder + (2 * PAGES_RANGE + 1);
  if (
    minPage >= leftBorder &&
    maxPage <= rightBorder &&
    maxPage <= rightBorderNoEllipses
  ) {
    minPage = leftBorder;
    maxPage = rightBorderNoEllipses;
    isShowLeftEllispes = false;
  }

  const leftBorderNoEllipses = rightBorder - (2 * PAGES_RANGE + 1);
  if (
    minPage >= leftBorder &&
    maxPage <= rightBorder &&
    minPage >= leftBorderNoEllipses
  ) {
    minPage = leftBorderNoEllipses;
    maxPage = rightBorder;
    isShowRightEllispes = false;
  }

  if (minPage < leftBorder) minPage = leftBorder;
  if (maxPage > rightBorder) maxPage = rightBorder;

  return { minPage, maxPage, isShowLeftEllispes, isShowRightEllispes };
}

const ArrowIcon = (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M15 6L9 12L15 18"
      stroke="#303337"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
);

type PageSelectorProps = {
  /** Количество элементов */
  elementsCount: number;
  /** Обработчик очистки списка */
  clearItemsHandler: () => void;
  /** Обработчик добавления элементов в список */
  addItemsHandler: (page: number, size: number) => Promise<void>;
  /** Количество отфильтрованных элементов */
  filteredElementsCount: number | undefined;
  /** Триггер для сброса списка */
  resetTrigger: Date;
  /** Видна ли разметка */
  isVisible?: boolean;
};

/** Выбор страницы */
export default function PageSelector({
  elementsCount,
  clearItemsHandler,
  addItemsHandler,
  filteredElementsCount,
  resetTrigger,
  isVisible,
}: PageSelectorProps) {
  // Индекс текущей страницы
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  // Решение бага с быстрым переключением страниц - временная блокировка переключений, пока страница не загрузится
  // По хорошему - решение должно быть в App и через дебаунс, но т.к. мы взаимодействуем только с пагинацией - мы не влияем на подгрузку
  // Использовать дебаунс в пагинации - звучит нагружено для такого простого компонента
  // Проблема была в настакивании запросов без ожидания выполнения прошлых (ну или из-за отсутствия дебаунса, оба решения в целом подойдут)
  const [pageIsPending, setPageIsPending] = useState(false);

  // Перенесли выбор размера страницы в стейт из хардкода
  const [pageSize, setPageSize] = useState(PAGE_SIZE_VARIANTS[1])

  // Количество страниц
  const pagesCount = Math.ceil((filteredElementsCount ?? 0) / pageSize);
  // Номер текущей страницы
  const currentPageNumber = currentPageIndex + 1;

  const { minPage, maxPage, isShowLeftEllispes, isShowRightEllispes } =
    getPagesParams(currentPageNumber, pagesCount);

  async function handleAddItems(page: number, size: number) {
    // временный перерасчет максимума страниц
    const newPagesCount = Math.ceil((filteredElementsCount ?? 0) / size)

    setPageIsPending(true)

    handleClearItems();
    setIsShowMoreLoading(true);

    // Если после изменения размера кол-во страниц изменилось и текущая страница больше максимума - выбираем последнюю страницу, иначе все ок
    if (page >= newPagesCount) {
      setCurrentPageIndex(newPagesCount - 1)
      await addItemsHandler(newPagesCount - 1, size ?? pageSize);
    } else {
      await addItemsHandler(page, size ?? pageSize);
    }
    setIsShowMoreLoading(false);

    setPageIsPending(false)
  }

  async function handleClearItems() {
    clearItemsHandler();
  }

  // Сброс текущей страницы при изменении обработчика нажатия или количества страниц
  useEffect(() => {
    handleAddItems(0, pageSize);
    setCurrentPageIndex(0);
  }, [resetTrigger]);

  const [isShowMoreLoading, setIsShowMoreLoading] = useState<boolean>(false);

  // Нажатие на кнопку Показать больше
  const handleShowMoreClick = async () => {
    const nextPage = currentPageIndex + 1;
    if (nextPage >= pagesCount) return;

    setCurrentPageIndex(nextPage);

    // Добавить PART_SIZE элементов
    handleAddItems(nextPage, pageSize);
  };

  /** Получить список отображаемых страниц между максимальной и минимальной */
  const getDisplayablePages = () => {
    let pagesArr: number[] = [];
    for (let pageNumber = minPage; pageNumber <= maxPage; pageNumber++) {
      pagesArr.push(pageNumber);
    }

    return pagesArr;
  };

  // Обработка изменения размера страницы
  const handlePageSizeSelect = (newPageSize: number) => {
    setPageSize(newPageSize)

    handleAddItems(currentPageIndex, newPageSize)
  };

  /** Обработчик выбора страницы */
  const handlePageClick = (pageIndex: number) => {
    setCurrentPageIndex(pageIndex);

    // Показать PART_SIZE элементов
    handleAddItems(pageIndex, pageSize);
  };

  /** Обработчик уменьшения страницы */
  const handleLeftArrowClick = () => {
    const nextPageIndex = currentPageIndex - 1;
    if (nextPageIndex < 0) return;

    handlePageClick(nextPageIndex);
  };

  /** Обработчик увеличения страницы */
  const handleRightArrowClick = () => {
    const nextPageIndex = currentPageIndex + 1;
    if (nextPageIndex > pagesCount - 1) return;

    handlePageClick(nextPageIndex);
  };

  const ellipsesLayout = <div>...</div>;

  const displayedCount = Math.min(
    (currentPageIndex + 1) * pageSize,
    filteredElementsCount ?? 0
  );

  return (
    <div
      className="page-selector"
      style={{ display: isVisible ? "flex" : "none" }}
    >
      <div className="partSizeSelector">
        {PAGE_SIZE_VARIANTS.map((size, i) => (
          <button 
          className={`partSizeSelector__el ${pageSize === size ? 'active' : ''}`}
          onClick={() => {handlePageSizeSelect(size)}}
          key={`pageSizeVariants_${size}_${i}`}
          >
            {size}
          </button>
        ))}
      </div>
      <div className="page-selector__button-wrapper">
        <button
          className="page-selector__button-wrapper_button"
          onClick={handleShowMoreClick}
          disabled={isShowMoreLoading}
        >
          {isShowMoreLoading ? <Loader /> : "Показать больше"}
        </button>
        <div className="page-selector__button-wrapper_counter">
          {displayedCount} из {filteredElementsCount}
        </div>
      </div>
      <div className="page-selector__selector">
        <button
          className={`page-selector__selector_toStart ${
            pageIsPending || currentPageNumber === 1 ? "disabled" : ""
          }`}
          onClick={() => handlePageClick(0)}
          disabled={pageIsPending || currentPageNumber === 1}
        >
          В Начало
        </button>
        <button
          className={`page-selector__selector_left-arrow ${
            pageIsPending || currentPageNumber === 1 ? "disabled-arrow" : ""
          }`}
          onClick={handleLeftArrowClick}
          disabled={pageIsPending || currentPageNumber === 1}
        >
          {ArrowIcon}
        </button>

        <div className="page-selector__selector_pages">
          <button
            className={currentPageNumber == 1 ? "active-page" : ""}
            onClick={() => handlePageClick(0)}
            disabled={pageIsPending}
          >
            1
          </button>

          {isShowLeftEllispes ? ellipsesLayout : null}

          {getDisplayablePages().map((page, i) => {
            return (
              <button
                className={page == currentPageNumber ? "active-page" : ""}
                onClick={() => handlePageClick(page - 1)}
                disabled={pageIsPending}
                // Проблема с ошибкой в консоли - уникальные ключи при рендере
                key={`pagination-btn-${page}`}
              >
                {page}
              </button>
            );
          })}

          {isShowRightEllispes ? ellipsesLayout : null}

          {pagesCount > 1 ? (
            <button
              onClick={() => handlePageClick(pagesCount - 1)}
              className={pagesCount == currentPageNumber ? "active-page" : ""}
              disabled={pageIsPending}
            >
              {pagesCount}
            </button>
          ) : null}
        </div>

        <button
          className={`page-selector__selector_right-arrow ${
            pageIsPending || currentPageNumber === pagesCount ? "disabled-arrow" : ""
          }`}
          onClick={handleRightArrowClick}
          disabled={pageIsPending || currentPageNumber === pagesCount}
        >
          {ArrowIcon}
        </button>
        <button
          className={`page-selector__selector_toStart ${
            pageIsPending || currentPageNumber === pagesCount ? "disabled" : ""
          }`}
          onClick={() => handlePageClick(pagesCount - 1)}
          disabled={pageIsPending || currentPageNumber === pagesCount}
        >
          В конец
        </button>
      </div>
    </div>
  );
}
