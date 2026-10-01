import { BlogType } from './entity/type';

interface BlogInput {
  title: string;
  context: string;
  blogType: BlogType;
  tagIds: number[];
}

interface TagInput {
  name: string;
  color: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown, maxLength?: number): value is string {
  return typeof value === 'string'
    && value.trim().length > 0
    && (!maxLength || value.length <= maxLength);
}

export function isValidClaim(value: unknown) {
  return isNonEmptyString(value);
}

export function parseBlogInput(value: unknown): BlogInput | null {
  if (!isRecord(value)) return null;

  const {
    title, context, blogType, tagIds,
  } = value;
  const validBlogTypes = [
    BlogType.COMMON,
    BlogType.ESSAY,
    BlogType.NOTE,
    BlogType.SHOWER_THOUGHTS,
  ];

  if (!isNonEmptyString(title, 100)
    || !isNonEmptyString(context)
    || typeof blogType !== 'number'
    || !validBlogTypes.includes(blogType)
    || (tagIds !== undefined && (!Array.isArray(tagIds)
      || !tagIds.every((id) => Number.isSafeInteger(id) && id > 0)
      || new Set(tagIds).size !== tagIds.length))) {
    return null;
  }

  return {
    title: title.trim(),
    context,
    blogType,
    tagIds: tagIds || [],
  };
}

export function parseTagInput(value: unknown): TagInput | null {
  if (!isRecord(value)) return null;

  const { name, color } = value;
  if (!isNonEmptyString(name, 20)
    || typeof color !== 'string'
    || !/^#[0-9a-fA-F]{6}$/.test(color)) {
    return null;
  }

  return {
    name: name.trim(),
    color,
  };
}

export function parseEntityId(value: string | string[] | undefined) {
  if (typeof value !== 'string') return null;

  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}
