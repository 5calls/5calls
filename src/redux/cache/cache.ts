import { CacheTimeoutData } from './cache';
import { Group, CacheableGroup } from '../../common/model';
import { cacheTimeout } from './../../common/constants';

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
    return cache.groups ? cache.groups
        .filter(g => g.group.id === id)
        .pop() : undefined;
    }

/**
 * Factory for `CacheableGroup` objects.
 *
 * @export
 * @param {Group} group - group to be cached
 * @returns {CacheableGroup | undefined}
 */
export function cacheableGroupFactory(group: Group): CacheableGroup | undefined {
    const now = new Date().getTime();
    if (group) {
      return { group, timestamp: now };
    } else {
      return undefined;
    }
}

export function addOrReplaceCacheableGroup(groups: CacheableGroup[], group: Group): CacheableGroup[] {
    // remove old group if present
    const newGroups = groups.filter(cgroup => {
        return cgroup.group.id !== group.id;
    });
    const newcgroup = cacheableGroupFactory(group);
    if (newGroups && newcgroup) {
        return [...newGroups, newcgroup];
    } else {
        return groups;
    }
}

/**
 * Holds data to determine if cached data has timed out.
 * The `timestamp` field is the only required field
 * as it is the timestamp that is used to determine if
 * a timeout has exceeded.
 * The `now` field represents the current timestamp, which
 * by default should be the value of new Date().getTime()
 * The `timeout` field is the timeout value (in milliseconds),
 * which should be a constant set in `constants.ts`. Both the
 * now and timeout arguments should only be used for testing.
 *
 * This interface was created to make sure hasTimeoutExceeded()
 * arguments did not get mixed up since all of them are of
 * number type.
 */
export interface CacheTimeoutData {
    timestamp: number;
    now?: number; // current timestamp
    timeout?: number; // timeout value in milliseconds
}

/**
 * Determines if a cache timeout has exceeded.
 *
 * By default, the timeout value comes from
 * `cacheTimeout.default` in `constants.ts`
 *
 * @param {CacheTimeoutData} timeoutData
 * @returns { boolean } - true if timeout has exceeded;
 * otherwise false.
 */
export function hasCacheTimeoutExceeded(timeoutData: CacheTimeoutData): boolean {
    const now = timeoutData.now || new Date().getTime();
    const timeout = timeoutData.timeout || cacheTimeout.default;
    return now - timeoutData.timestamp > timeout;
}

/**
 * Determines if a cache timeout has exceeded for group/team
 * data.
 *
 * By default, the timeout value comes from
 * `cacheTimeout.groups` in `constants.ts`
 *
 * @param {CacheTimeoutData} timeoutData
 * @returns { boolean } - true if timeout has exceeded;
 * otherwise false.
 */
export function hasGroupCacheTimeoutExceeded(timeoutData: CacheTimeoutData): boolean {
    const timestamp = timeoutData.timestamp;
    const timeout = cacheTimeout.groups;
    return hasCacheTimeoutExceeded({timestamp, timeout});
}