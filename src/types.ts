export interface ItemData {
  internal_id: string;
  warehouse_id: string;
  sku: string;
  size: string;
  notes: string;
  quantity: number;
  condition_id: string;
  inbounddate: string;
  outbounddate: string;
  status_id: string;
  addendum: string;
}

export interface ItemInfo {
  internal_id: string;
  warehouse_id: string;
  sku: string;
  size: string;
  notes: string;
  quantity: number;
  condition: string;
  inbounddate: string;
  outbounddate: string;
  status: string;
  addendum: string;
}

export interface SortFilter {
  column: string;
  direction: "ASC" | "DESC";
}

export interface PrefixFilter {
  column: string;
  prefix: string;
}

export interface NotNullFilter {
  column: string;
}
