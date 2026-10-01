import type { NextApiResponse } from 'next';

export async function revalidateBlogPage(res: NextApiResponse, id: number) {
  try {
    await res.revalidate(`/blog/${id}`);
    return true;
  } catch (e) {
    console.error(`Unable to revalidate blog page ${id}`, e);
    return false;
  }
}
