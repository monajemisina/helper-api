// --- Allowed URL Patterns ---

export interface UrlPattern {
  urlPattern?: string;
  namePattern?: string;
  vendorId?: string;
  entryMode?: string;
}

export interface UrlScope {
  presence: boolean;
  read: boolean;
  transfer: boolean;
}

export interface AllowedUrlSources {
  inherit: boolean;
  list: UrlPattern[];
  scope: UrlScope;
}

// --- Allowed Vendors ---

export interface AllowedVendor {
  vendorId: string;
  entryMode: 'allow' | 'deny';
}


export interface AllowedVendorScope {
  presence: boolean;
  read: boolean;
  transfer: boolean;
}

export interface AllowedVendors {
  inherit: boolean;
  list: AllowedVendor[];
  scope: AllowedVendorScope;
}

// --- Per Data Asset Configuration ---

export interface DataAssetItem {
  id: string;
  dataAssetType: string;
  allowedUrlSources: AllowedUrlSources;
  allowedVendors: AllowedVendors;
}

// --- Unauthorized Data Access Rule ---

export interface UnauthorizedDataAccessRule {
  enabled: boolean;
  list: DataAssetItem[];
}

// --- Unauthorized Scripts Rule ---

export interface UnauthorizedScriptsRule {
  enabled: boolean;
  inherit: boolean;
  list: UrlPattern[];
}
export interface UnauthorizedVendorsRule {
  enabled: boolean;
  inherit: boolean;
  list: UrlPattern[];
}

export interface UnauthorizedCookiesRule {
  enabled: boolean;
  list: UrlPattern[];
}

// --- Issue Rules Container ---
export interface IssueRules {
  "unauthorized-data-access": UnauthorizedDataAccessRule;
  "unauthorized-scripts": UnauthorizedScriptsRule;
  "unauthorized-cookies": UnauthorizedCookiesRule;
  "unauthorized-vendors": UnauthorizedVendorsRule
}

// --- Top-Level Policy Structure ---

export interface Policy {
  uuid: string;
  name: string;
  issueRules: IssueRules;
  allowedVendors?: AllowedVendor[];
  allowedUrlSources?: UrlPattern[];
  serviceUuid?: string;
  associatedProjectsCount: number;
  status?: string;
}


export interface UpdateAllowedUrlSourcesParams {
  ruleId: string;
  dataAssetType: string;
  allowedUrlSources: AllowedUrlSources;
}

export interface UpdateAllowedVendorsParams {
  ruleId: string;
  dataAssetType: string;
  allowedVendors: AllowedVendors;
}