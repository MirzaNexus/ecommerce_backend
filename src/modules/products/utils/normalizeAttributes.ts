export function mergeAttributes(oldAttr?: any, newAttr?: any): any {
  if (!newAttr) return oldAttr;

  return {
    ...oldAttr,
    ...newAttr,
    ...(newAttr.dimensions && {
      dimensions: {
        ...oldAttr?.dimensions,
        ...newAttr.dimensions,
      },
    }),
  };
}
