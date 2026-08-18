import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import CallCount from './CallCount';
import * as api from '../utils/api';

// Mock the API module
jest.mock('../utils/api', () => {
  const actual = jest.requireActual('../utils/api');
  return {
    ...actual,
    getCountData: jest.fn()
  };
});

const getMockCountDataMock = api.getCountData as jest.MockedFunction<
  typeof api.getCountData
>;

describe('CallCount Component', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    // Freeze system time at 8:00 PM UTC to ensure consistent midnight elapsed hours
    jest.setSystemTime(new Date('2026-08-17T20:00:00Z'));
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const getDisplayedCount = (): number => {
    const span = screen.getByText((content, element) => {
      return (
        element?.tagName.toLowerCase() === 'span' &&
        content.includes('calls today')
      );
    });
    const matches = span.textContent?.match(/([\d,]+)\s+calls today/);
    return matches ? parseInt(matches[1].replace(/,/g, ''), 10) : 0;
  };

  it('renders loading/fallback state initially', async () => {
    let resolvePromise: (value: any) => void = () => {};
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    getMockCountDataMock.mockReturnValue(promise as any);

    render(<CallCount />);

    // Should show fallback text
    expect(
      screen.getByText(/more than 13 million calls so far/i)
    ).toBeInTheDocument();

    // Resolve API call
    const now = Math.floor(Date.now() / 1000);
    const todayStartTime = new Date().setHours(0, 0, 0, 0) / 1000;

    // 24 hour blocks (using 300 calls per hour to guarantee exceeding 250)
    const hourlyCalls = Array.from({ length: 24 }, (_, i) => {
      const time = Math.floor(now / 3600) * 3600 - (23 - i) * 3600;
      return {
        time,
        count: time >= todayStartTime ? 300 : 5
      };
    });

    const mockData: api.CountData = {
      count: 9000000,
      todayStartTime,
      serverTime: now,
      hourlyCalls
    };

    await act(async () => {
      resolvePromise(mockData);
    });

    const expectedTodayCount = hourlyCalls
      .filter((h) => h.time >= todayStartTime)
      .reduce((sum, h) => sum + h.count, 0);

    // Verify output displays both total calls and a live count within a reasonable starting range
    expect(
      screen.getByText(/We[’']ve made 9,000,000 calls so far and/i)
    ).toBeInTheDocument();

    const displayed = getDisplayedCount();
    expect(displayed).toBeLessThanOrEqual(expectedTodayCount);
    expect(displayed).toBeGreaterThanOrEqual(expectedTodayCount - 150);
  });

  it('shows total count so far if todayCount < 250', async () => {
    const now = Math.floor(Date.now() / 1000);
    const todayStartTime = new Date().setHours(0, 0, 0, 0) / 1000;

    // Low call count today (e.g. 5 calls per hour)
    const hourlyCalls = Array.from({ length: 24 }, (_, i) => {
      const time = Math.floor(now / 3600) * 3600 - (23 - i) * 3600;
      return {
        time,
        count: time >= todayStartTime ? 5 : 0
      };
    });

    const mockData: api.CountData = {
      count: 9152342,
      todayStartTime,
      serverTime: now,
      hourlyCalls
    };

    getMockCountDataMock.mockResolvedValue(mockData);

    render(<CallCount />);

    await act(async () => {
      await Promise.resolve();
    });

    // Should render the total count "so far"
    expect(
      screen.getByText(/We[’']ve made 9,152,342 calls so far/i)
    ).toBeInTheDocument();
  });

  it('shows fallback state if showTotalCount is true but totalCount is null', async () => {
    const now = Math.floor(Date.now() / 1000);
    const todayStartTime = new Date().setHours(0, 0, 0, 0) / 1000;

    const hourlyCalls = Array.from({ length: 24 }, (_, i) => {
      const time = Math.floor(now / 3600) * 3600 - (23 - i) * 3600;
      return { time, count: time >= todayStartTime ? 5 : 0 };
    });

    const mockData: any = {
      count: null,
      todayStartTime,
      serverTime: now,
      hourlyCalls
    };

    getMockCountDataMock.mockResolvedValue(mockData);

    render(<CallCount />);

    await act(async () => {
      await Promise.resolve();
    });

    // Should render the fallback state since totalCount is null
    expect(
      screen.getByText(/more than 13 million calls so far/i)
    ).toBeInTheDocument();
  });

  it('transitions from total count to live ticker when todayCount exceeds 250 on a subsequent poll', async () => {
    const now = Math.floor(Date.now() / 1000);
    const todayStartTime = new Date().setHours(0, 0, 0, 0) / 1000;

    // First poll returns low count
    const hourlyCalls1 = Array.from({ length: 24 }, (_, i) => {
      const time = Math.floor(now / 3600) * 3600 - (23 - i) * 3600;
      return { time, count: time >= todayStartTime ? 5 : 0 };
    });

    const mockData1: api.CountData = {
      count: 9152342,
      todayStartTime,
      serverTime: now,
      hourlyCalls: hourlyCalls1
    };

    getMockCountDataMock.mockResolvedValueOnce(mockData1);

    render(<CallCount />);

    await act(async () => {
      await Promise.resolve();
    });

    expect(
      screen.getByText(/We[’']ve made 9,152,342 calls so far/i)
    ).toBeInTheDocument();

    // Second poll returns high count (> 250)
    const hourlyCalls2 = hourlyCalls1.map((h) =>
      h.time >= todayStartTime
        ? { ...h, count: 300 } // high baseline
        : h
    );

    const todayCount2 = hourlyCalls2
      .filter((h) => h.time >= todayStartTime)
      .reduce((sum, h) => sum + h.count, 0);

    const mockData2: api.CountData = {
      count: 9152500,
      todayStartTime,
      serverTime: now + 120,
      hourlyCalls: hourlyCalls2
    };

    getMockCountDataMock.mockResolvedValueOnce(mockData2);

    await act(async () => {
      jest.advanceTimersByTime(120000); // Trigger poll
    });

    // Verify it transitioned to the live ticker text and displays within the starting range
    expect(
      screen.getByText(/We[’']ve made 9,152,500 calls so far and/i)
    ).toBeInTheDocument();

    const displayed = getDisplayedCount();
    expect(displayed).toBeLessThanOrEqual(todayCount2);
    expect(displayed).toBeGreaterThanOrEqual(todayCount2 - 150);
  });

  it('increments the count over time based on estimated rate on initial load', async () => {
    const now = Math.floor(Date.now() / 1000);
    const todayStartTime = new Date().setHours(0, 0, 0, 0) / 1000;

    const currentHourTime = Math.floor(now / 3600) * 3600;
    const prevHourTime = currentHourTime - 3600;

    const hourlyCalls = Array.from({ length: 24 }, (_, i) => {
      const time = Math.floor(now / 3600) * 3600 - (23 - i) * 3600;
      let count = 0;
      if (time >= todayStartTime) {
        if (time === currentHourTime) {
          count = 100;
        } else if (time === prevHourTime) {
          count = 360;
        } else {
          count = 30;
        }
      }
      return { time, count };
    });

    const mockData: api.CountData = {
      count: 9000000,
      todayStartTime,
      serverTime: now,
      hourlyCalls
    };

    getMockCountDataMock.mockResolvedValue(mockData);

    render(<CallCount />);

    await act(async () => {
      await Promise.resolve();
    });

    expect(
      screen.getByText(/We[’']ve made 9,000,000 calls so far and/i)
    ).toBeInTheDocument();

    // Expect visualCount to start at todayCountSum - (rate * 120s)
    // ratePerMs = 460 / 3600 / 1000 = 0.00012777 calls/ms
    // startingCount = 910 - (0.00012777 * 120000) = 910 - 15 = 895
    expect(getDisplayedCount()).toBe(895);

    // Advance 60 seconds (60000ms)
    await act(async () => {
      jest.advanceTimersByTime(60000);
    });

    // Verify it increased by approx 7 calls (0.00012777 * 60000 = 7.66 calls) -> 902
    expect(getDisplayedCount()).toBe(902);
  });

  it('updates rate and target correctly on subsequent polling', async () => {
    const now = Math.floor(Date.now() / 1000);
    const todayStartTime = new Date().setHours(0, 0, 0, 0) / 1000;

    const hourlyCalls1 = Array.from({ length: 24 }, (_, i) => {
      const time = Math.floor(now / 3600) * 3600 - (23 - i) * 3600;
      return { time, count: time >= todayStartTime ? 300 : 0 }; // 300 per hour to exceed 250
    });

    const todayCount1 = hourlyCalls1
      .filter((h) => h.time >= todayStartTime)
      .reduce((sum, h) => sum + h.count, 0);

    const mockData1: api.CountData = {
      count: 9000000,
      todayStartTime,
      serverTime: now,
      hourlyCalls: hourlyCalls1
    };

    getMockCountDataMock.mockResolvedValueOnce(mockData1);

    render(<CallCount />);

    await act(async () => {
      await Promise.resolve();
    });

    expect(
      screen.getByText(/We[’']ve made 9,000,000 calls so far and/i)
    ).toBeInTheDocument();

    // Check range for the startingCount
    const displayed = getDisplayedCount();
    expect(displayed).toBeLessThanOrEqual(todayCount1);
    expect(displayed).toBeGreaterThanOrEqual(todayCount1 - 50);

    const hourlyCalls2 = hourlyCalls1.map((h) =>
      h.time === hourlyCalls1[hourlyCalls1.length - 1].time
        ? { ...h, count: h.count + 120 } // Add 120 calls in the next poll
        : h
    );
    const todayCount2 = todayCount1 + 120;

    const mockData2: api.CountData = {
      count: 9000000,
      todayStartTime,
      serverTime: now + 120,
      hourlyCalls: hourlyCalls2
    };

    getMockCountDataMock.mockResolvedValueOnce(mockData2);

    await act(async () => {
      jest.advanceTimersByTime(120000); // Trigger poll interval (120s)
    });

    // Advance 60 seconds (halfway through the catch-up polling window)
    // It should count up to roughly half of the 120 extra calls (60 calls)
    await act(async () => {
      jest.advanceTimersByTime(60000);
    });

    const parsedCount = getDisplayedCount();

    // It should have incremented beyond todayCount1 and be approaching todayCount2
    expect(parsedCount).toBeGreaterThan(todayCount1);
    expect(parsedCount).toBeLessThanOrEqual(todayCount2);
  });
});
