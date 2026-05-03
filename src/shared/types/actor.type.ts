export interface Actor {
  id: string;
  permissions: string[];
  meta: Record<string, unknown>;
}