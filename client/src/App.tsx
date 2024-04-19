import { useEffect, useState } from 'react';
import styles from './App.module.css';
import useStats from './shared/hooks/useStats';

function App() {
  
  const [dataReceived, setDataReceived] = useState([]);
  const [progress, setProgress] = useState(0);

  const statsRefForFps = useStats(0);
  const statsRefForMs = useStats(1);
  const statsRefForMb = useStats(2);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8080'); 

    ws.onopen = () => {
      console.log('WebSocket connected');
      setDataReceived([]);
    };

    ws.onmessage = (event) => {
      console.log('WebSocket message:', event.data);
      // setDataReceived(prevData => [...prevData, event.data]); // Добавление новой строки к массиву данных
      // setProgress(prevProgress => prevProgress + 1); // Увеличение счетчика строк для отображения прогресса
    };

    ws.onclose = () => {
      console.log('WebSocket closed');
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.info}>
        <h1>Metrics</h1>

        <div className={styles.infoProgress}>
          <h2>Progress {progress} lines</h2> {/* Изменение отображения прогресса */}
          <div className={styles.progressList}>
            {/* Отображение полученных данных */}
            {dataReceived.map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>
        </div>

        <div className={styles.infoStats}>
          <div ref={statsRefForFps} className={styles.stat} />
          <div ref={statsRefForMs} className={styles.stat} />
          <div ref={statsRefForMb} className={styles.stat} />
        </div>
      </div>

      <div className={styles.monitor}>
        {/* Дополнительное пространство для мониторинга или других компонентов */}
      </div>
    </div>
  );
}

export default App;
