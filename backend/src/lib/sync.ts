// backend/src/lib/sync.ts
// Minimal helper to synchronously wait on a promise (blocking the event loop).
// Used to preserve synchronous repository interfaces while backing onto DynamoDB.
export function waitForPromise<T>(promise: Promise<T>): T {
  const flag = new Int32Array(new SharedArrayBuffer(4));
  let result: T | undefined;
  let error: any;

  promise
    .then((value) => {
      result = value;
      Atomics.store(flag, 0, 1);
      Atomics.notify(flag, 0);
    })
    .catch((err) => {
      error = err;
      Atomics.store(flag, 0, 1);
      Atomics.notify(flag, 0);
    });

  if (Atomics.load(flag, 0) === 0) {
    Atomics.wait(flag, 0, 0);
  }

  if (error) throw error;
  return result as T;
}
