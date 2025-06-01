// src/utils/urlGrouper.ts

export type UrlInput = {
  urls: string[];
  totalCount: number;
};

interface KeyMeta {
  domain: string;
  directory: string;
  prefix?: string;   // only set if we detect a “hashed‐filename” under that directory
}

/**
 * Heuristic to decide if a path segment is “probably dynamic”—
 * e.g. a long hex‐string or a timestamp‐like folder.
 */
const isDynamicSegment = (seg: string): boolean => {
  // 1) All‐hex, length ≥ 8
  if (/^[0-9a-f]{8,}$/i.test(seg)) {
    return true;
  }
  // 2) A date or timestamp format like “YYYY-MM-DD” or “YYYY-MM-DD-HH-MM-SS”
  if (/^\d{4}-\d{2}-\d{2}(-\d{2}-\d{2}-\d{2})?$/.test(seg)) {
    return true;
  }
  return false;
};

/**
 * Simple classifier that marks a wildcard‐pattern as a “script” if it matches
 * common JS‐related paths (e.g. /assets/js/, /scripts/, /gtag/, /static/, /ajax/, /recaptcha/, etc.).
 * Anything else (e.g. /edge/ endpoints, page routes) will be treated as a page/API endpoint.
 */
const isScriptPattern = (pattern: string): boolean => {
  return /\/(?:assets\/js|scripts|gtag|static|recaptcha|ajax|cdnjs|vendors-[^/]*|\*_js)/.test(pattern);
};

/**
 * Given a bunch of URLs, emit two lists of wildcard patterns:
 *   • scriptPatterns: e.g. [ "https://cdn.example.com/static/*", ... ]
 *   • pagePatterns:  e.g. [ "https://app.example.com/users/*", ... ]
 *
 * 1) Build prefix‐hash groups: domain|directory|prefix → [ URLs whose filename starts “prefix-<hash>…” ]
 * 2) Build directoryGroups: domain|normalizedDirectory → [ all URLs “rolled up” under that normalized directory ]
 * 3) Emit wildcard rules for any prefix‐group or directory‐group of size ≥ 2
 * 4) Classify each rule via isScriptPattern(...)
 */
