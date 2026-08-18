import React, { useEffect, useState, useRef } from 'react';
import { getCountData, CountData } from '../utils/api';

const POLLING_INTERVAL_MS = 2 * 60 * 1000; // 2 minutes
const TICK_INTERVAL_MS = 1000; // Update visual count every 1 second
const MIN_LIVE_CALL_COUNT = 250;

const CallCount: React.FC = () => {
  const [visualCount, setVisualCount] = useState<number | null>(null);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [showTotalCount, setShowTotalCount] = useState(true);
  const [loading, setLoading] = useState(true);

  // Use refs to avoid closure issues in setInterval loop
  const targetCountRef = useRef<number>(0);
  const incrementRateMsRef = useRef<number>(0); // calls per millisecond
  const accumulatorRef = useRef<number>(0);
  const lastTickTimeMsRef = useRef<number>(-1);

  const fetchCount = () => {
    getCountData()
      .then((data: CountData) => {
        setTotalCount(data.count);

        // Sum counts for hours >= local midnight
        const localMidnight = new Date().setHours(0, 0, 0, 0) / 1000;
        const todayCount = data.hourlyCalls
          .filter((h) => h.time >= localMidnight)
          .reduce((sum, h) => sum + h.count, 0);

        const showTotalCount =
          todayCount < MIN_LIVE_CALL_COUNT ||
          !data.hourlyCalls ||
          data.hourlyCalls.length < 24;
        setShowTotalCount(showTotalCount);
        if (showTotalCount) {
          setLoading(false);
          // If we were previously live, reset live state
          lastTickTimeMsRef.current = -1;
          return;
        }

        const isLiveInitialized = lastTickTimeMsRef.current !== -1;

        if (!isLiveInitialized) {
          // First page load or first time the calls are above the minimum threshold.
          // Set to 0 to mark as initialized but not yet ticked (prevents deltaMs errors).
          lastTickTimeMsRef.current = 0;

          // Calculate approximate current call rate from current and previous hour
          const currentHour = data.hourlyCalls[data.hourlyCalls.length - 1];
          const prevHour = data.hourlyCalls[data.hourlyCalls.length - 2];

          const elapsedSecInCurrentHour = Math.max(
            0,
            data.serverTime - currentHour.time
          );
          const totalCallsInPeriod = (prevHour?.count || 0) + currentHour.count;
          const totalTimeSecInPeriod = 3600 + elapsedSecInCurrentHour;

          // Rate in calls per millisecond
          const ratePerMs = totalCallsInPeriod / totalTimeSecInPeriod / 1000;

          // Start the visual count at the estimated value from one polling interval ago,
          // then count up to the target count over the first polling interval.
          const startingCount = Math.max(
            0,
            todayCount - Math.floor(ratePerMs * POLLING_INTERVAL_MS)
          );

          targetCountRef.current = todayCount;
          incrementRateMsRef.current = ratePerMs;
          accumulatorRef.current = startingCount;

          setVisualCount(startingCount);
          setLoading(false);
        } else {
          // Count up based on how many calls have come in since the previous data load.
          const currentVisual = accumulatorRef.current;
          targetCountRef.current = todayCount;

          if (todayCount > currentVisual) {
            // Distribute increments evenly over the polling window
            incrementRateMsRef.current =
              (todayCount - currentVisual) / POLLING_INTERVAL_MS;
          } else {
            // Pause if we have already reached or exceeded the target
            incrementRateMsRef.current = 0;
          }
        }
      })
      .catch((err) => {
        console.error('Failed to fetch live call count:', err);
      });
  };

  const tickCounter = () => {
    if (lastTickTimeMsRef.current === -1) {
      // Not ticking live right now.
      return;
    }

    if (lastTickTimeMsRef.current === 0) {
      // First tick.
      lastTickTimeMsRef.current = Date.now();
      return;
    }

    const nowMs = Date.now();
    const deltaMs = nowMs - lastTickTimeMsRef.current;
    lastTickTimeMsRef.current = nowMs;

    if (incrementRateMsRef.current > 0) {
      const nextVal =
        accumulatorRef.current + incrementRateMsRef.current * deltaMs;

      // Cap the accumulator to targetCountRef.current
      accumulatorRef.current = Math.min(targetCountRef.current, nextVal);

      setVisualCount(Math.floor(accumulatorRef.current));
    }
  };

  useEffect(() => {
    fetchCount();

    // Poll for new data.
    const pollInterval = setInterval(fetchCount, POLLING_INTERVAL_MS);

    // Update the display.
    const tickInterval = setInterval(tickCounter, TICK_INTERVAL_MS);

    return () => {
      clearInterval(pollInterval);
      clearInterval(tickInterval);
    };
  }, []);

  if (showTotalCount && totalCount !== null) {
    return (
      <span>
        We&rsquo;ve made {totalCount.toLocaleString()} calls so far.
        Join&nbsp;us.
      </span>
    );
  }

  if (loading || showTotalCount || visualCount === null) {
    return (
      <span>
        We&rsquo;ve made more than 13 million calls so far. Join&nbsp;us.
      </span>
    );
  }

  return (
    <span className="live-count-wrapper">
      <span>
        We&rsquo;ve made {totalCount?.toLocaleString()} calls so far and{' '}
        <span key={visualCount} className="live-count-number">
          {visualCount.toLocaleString()}
        </span>{' '}
        calls today. Join&nbsp;us.
      </span>
    </span>
  );
};

export default CallCount;
