export const formatBlogDate = (date: Date | string): string => {
  if (typeof date === "string") date = new Date(date);
  const day = date.getDate();
  const month = date.toLocaleDateString("en-GB", {
    month: "long",
  });
  const year = date.getFullYear();

  let dayOrdinal;
  if (day >= 11 && day <= 13) {
    dayOrdinal = "th";
  } else if (day % 10 === 1) {
    dayOrdinal = "st";
  } else if (day % 10 === 2) {
    dayOrdinal = "nd";
  } else if (day % 10 === 3) {
    dayOrdinal = "rd";
  } else {
    dayOrdinal = "th";
  }

  const dayOfWeek = date.toLocaleDateString("en-GB", {
    weekday: "long",
  });

  return `${dayOfWeek}, ${day}${dayOrdinal} ${month} ${year}`;
};
