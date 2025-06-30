// --- Allowed URL Patterns ---

export interface UrlPattern {
  urlPattern: string;
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

// --- Issue Rules Container ---

export interface IssueRules {
  "unauthorized-data-access": UnauthorizedDataAccessRule;

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
