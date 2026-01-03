import type { folderType } from '@/types/folder';

export function buildFolderChildrenIndex(
  folderList: folderType[],
): Map<string | null | undefined, folderType[]> {
  const childrenByParent = new Map<string | null | undefined, folderType[]>();

  for (const f of folderList) {
    const pid: string | null | undefined = f.parentFolderId ?? null;
    const arr = childrenByParent.get(pid) ?? [];
    arr.push(f);
    childrenByParent.set(pid, arr);
  }

  // Sort alphabetically
  for (const [k, arr] of childrenByParent.entries()) {
    arr.sort((a, b) => a.name.localeCompare(b.name));
    childrenByParent.set(k, arr);
  }

  return childrenByParent;
}

export function getFolderId(folder: folderType): string {
  return folder.id || folder.name;
}

export function getRootFolders(
  childrenByParent: Map<string | null | undefined, folderType[]>,
): folderType[] {
  return childrenByParent.get(null) ?? childrenByParent.get(undefined) ?? [];
}
