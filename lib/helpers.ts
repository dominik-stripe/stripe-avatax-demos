export function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export const sleepMs = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
