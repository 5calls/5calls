import { processRepsData, ExpandedRepData } from './dashboardData';
import { RepsSummaryData } from './api';

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
          state: 'CA',
        },
      ],
      repsData: [
        {
          id: 'rep1',
          total: 10,
          outcomes: [
            { result: 'voicemail', count: 5 },
            { result: 'contact', count: 3 },
            { result: 'unavailable', count: 2 },
          ],
          topIssues: [],
          aggregatedResults: [],
        },
      ],
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
