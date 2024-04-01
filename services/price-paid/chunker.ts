export const chunk = (
  size: number,
  handler: ({
    limit,
    cursor,
    setCursor,
  }: {
    limit: number;
    cursor: string;
    setCursor: (cursor: string) => void;
    setActive: (active: boolean) => void;
  }) => Promise<void>,
) => {
  let active = true;
  const limit = size;
  let cursor = "";
  const setCursor = (c: string) => {
    cursor = c;
  };
  const setActive = (a: boolean) => {
    active = a;
  };

  const process = async () => {
    await handler({ limit, setCursor, cursor, setActive });

    // need to account for the last chunk
    if (active) {
      await process();
    }
  };
  return process();
};

export const simpleChunk = async <T = unknown>(
  data: T[],
  size: number,
  handler: (chunk: T[]) => Promise<void>,
) => {
  let cursor = 0;
  const limit = size;

  const process = async () => {
    const chunk = data.slice(cursor, cursor + limit);
    await handler(chunk);

    cursor += limit;

    if (cursor < data.length) {
      await process();
    }
  };
  return process();
};
