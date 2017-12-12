import { Group } from '../../common/model';

/**
 * Group data to be cached, which includes a
 * timestamp to determine if the cache needs
 * to be refreshed.
 *
 */
export interface CacheableGroup {
  group: { [key: string]: Group }; // key is the group id
  timestamp: number;
}

export type GroupCache = CacheableGroup[];

/**
 * The cache for this application with fields
 * containing the data to be cached.
 *
 */
export class AppCache {
  groups: GroupCache;
  constructor(groupCache: GroupCache) {
      this.groups = groupCache;
  }
}

/**
 * Finds the Group and timestamp in the cache.
 *
 * @param {string} id the group's id
 * @param {AppCache} cache the cache stored in the redux store
 */
export function findCacheableGroup(id: string, cache: AppCache): CacheableGroup | undefined {
    return cache.groups
        .filter(g => g.group[id])
        .pop();
    }

// export function findGroup(id: string, cache: AppCache): Group | undefined {
//     return findCacheableGroup(id, cache).group[id];
// }

// export function findGroupTimestamp(id: string, cache: AppCache): number | undefined {
//     return findCacheableGroup(id, cache).timestamp;
// }
