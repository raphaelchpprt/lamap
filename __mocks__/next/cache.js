/**
 * Mock for Next.js cache functions
 */

const revalidatePath = jest.fn();
const revalidateTag = jest.fn();
const unstable_cache = jest.fn((fn) => fn);
const unstable_noStore = jest.fn();

module.exports = {
  revalidatePath,
  revalidateTag,
  unstable_cache,
  unstable_noStore,
};
