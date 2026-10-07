export const markProviderError = (error, kind = 'runtime') => {
  const marked = error instanceof Error ? error : new Error(String(error));
  marked.providerFailure = kind === 'runtime';
  marked.providerFailureKind = kind;
  return marked;
};

export const shouldFallbackToDatabase = (error) => error?.providerFailure === true;
