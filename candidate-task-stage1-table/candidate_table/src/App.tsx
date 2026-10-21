import { useEffect, useState } from 'react'
import { Table } from './components/Table'
import type { IData } from './types';

function App() {

  const [data, setData] = useState<IData[]>([]);

  useEffect(() => {
    // Иммитация запроса с бэка
    fetch('../public/data.json')
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => console.error('Ошибка загрузки:', err));
  }, []);

  return (
    <Table data={data}/>
  )
}

export default App
