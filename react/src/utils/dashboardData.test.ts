import {
  getPopulation,
  getTopIssueData,
  getUsaMapKeyData,
  processRepsData
} from './dashboardData';
import { RepsSummaryData, RegionSummaryData, UsaSummaryData } from './api';
import { Feature } from 'geojson';
import { UserContactEventType } from '../common/models/contactEvent';

describe('processRepsData', () => {
  it('should return an empty array when given null', () => {
    const result = processRepsData(null, /* maxForBeeswarm= */ 50);
    expect(result).toEqual([]);
  });

  it('should process rep data correctly', () => {
    const repsSummaryData: RepsSummaryData = {
      reps: [
        {
          id: 'rep1',
          name: 'Test Rep 1',
          party: 'independent',
          phone: '123-456-7890',
          photoURL: 'http://example.com/rep1.jpg',
          area: 'US House',
          state: 'CA'
        }
      ],
      repsData: [
        {
          id: 'rep1',
          total: 10,
          outcomes: [
            { result: UserContactEventType.VOICEMAIL, count: 5 },
            { result: UserContactEventType.CONTACT, count: 3 },
            { result: UserContactEventType.UNAVAILABLE, count: 2 }
          ],
          topIssues: [],
          aggregatedResults: [
            { issue_id: 1, count: 2, time: 1000 },
            { issue_id: 2, count: 4, time: 1000 },
            { issue_id: 1, count: 1, time: 1001 },
            { issue_id: 2, count: 1, time: 1001 },
            { issue_id: 3, count: 2, time: 1002 }
          ]
        }
      ]
    };

    const result = processRepsData(repsSummaryData, /* maxForBeeswarm= */ 50);

    expect(result.length).toBe(1);
    const repData = result[0];
    expect(repData.id).toBe('rep1');
    expect(repData.total).toBe(10);
    expect(repData.percentVM).toBe(0.5);
    expect(repData.percentContact).toBe(0.3);
    expect(repData.percentUnavailable).toBe(0.2);

    // Check call results were expanded properly.
    expect(repData.callResults.length).toBe(10);
    expect(repData.callResults.filter((c) => c.issue_id == 1).length).toBe(3);
    expect(repData.callResults.filter((c) => c.issue_id == 2).length).toBe(5);
    expect(repData.callResults.filter((c) => c.issue_id == 3).length).toBe(2);
  });

  it('should not expand when too many calls', () => {
    const repsSummaryData: RepsSummaryData = {
      reps: [
        {
          id: 'rep1',
          name: 'Test Rep 1',
          party: 'independent',
          phone: '123-456-7890',
          photoURL: 'http://example.com/rep1.jpg',
          area: 'US House',
          state: 'CA'
        }
      ],
      repsData: [
        {
          id: 'rep1',
          total: 10,
          outcomes: [
            { result: UserContactEventType.VOICEMAIL, count: 5 },
            { result: UserContactEventType.CONTACT, count: 3 },
            { result: UserContactEventType.UNAVAILABLE, count: 2 }
          ],
          topIssues: [],
          aggregatedResults: [
            { issue_id: 1, count: 2, time: 1000 },
            { issue_id: 2, count: 4, time: 1000 },
            { issue_id: 1, count: 1, time: 1001 },
            { issue_id: 2, count: 1, time: 1001 },
            { issue_id: 3, count: 2, time: 1002 }
          ]
        }
      ]
    };

    const result = processRepsData(repsSummaryData, /* maxForBeeswarm= */ 5);

    expect(result.length).toBe(1);
    const repData = result[0];
    expect(repData.id).toBe('rep1');
    expect(repData.total).toBe(10);
    expect(repData.percentVM).toBe(0.5);
    expect(repData.percentContact).toBe(0.3);
    expect(repData.percentUnavailable).toBe(0.2);

    // Check call results were not expanded.
    expect(repData.callResults.length).toBe(5);
    expect(repData.callResults.filter((c) => c.issue_id == 1).length).toBe(2);
    expect(repData.callResults.filter((c) => c.issue_id == 2).length).toBe(2);
    expect(repData.callResults.filter((c) => c.issue_id == 3).length).toBe(1);
  });

  it('should handle a rep with no call data', () => {
    const repsSummaryData: RepsSummaryData = {
      reps: [
        {
          id: 'rep1',
          name: 'Test Rep 1',
          party: 'democrat',
          phone: '123-456-7890',
          photoURL: 'http://example.com/rep1.jpg',
          area: 'US House',
          state: 'CA'
        }
      ],
      repsData: []
    };

    const result = processRepsData(repsSummaryData, /* maxForBeeswarm= */ 50);

    expect(result.length).toBe(1);
    const repData = result[0];
    expect(repData.id).toBe('rep1');
    expect(repData.total).toBe(0);
    expect(repData.percentVM).toBe(0);
    expect(repData.percentContact).toBe(0);
    expect(repData.percentUnavailable).toBe(0);
  });

  it('should handle a rep with zero total calls', () => {
    const repsSummaryData: RepsSummaryData = {
      reps: [
        {
          id: 'rep1',
          name: 'Test Rep 1',
          party: 'democrat',
          phone: '123-456-7890',
          photoURL: 'http://example.com/rep1.jpg',
          area: 'US House',
          state: 'CA'
        }
      ],
      repsData: [
        {
          id: 'rep1',
          total: 0,
          outcomes: [],
          topIssues: [],
          aggregatedResults: []
        }
      ]
    };

    const result = processRepsData(repsSummaryData, /* maxForBeeswarm= */ 50);

    expect(result.length).toBe(1);
    const repData = result[0];
    expect(repData.id).toBe('rep1');
    expect(repData.total).toBe(0);
    expect(repData.percentVM).toBe(0);
    expect(repData.percentContact).toBe(0);
    expect(repData.percentUnavailable).toBe(0);
  });

  it('should handle a rep with only one type of outcome', () => {
    const repsSummaryData: RepsSummaryData = {
      reps: [
        {
          id: 'rep1',
          name: 'Test Rep 1',
          party: 'democrat',
          phone: '123-456-7890',
          photoURL: 'http://example.com/rep1.jpg',
          area: 'US House',
          state: 'CA'
        }
      ],
      repsData: [
        {
          id: 'rep1',
          total: 5,
          outcomes: [{ result: UserContactEventType.VOICEMAIL, count: 5 }],
          topIssues: [],
          aggregatedResults: []
        }
      ]
    };

    const result = processRepsData(repsSummaryData, /* maxForBeeswarm= */ 50);

    expect(result.length).toBe(1);
    const repData = result[0];
    expect(repData.id).toBe('rep1');
    expect(repData.total).toBe(5);
    expect(repData.percentVM).toBe(1);
    expect(repData.percentContact).toBe(0);
    expect(repData.percentUnavailable).toBe(0);
  });

  it('should handle empty input arrays', () => {
    const repsSummaryData: RepsSummaryData = {
      reps: [],
      repsData: []
    };

    const result = processRepsData(repsSummaryData, /* maxForBeeswarm= */ 50);

    expect(result).toEqual([]);
  });
});

