/** Upserts an object into an array by string key. */
export function upsertByKey(
  items: Record<string, unknown>[],
  key: string,
  incoming: Record<string, unknown>
): Record<string, unknown>[] {
  const incomingKey = incoming[key];
  if (typeof incomingKey !== "string" || incomingKey.length === 0) {
    return items;
  }

  const index = items.findIndex((item) => item[key] === incomingKey);
  if (index === -1) {
    return [...items, incoming];
  }

  return items.map((item, itemIndex) => (itemIndex === index ? { ...item, ...incoming } : item));
}
