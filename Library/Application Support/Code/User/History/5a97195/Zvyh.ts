const DEFAULT_DELAY_TIME = 25;
const DEFAULT_MAX_ATTEMPTS = 5;

/**
 * Waits for a condition to be met by repeatedly calling a callback function until
 * it returns a truthy value or the maximum number of attempts is reached.
 * The delay between attempts increases exponentially.
 */
export async function waitFor<T>(callback: () => T): Promise<T> {
  let attempt = 1;
  let result = callback();

  while (!result && attempt <= DEFAULT_MAX_ATTEMPTS) {
    // eslint-disable-next-line no-await-in-loop
    await delay(DEFAULT_DELAY_TIME * 2 ** (attempt - 1));

    result = callback();
    attempt += 1;
  }

  return result;
}

function delay(time: number) {
  return new Promise((res) => {
    setTimeout(res, time);
  });
}
