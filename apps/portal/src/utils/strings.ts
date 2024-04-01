export const ucFirst = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const normaliseCapitalisation = (str: string) => {
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
