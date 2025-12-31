import type { ID, InventoryFolder, InventoryItem } from './types';

export function buildFolderChildrenIndex(folders: InventoryFolder[]) {
  const childrenByParent = new Map<ID | null, InventoryFolder[]>();
  for (const f of folders) {
    const pid: ID | null = f.parentId ?? null;
    const arr = childrenByParent.get(pid) ?? [];
    arr.push(f);
    childrenByParent.set(pid, arr);
  }
  // Sort alphabetically for predictable UI
  for (const [k, arr] of childrenByParent.entries()) {
    arr.sort((a, b) => a.name.localeCompare(b.name));
    childrenByParent.set(k, arr);
  }
  return childrenByParent;
}

/**
 * Returns the path from root to the given folder, including the folder itself.
 */
export function buildFolderPath(folders: InventoryFolder[], folderId: ID): InventoryFolder[] {
  const byId = new Map<ID, InventoryFolder>();
  for (const f of folders) byId.set(f.id, f);

  const path: InventoryFolder[] = [];
  let cur = byId.get(folderId);
  const seen = new Set<ID>();

  while (cur && !seen.has(cur.id)) {
    path.push(cur);
    seen.add(cur.id);
    cur = cur.parentId ? byId.get(cur.parentId) : undefined;
  }

  return path.reverse();
}

export function filterItems(items: InventoryItem[], query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter((it) => {
    const hay = [it.name, it.sku ?? '', it.location ?? '', it.tags.join(' '), String(it.quantity)]
      .join(' ')
      .toLowerCase();
    return hay.includes(q);
  });
}
