export type LiveQueryItem = {
  key: string;
  data: any;
};

const liveQueryResponses: Record<string, Record<string, LiveQueryItem[]>> = {};

export const setLiveQueryData = (
  path: string,
  queryString: string,
  responseItems: LiveQueryItem[],
) => {
  liveQueryResponses[path] = liveQueryResponses[path] ?? {};
  return (liveQueryResponses[path][queryString] = responseItems);
};

export const getLiveQueryData = (path: string, queryString: string) =>
  (liveQueryResponses[path] ?? {})[queryString] ?? [];
