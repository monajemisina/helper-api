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
    // 2) A date or timestamp format like “2025-05-08-12-13-34”
    if (/^\d{4}-\d{2}-\d{2}(-\d{2}-\d{2}-\d{2})?$/.test(seg)) {
        return true;
    }
    return false;
};

/**
 * Simple classifier that marks a wildcard‐pattern as a “script” if it matches
 * common JS‐related paths (e.g. /assets/js/, /scripts/, /gtag/, /static/, /ajax/, /recaptcha/, etc.).
 * Anything else (e.g. /edge/ endpoints) will be treated as a page/API endpoint.
 */
const isScriptPattern = (pattern: string): boolean => {
    return /\/(?:assets\/js|scripts|gtag|static|recaptcha|ajax|cdnjs|vendors-[^/]*|\*_js)/.test(pattern);
};

export const getSegmentedPatterns = ({
    urls
}: UrlInput): { scriptPatterns: string[]; pagePatterns: string[] } => {
    // 1) prefixGroups:   domain|directory|prefix  → [ URLs whose filename starts “prefix-<hash>…” ]
    // 2) directoryGroups: domain|normalizedDirectory → [ all URLs “rolled up” under that normalized directory ]
    const prefixGroups = new Map<string, string[]>();
    const prefixMeta = new Map<string, KeyMeta>();
    const directoryGroups = new Map<string, string[]>();

    for (const rawUrl of urls) {
        let parsed: URL;
        try {
            parsed = new URL(rawUrl);
        } catch {
            continue; // skip invalid URLs
        }

        const domain = parsed.hostname;

        //
        // STEP A: Build a list of path segments, replacing any segment that "looks dynamic"
        //         with “<DYN>” so we can collapse the grouping onto its parent.
        //
        //    e.g. path = "/edge/v1/597f4104d311c33d4189/11.597f4104d311c33d4189.songbird.js"
        //    segments = ["edge","v1","597f4104d311c33d4189","11.597f4104d311c33d4189.songbird.js"]
        //
        const rawSegments = parsed.pathname.split("/").filter(Boolean);
        const normalizedSegments: string[] = rawSegments.map((seg) =>
            isDynamicSegment(seg) ? "<DYN>" : seg
        );

        //
        // STEP B: Figure out “directory” (everything up to—but not including—the last filename)
        //
        let directorySegments: string[];
        if (normalizedSegments.length === 0) {
            directorySegments = [];
        } else {
            const lastIndex = normalizedSegments.length - 1;
            if (normalizedSegments[lastIndex] === "<DYN>") {
                // If the “filename” itself got flagged as dynamic, roll up one more level:
                directorySegments = normalizedSegments.slice(0, lastIndex);
            } else {
                // Otherwise, drop just the filename
                directorySegments = normalizedSegments.slice(0, lastIndex);
            }
        }

        // Build a “normalized directory” string (e.g. "edge/v1" or "assets/js")
        const normalizedDirectory = directorySegments.join("/");
        const dirKey = [domain, normalizedDirectory].join("|");
        if (!directoryGroups.has(dirKey)) {
            directoryGroups.set(dirKey, []);
        }
        directoryGroups.get(dirKey)!.push(rawUrl);

        //
        // STEP C: Try to detect a “prefix‐hash” pattern ON THE REAL FILENAME (rawSegments[lastIndex]),
        //         so that we can emit “prefix-*” if multiple hashed‐files share the same (domain,normalizedDirectory,prefix).
        //
        let realFilename = "";
        if (rawSegments.length > 0) {
            realFilename = rawSegments[rawSegments.length - 1].split(/[?#]/)[0];
        }
        const hashMatch = realFilename.match(/^(.+?)-[A-Za-z0-9]+(?:\.\w+)?$/);
        if (hashMatch) {
            const prefix = hashMatch[1];
            const prefixKey = [domain, normalizedDirectory, prefix].join("|");
            if (!prefixGroups.has(prefixKey)) {
                prefixGroups.set(prefixKey, []);
                prefixMeta.set(prefixKey, {
                    domain,
                    directory: normalizedDirectory,
                    prefix
                });
            }
            prefixGroups.get(prefixKey)!.push(rawUrl);
        }
    }

    //
    // STEP D: Build the final wildcard patterns (un‐classified)
    //
    const allPatterns = new Set<string>();

    // D1) Emit all “prefix‐hash” patterns for groups of size ≥ 2
    for (const [prefixKey, urlList] of prefixGroups.entries()) {
        if (urlList.length < 2) continue;
        const { domain, directory, prefix } = prefixMeta.get(prefixKey)!;
        const dirSegment = directory ? `/${directory}` : "";
        allPatterns.add(`https://${domain}${dirSegment}/${prefix}-*`);
    }

    // D2) Emit “directory/*” patterns for any normalized directory that has ≥ 2 URLs,
    //     but only if that directory is not already 100% “covered” by a prefix rule.
    for (const [dirKey, urlList] of directoryGroups.entries()) {
        if (urlList.length < 2) continue;
        const [domain, normalizedDirectory] = dirKey.split("|");
        const dirSegment = normalizedDirectory ? `/${normalizedDirectory}` : "";

        // Check if _all_ URLs in this directory were already caught by a prefix‐group of size ≥ 2.
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

    //
    // STEP E: Classify each wildcard pattern as “script” or “page”
    //
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
