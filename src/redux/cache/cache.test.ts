import { Group } from '../../common/model';
import {
  CacheableGroup,
  GroupCache,
  AppCache,
  findCacheableGroup } from './cache';

const group1: Group = {
  id: 'craig',
  name: 'Team Craig',
  description: 'Craig\'s issues',
  photoURL: 'http://craig.com/img',
  subtitle: 'Nick for Prez!',
  totalCalls: 999
};
const group2: Group = {
  id: 'nick',
  name: 'Team Nick',
  description: 'Nick\'s issues',
  photoURL: 'http://nick.com/img',
  subtitle: 'I miss Swift!',
  totalCalls: 888
};

test('test cache creation', () => {
  const cgroup1: CacheableGroup = { group: { craig: group1 }, timestamp: 1234567 };
  const cgroup2: CacheableGroup = { group: { nick: group2 }, timestamp: 987654 };
  const cache = new AppCache([cgroup1, cgroup2]);

  expect(cache.groups.length).toBe(2);
  expect(cache.groups[0].group.craig).toBeDefined();
  expect(cache.groups[1].group.nick).toBeDefined();
});

test('findCachableGroup() should work', () => {
  const cgroup1: CacheableGroup = { group: { craig: group1 }, timestamp: 1234567 };
  const cgroup2: CacheableGroup = { group: { nick: group2 }, timestamp: 987654 };
  const cache = new AppCache([cgroup1, cgroup2]);

  const cgroup = findCacheableGroup('nick', cache);
  expect(cgroup.group.nick).toBeDefined();
  expect(cgroup.group.nick.name).toBe(group2.name);
  expect(cgroup.group.foobar).toBeUndefined();
});

test('findCachableGroup() should return undefined if it does not contain a group with the id param', () => {
  const cgroup1: CacheableGroup = { group: { craig: group1 }, timestamp: 1234567 };
  const cgroup2: CacheableGroup = { group: { nick: group2 }, timestamp: 987654 };
  const cache = new AppCache([cgroup1, cgroup2]);

  const cgroup = findCacheableGroup('foobar', cache);
  expect(cgroup).toBeUndefined();
});
