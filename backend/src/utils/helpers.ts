export const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
};

export const paginate = (query: any, page: number = 1, limit: number = 10) => {
  const skip = (page - 1) * limit;
  return { ...query, skip, limit };
};

export const sanitizeOutput = (doc: any): any => {
  if (doc && typeof doc.toObject === 'function') {
    const obj = doc.toObject();
    delete obj.__v;
    delete obj.password;
    return obj;
  }
  return doc;
};

export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
