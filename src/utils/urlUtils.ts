export const extractFerootUuids = (url: string): { projectUuid: string; dataSourceUuid: string } => {
  if (!url?.trim()) {
    throw new Error("URL parameter is required");
  }

  try {
    const parsedUrl = new URL(url);
    const path = parsedUrl.hash || "";
    const regex = /#\/projects\/([a-f0-9-]+)\/data-sources\/crawl\/([a-f0-9-]+)/i;
    const match = path.match(regex);

    if (!match) {
      throw new Error("URL does not contain valid projectUuid and dataSourceUuid");
    }

    const [, projectUuid, dataSourceUuid] = match;
    return { projectUuid, dataSourceUuid };
  } catch (error) {
    throw new Error("Invalid URL format");
  }
};


