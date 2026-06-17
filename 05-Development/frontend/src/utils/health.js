export const detectAllergens = (healthNote) => {
  const note = (healthNote || "").toLowerCase();
  const allergens = [];
  if (note.includes("đậu phộng") || note.includes("peanut") || note.includes("lạc")) allergens.push("peanut");
  if (note.includes("hải sản") || note.includes("seafood") || note.includes("tôm")) allergens.push("seafood");
  return allergens;
};
