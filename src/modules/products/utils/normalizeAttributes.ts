export function deepMerge(oldObj: any = {}, newObj: any = {}): any {
  const result = { ...oldObj };

  for (const key of Object.keys(newObj)) {
    const newVal = newObj[key];
    const oldVal = oldObj[key];

    if (newVal && typeof newVal === 'object' && !Array.isArray(newVal)) {
      result[key] = deepMerge(oldVal || {}, newVal);
    } else if (newVal !== undefined) {
      result[key] = newVal;
    }
  }

  return result;
}
