export const normaliseCapitalisation = (str: string | null) => {
  if (!str) return str;
  // Convert the string to lowercase
  const lower = str.toLowerCase();

  // Capitalize the first letter of each word
  const words = lower.split(" ");
  const capitalized = words.map(
    (word) => word.charAt(0).toUpperCase() + word.slice(1),
  );

  // Join the words back together with spaces
  return capitalized.join(" ");
};