describe('getUsaMapKeyData', () => {
  it('should return an empty array if there are no states results', () => {
    const result = getUsaMapKeyData([], []);
    expect(result).toEqual([]);
  });

  it('should correctly calculate the key data', () => {
    const statesResults: RegionSummaryData[] = [
      {
        id: 'CA',
        name: 'California',
        total: 100,
        issueCounts: [
          {
            issue_id: 1,
            name: 'Issue 1',
            count: 50,
            total_count: 60,
            slug: 'issue-1',
            archived: false
          }
        ]
      },
      {
        id: 'TX',
        name: 'Texas',
        total: 80,
        issueCounts: [
          {
            issue_id: 2,
            name: 'Issue 2',
            count: 40,
            total_count: 80,
            slug: 'issue-2',
            archived: false
          }
        ]
      },
      {
        id: 'NY',
        name: 'New York',
        total: 120,
        issueCounts: [
          {
            issue_id: 1,
            name: 'Issue 1',
            count: 60,
            total_count: 60,
            slug: 'issue-1',
            archived: false
          }
        ]
      }
    ];
    const data: Feature[] = [
      {
        type: 'Feature',
        id: 'CA',
        properties: { name: 'California' },
        geometry: { type: 'Polygon', coordinates: [[]] }
      },
      {
        type: 'Feature',
        id: 'TX',
        properties: { name: 'Texas' },
        geometry: { type: 'Polygon', coordinates: [[]] }
      },
      {
        type: 'Feature',
        id: 'NY',
        properties: { name: 'New York' },
        geometry: { type: 'Polygon', coordinates: [[]] }
      }
    ];

    const result = getUsaMapKeyData(statesResults, data);

    expect(result.length).toBe(2);
    expect(result[0].issue_id).toBe(1);
    expect(result[0].count).toBe(2);
    expect(result[1].issue_id).toBe(2);
    expect(result[1].count).toBe(1);
  });

  it('should handle a state with no top issues', () => {
    const statesResults: RegionSummaryData[] = [
      {
        id: 'CA',
        name: 'California',
        total: 100,
        issueCounts: [
          {
            issue_id: 1,
            name: 'Issue 1',
            count: 50,
            total_count: 51,
            slug: 'issue-1',
            archived: false
          }
        ]
      },
      { id: 'TX', name: 'Texas', total: 80, issueCounts: [] }
    ];
    const data: Feature[] = [
      {
        type: 'Feature',
        id: 'CA',
        properties: { name: 'California' },
        geometry: { type: 'Polygon', coordinates: [[]] }
      },
      {
        type: 'Feature',
        id: 'TX',
        properties: { name: 'Texas' },
        geometry: { type: 'Polygon', coordinates: [[]] }
      }
    ];

    const result = getUsaMapKeyData(statesResults, data);

    expect(result.length).toBe(1);
    expect(result[0].issue_id).toBe(1);
    expect(result[0].count).toBe(1);
  });
});

