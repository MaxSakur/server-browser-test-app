import React, { useRef, useState, useEffect } from 'react';
import { useVirtual } from 'react-virtual';
import styles from './App.module.css';
import useStats from './shared/hooks/useStats';

type Message = {
  message: string;
  progress: number;
};

const MAX_ESTIMATED_SIZE = 50;
const OVER_SCAN = 5;

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);

  const [autoScroll, setAutoScroll] = useState(true);
  const parentRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  const statsRefForFps = useStats(0);
  const statsRefForMs = useStats(1);
  const statsRefForMb = useStats(2);

  useEffect(() => {
    const websocket = new WebSocket('ws://localhost:8080');

    websocket.onmessage = (event) => {
      const newMessage: Message = JSON.parse(event.data);
      setMessages((prev) => [...prev, newMessage]);
      setProgress(newMessage.progress);
    };

    websocket.onclose = () => {
      console.log('Connection closed');
    };

    return () => {
      websocket.close();
    };
  }, []);

  const rowVirtualizer = useVirtual({
    size: messages.length,
    parentRef,
    estimateSize: React.useCallback(() => MAX_ESTIMATED_SIZE, []),
    overscan: OVER_SCAN,
    scrollToFn: autoScroll ? (index) => parentRef.current?.scrollTo({
      top: index * MAX_ESTIMATED_SIZE,
      behavior: 'smooth'
    }) : undefined
  });

  useEffect(() => {
    if (autoScroll && parentRef.current) {
      const scrollHeight = parentRef.current.scrollHeight;
      parentRef.current.scrollTo({
        top: scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, autoScroll]);


  return (

    <div className={styles.container}>
      <div className={styles.info}>
        <h1>Metrics</h1>

        <div className={styles.infoProgress}>
          <h2>Progress: {progress}%</h2>
          <h2>Messages recieved: {messages.length}</h2>
        </div>

        <div className={styles.infoStats}>
          <div ref={statsRefForFps} className={styles.stat} />
          <div ref={statsRefForMs} className={styles.stat} />
          <div ref={statsRefForMb} className={styles.stat} />
        </div>
      </div>

      <div className={styles.monitor}>
        <h1>Monitor</h1>
        <button onClick={() => setAutoScroll(!autoScroll)}>
          {autoScroll ? 'Disable autoscroll' : 'Activate autoscroll'}
        </button>

        <div ref={parentRef} className={styles.listContainer}>
          <div
            style={{
              height: `${rowVirtualizer.totalSize}px`,
              position: 'relative',
            }}
          >
            {rowVirtualizer.virtualItems.map((virtualRow) => {
              const message = messages[virtualRow.index];
              return (
                <div
                  key={virtualRow.index}
                  className={styles.message}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`
                  }}
                >
                  {message.message}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

export default App;