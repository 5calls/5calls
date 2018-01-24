import { cacheTimeout } from './../../common/constants';
import { Group, CacheableGroup } from '../../common/model';
import {
  AppCache,
  findCacheableGroup,
  hasCacheTimeoutExceeded,
  hasGroupCacheTimeoutExceeded } from './cache';

const group1: Group = {
  id: 'craig',
  name: 'Team Craig',
  description: 'Craig\'s issues',
  photoURL: 'http://craig.com/img',
  subtitle: 'Nick for Prez!',
  totalCalls: 999,
  customCalls: false
};
const group2: Group = {
  id: 'nick',
  name: 'Team Nick',
  description: 'Nick\'s issues',
  photoURL: 'http://nick.com/img',
  subtitle: 'I miss Swift!',
  totalCalls: 888,
  customCalls: false
};

test('test cache creation', () => {
  const cgroup1: CacheableGroup = { group: group1 , timestamp: 1234567 };
  const cgroup2: CacheableGroup = { group: group2 , timestamp: 987654 };
  const cache = new AppCache([cgroup1, cgroup2]);

  expect(cache.groups.length).toBe(2);
  expect(cache.groups[0].group.id).toBe('craig');
  expect(cache.groups[1].group.id).toBe('nick');
});

test('findCachableGroup() should work', () => {
  const cgroup1: CacheableGroup = { group: group1 , timestamp: 1234567 };
  const cgroup2: CacheableGroup = { group: group2 , timestamp: 987654 };
  const cache = new AppCache([cgroup1, cgroup2]);

  const cgroup = findCacheableGroup('nick', cache);
  expect(cgroup).toBeDefined();
  if (cgroup) {
    expect(cgroup.group).toBeDefined();
    expect(cgroup.group.name).toBe(group2.name);
  }
});

test('findCachableGroup() should return undefined if it does not contain a group with the id param', () => {
  const cgroup1: CacheableGroup = { group: group1 , timestamp: 1234567 };
  const cgroup2: CacheableGroup = { group: group2 , timestamp: 987654 };
  const cache = new AppCache([cgroup1, cgroup2]);

  const cgroup = findCacheableGroup('foobar', cache);
  expect(cgroup).toBeUndefined();
});

test('hasTimeoutExceeded() returns false', () => {
  const now = 120;
  const timestamp = 50;
  const timeout = 100;

  expect(hasCacheTimeoutExceeded({ timestamp, now, timeout })).toBeFalsy();
});

test('hasTimeoutExceeded() returns true', () => {
  const now = 1000;
  const timestamp = 880;
  const timeout = 100;

  expect(hasCacheTimeoutExceeded({ timestamp, now, timeout })).toBeTruthy();
});

test('hasGroupTimeoutExceeded() returns true using only a timestamp argument', () => {
  const timestamp = new Date().getTime() - (1.4 * cacheTimeout.groups);

  expect(hasGroupCacheTimeoutExceeded({ timestamp })).toBeTruthy();
});
