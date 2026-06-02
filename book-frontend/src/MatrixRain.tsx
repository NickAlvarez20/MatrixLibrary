import {
  memo,
  useMemo,
  useEffect,
  useRef,
  type CSSProperties,
} from "react";

const COLUMN_COUNT = 42;
const STREAM_LENGTH = 52;
const TICK_MS = 65;

type MatrixColumn = {
  id: number;
  left: string;
  delay: number;
  duration: number;
  charSize: number;
  text: string;
};

type StreamRefs = [HTMLSpanElement | null, HTMLSpanElement | null];

function randomGlyph(): string {
  return String.fromCharCode(0x30a1 + Math.floor(Math.random() * 86));
}

function nextGlyph(current: string): string {
  const code = current.charCodeAt(0);
  if (code >= 0x30a1 && code <= 0x30f6) {
    return String.fromCharCode(0x30a1 + ((code - 0x30a1 + 1) % 86));
  }
  return randomGlyph();
}

function createStream(length: number): string {
  return Array.from({ length }, randomGlyph).join("\n");
}

function createColumns(): MatrixColumn[] {
  return Array.from({ length: COLUMN_COUNT }, (_, id) => ({
    id,
    left: `${((id + 0.5) / COLUMN_COUNT) * 100}%`,
    delay: Math.random() * 18,
    duration: 5 + Math.random() * 12,
    charSize: 0.78 + Math.random() * 0.36,
    text: createStream(STREAM_LENGTH),
  }));
}

function syncStreams(refs: StreamRefs | undefined, chars: string[]) {
  if (!refs) return;
  const text = chars.join("\n");
  if (refs[0]) refs[0].textContent = text;
  if (refs[1]) refs[1].textContent = text;
}

function mutateColumn(chars: string[], tick: number, columnIndex: number) {
  // Leading glyph steps forward every tick — the bright head constantly cycles
  chars[0] = nextGlyph(chars[0]);

  // Near-head glyphs advance on staggered beats so the stream ripples downward
  for (let i = 1; i <= 6; i++) {
    if ((tick + columnIndex + i) % (3 + (i % 2)) === 0) {
      chars[i] = nextGlyph(chars[i]);
    }
  }

  // Tail flickers with random replacements
  const flickerCount = 1 + Math.floor(Math.random() * 3);
  for (let f = 0; f < flickerCount; f++) {
    const idx = 7 + Math.floor(Math.random() * (chars.length - 7));
    chars[idx] = randomGlyph();
  }
}

const MatrixRain = memo(function MatrixRain() {
  const columns = useMemo(() => createColumns(), []);
  const charsRef = useRef<string[][]>(
    columns.map((column) => column.text.split("\n"))
  );
  const streamRefs = useRef<StreamRefs[]>([]);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motionQuery.matches) return;

    let tick = 0;
    const intervalId = window.setInterval(() => {
      tick += 1;
      charsRef.current.forEach((chars, columnIndex) => {
        mutateColumn(chars, tick, columnIndex);
        syncStreams(streamRefs.current[columnIndex], chars);
      });
    }, TICK_MS);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <div className="matrix-rain" aria-hidden="true">
      {columns.map((column) => (
        <div
          key={column.id}
          className="matrix-column"
          style={
            {
              "--column-left": column.left,
              "--fall-delay": `${column.delay}s`,
              "--fall-duration": `${column.duration}s`,
              "--char-size": `${column.charSize}rem`,
            } as CSSProperties
          }
        >
          <div className="matrix-track">
            <span
              className="matrix-stream"
              ref={(element) => {
                if (!streamRefs.current[column.id]) {
                  streamRefs.current[column.id] = [null, null];
                }
                streamRefs.current[column.id][0] = element;
              }}
            >
              {column.text}
            </span>
            <span
              className="matrix-stream"
              ref={(element) => {
                if (!streamRefs.current[column.id]) {
                  streamRefs.current[column.id] = [null, null];
                }
                streamRefs.current[column.id][1] = element;
              }}
            >
              {column.text}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
});

export default MatrixRain;