export const getSegmentedPatterns = ({
  urls
}: UrlInput): { scriptPatterns: string[]; pagePatterns: string[] } => {
  // STEP A: prefix‐based grouping (prefixGroups) + directory‐based grouping (directoryGroups)
  const prefixGroups = new Map<string, string[]>(); // key = `${domain}|${normalizedDirectory}|${prefix}`
  const prefixMeta = new Map<string, KeyMeta>();
  const directoryGroups = new Map<string, string[]>(); // key = `${domain}|${normalizedDirectory}`

  for (const rawUrl of urls) {
    let parsed: URL;
    try {
      parsed = new URL(rawUrl);
    } catch {
      // skip invalid URLs
      continue;
    }

    const domain = parsed.hostname;

    // ---- STEP B: Break pathname into segments, marking dynamic pieces as "<DYN>" ----
    const rawSegments = parsed.pathname.split("/").filter(Boolean);
    const normalizedSegments: string[] = rawSegments.map(seg =>
      isDynamicSegment(seg) ? "<DYN>" : seg
    );

    // now figure out whether the last segment is a “directory/page” or a true filename
    const lastIndex = normalizedSegments.length - 1;
    const rawFilename = rawSegments.length > 0 
      ? rawSegments[lastIndex].split(/[?#]/)[0]
      : "";

    // a) If the last segment is flagged <DYN>, roll up one level
    const lastIsDyn = normalizedSegments[lastIndex] === "<DYN>";

    // b) If there's a hash fragment in the URL, treat the last segment as a 'page‐dir'
    const hasHash = Boolean(parsed.hash); // anything after "#"
    // c) Check if rawFilename looks like it has a file extension (e.g. ".js", ".css", ".png", etc.)
    const hasFileExtension = /\.[a-zA-Z0-9]+$/.test(rawFilename);

    let directorySegments: string[];
    if (lastIsDyn) {
      // If filename itself was dynamic, drop it
      directorySegments = normalizedSegments.slice(0, lastIndex);
    } else if (hasHash) {
      // If there's a “#…” fragment, keep the last segment as part of the directory
      directorySegments = normalizedSegments;
    } else if (hasFileExtension) {
      // If it clearly looks like a "filename.ext", drop that segment
      directorySegments = normalizedSegments.slice(0, lastIndex);
    } else {
      // No extension + no hash + not <DYN> → assume it's a directory/page
      directorySegments = normalizedSegments;
    }

    // Build a “normalized directory” string 
    const normalizedDirectory = directorySegments.join("/"); // "" if no segments
    const dirKey = [domain, normalizedDirectory].join("|");

    if (!directoryGroups.has(dirKey)) {
      directoryGroups.set(dirKey, []);
    }
    directoryGroups.get(dirKey)!.push(rawUrl);

    // ---- STEP C: Look for “prefix‐hash” pattern on the REAL filename (rawSegments[lastIndex]) ----
    if (rawSegments.length > 0) {
      const realFilename = rawSegments[lastIndex].split(/[?#]/)[0];
      // match “prefix-<hash>” optionally followed by an extension:
      const hashMatch = realFilename.match(/^(.+?)-[A-Za-z0-9]+(?:\.\w+)?$/);
      if (hashMatch) {
        const prefix = hashMatch[1];
        const prefixKey = [domain, normalizedDirectory, prefix].join("|");
        if (!prefixGroups.has(prefixKey)) {
          prefixGroups.set(prefixKey, []);
          prefixMeta.set(prefixKey, { domain, directory: normalizedDirectory, prefix });
        }
        prefixGroups.get(prefixKey)!.push(rawUrl);
      }
    }
  }

  // ---- STEP D: Build the final wildcard patterns (un‐classified) ----
  const allPatterns = new Set<string>();

  // D1) Emit prefix‐hash rules for any prefixGroup of size ≥ 2:
  for (const [prefixKey, urlList] of prefixGroups.entries()) {
    if (urlList.length < 2) continue;
    const { domain, directory, prefix } = prefixMeta.get(prefixKey)!;
    const dirSegment = directory ? `/${directory}` : "";
    allPatterns.add(`https://${domain}${dirSegment}/${prefix}-*`);
  }

  // D2) Emit “directory/*” for any normalizedDirectory group of size ≥ 2, 
  //     unless that entire directory is already fully covered by prefix groups of size ≥ 2.
  for (const [dirKey, urlList] of directoryGroups.entries()) {
    if (urlList.length < 2) continue;
    const [domain, normalizedDirectory] = dirKey.split("|");
    const dirSegment = normalizedDirectory ? `/${normalizedDirectory}` : "";

    // Check if every URL in this directory was caught by some prefixGroup of size ≥ 2
    let allCoveredByPrefix = true;
    for (const rawUrl of urlList) {
      let matchedBySomePrefix = false;
      for (const [prefixKey, prefixUrls] of prefixGroups.entries()) {
        if (prefixUrls.length < 2) continue;
        if (prefixUrls.includes(rawUrl)) {
          matchedBySomePrefix = true;
          break;
        }
      }
      if (!matchedBySomePrefix) {
        allCoveredByPrefix = false;
        break;
      }
    }

    if (!allCoveredByPrefix) {
      allPatterns.add(`https://${domain}${dirSegment}/*`);
    }
  }

  // ---- STEP E: Classify each wildcard pattern “script vs. page” ----
  const scriptPatterns: string[] = [];
  const pagePatterns: string[] = [];

  for (const pattern of Array.from(allPatterns).sort()) {
    if (isScriptPattern(pattern)) {
      scriptPatterns.push(pattern);
    } else {
      pagePatterns.push(pattern);
    }
  }

  return { scriptPatterns, pagePatterns };
};
