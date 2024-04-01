export const formatPostcode = (
  value: string,
  callback: (value: string) => void
) => {
  if (value.length > 8) {
    return;
  }
  const parts = value.match(/^([A-Z]{1,2}\d{1,2}[A-Z]?)\s*(\d[A-Z]{2})$/i);
  callback(value.replace(/\W*/gi, "").toUpperCase());

  if (parts) {
    parts.shift();
    callback(parts.join(" ").toUpperCase());
  }
};
