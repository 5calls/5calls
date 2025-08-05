import {
  getTopIssueData,
  getUsaMapKeyData,
  processRepsData
} from './dashboardData';
import { RepsSummaryData, RegionSummaryData, UsaSummaryData } from './api';
import { Feature } from 'geojson';

describe('processRepsData', () => {
  it('should return an empty array when given null', () => {
    const result = processRepsData(null);
    expect(result).toEqual([]);
  });

  it('should process rep data correctly', () => {
    const repsSummaryData: RepsSummaryData = {
      reps: [
        {
          id: 'rep1',
          name: 'Test Rep 1',
          party: 'I',
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
            { result: 'voicemail', count: 5 },
            { result: 'contact', count: 3 },
            { result: 'unavailable', count: 2 }
          ],
          topIssues: [],
          aggregatedResults: []
        }
      ]
    };

    const result = processRepsData(repsSummaryData);

    expect(result.length).toBe(1);
    const repData = result[0];
    expect(repData.id).toBe('rep1');
    expect(repData.total).toBe(10);
    expect(repData.percentVM).toBe(0.5);
    expect(repData.percentContact).toBe(0.3);
    expect(repData.percentUnavailable).toBe(0.2);
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
          { issue_id: 1, name: 'Issue 1', count: 50, slug: 'issue-1' }
        ]
      },
      {
        id: 'TX',
        name: 'Texas',
        total: 80,
        issueCounts: [
          { issue_id: 2, name: 'Issue 2', count: 40, slug: 'issue-2' }
        ]
      },
      {
        id: 'NY',
        name: 'New York',
        total: 120,
        issueCounts: [
          { issue_id: 1, name: 'Issue 1', count: 60, slug: 'issue-1' }
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
          { issue_id: 1, name: 'Issue 1', count: 100, slug: 'issue-1' },
          { issue_id: 2, name: 'Issue 2', count: 50, slug: 'issue-2' },
          { issue_id: 3, name: 'Issue 3', count: 50, slug: 'issue-3' }
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
