/**
 * promisePool
 *
 * Runs up to `concurrency` async tasks at a time.
 * Collects all results in order of task definition (not completion order).
 * All tasks are always awaited; the first error is rethrown after every task finishes.
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
