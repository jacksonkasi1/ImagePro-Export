/**
 * promisePool
 *
 * Runs up to `concurrency` async tasks at a time.
 * Collects all results in completion order.
 * All tasks are always awaited; errors are collected and rethrown
 * after every task finishes so in-flight work is never abandoned.
 *
 * @param tasks       Array of zero-argument async factory functions
 * @param concurrency Max simultaneous running tasks
 */
export async function promisePool<T>(
  tasks: Array<() => Promise<T>>,
  concurrency: number
): Promise<T[]> {
  const results: T[] = [];
  const errors: unknown[] = [];
  const executing = new Set<Promise<void>>();

  for (const task of tasks) {
    const p: Promise<void> = task()
      .then((result) => {
        results.push(result);
      })
      .catch((err) => {
        errors.push(err);
      })
      .finally(() => {
        executing.delete(p);
      });

    executing.add(p);

    if (executing.size >= concurrency) {
      // Wait for the fastest running task to free a slot
      await Promise.race(executing);
    }
  }

  // Drain any remaining tasks
  await Promise.all(executing);

  if (errors.length > 0) {
    throw errors[0];
  }

  return results;
}