describe('getTopIssueData', () => {
  it('should return empty arrays and objects if there are no issue counts', () => {
    const usaData: UsaSummaryData = {
      usa: { id: 'usa', name: 'USA', total: 0, issueCounts: [] },
      states: []
    };
    const result = getTopIssueData(usaData);
    expect(result.topIssueIds).toEqual([]);
    expect(result.issueIdToName).toEqual({});
  });

  it('should correctly extract top issue data', () => {
    const usaData: UsaSummaryData = {
      usa: {
        id: 'usa',
        name: 'USA',
        total: 200,
        issueCounts: [
          {
            issue_id: 1,
            name: 'Issue 1',
            count: 100,
            total_count: 1000,
            slug: 'issue-1',
            archived: true
          },
          {
            issue_id: 2,
            name: 'Issue 2',
            count: 50,
            total_count: 55,
            slug: 'issue-2',
            archived: false
          },
          {
            issue_id: 3,
            name: 'Issue 3',
            count: 50,
            total_count: 50,
            slug: 'issue-3',
            archived: false
          }
        ]
      },
      states: []
    };

    const result = getTopIssueData(usaData);

    expect(result.topIssueIds).toEqual([1, 2, 3]);
    expect(result.issueIdToName).toEqual({
      1: 'Issue 1',
      2: 'Issue 2',
      3: 'Issue 3'
    });
  });
});

describe('getPopulation', () => {
  it('should get state population by ID', () => {
    expect(getPopulation('CA')).toEqual(39355309);

    // Ensure we've got all the other jurisdictions.
    expect(getPopulation('DC')).toBeGreaterThan(1);
    expect(getPopulation('PR')).toBeGreaterThan(1);
    expect(getPopulation('AS')).toBeGreaterThan(1);
    expect(getPopulation('GU')).toBeGreaterThan(1);
    expect(getPopulation('VI')).toBeGreaterThan(1);
  });

  it('should return 1 when ID is not matched', () => {
    // Ignore console.warn output.
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    expect(getPopulation('CAT')).toBe(1);
    warnSpy.mockRestore();
  });
});
