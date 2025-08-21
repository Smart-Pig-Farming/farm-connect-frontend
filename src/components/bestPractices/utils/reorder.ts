export function reorder<T>(list: T[], from: number, to: number): T[] {
  if (from === to) return list;
  const arr = [...list];
  const [item] = arr.splice(from, 1);
  arr.splice(to, 0, item);
  return arr;
}
