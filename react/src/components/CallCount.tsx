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
  const incrementRateRef = useRef<number>(0); // calls per millisecond
  const accumulatorRef = useRef<number>(0);
  const isLiveInitializedRef = useRef<boolean>(false);

  const fetchCount = () => {
    getCountData()
      .then((data: CountData) => {
        const localMidnight = new Date().setHours(0, 0, 0, 0) / 1000;

        // Sum counts for hours >= local midnight
        const todayCount = data.hourlyCalls
          .filter((h) => h.time >= localMidnight)
          .reduce((sum, h) => sum + h.count, 0);

        setTotalCount(data.count);

        if (todayCount < MIN_LIVE_CALL_COUNT) {
          setShowTotalCount(true);
          setLoading(false);
          // If we were previously live, reset live state
          isLiveInitializedRef.current = false;
          return;
        }

        setShowTotalCount(false);

        if (!isLiveInitializedRef.current) {
          isLiveInitializedRef.current = true;

          // Calculate average diurnal rate from current and previous hour
          const currentHour = data.hourlyCalls[data.hourlyCalls.length - 1];
          const prevHour = data.hourlyCalls[data.hourlyCalls.length - 2];

          const elapsedInCurrentHour = Math.max(
            1,
            data.serverTime - currentHour.time
          );
          const totalCallsInPeriod = (prevHour?.count || 0) + currentHour.count;
          const totalTimeInPeriod = 3600 + elapsedInCurrentHour;

          // Rate in calls per millisecond
          const ratePerMs = totalCallsInPeriod / totalTimeInPeriod / 1000;

          targetCountRef.current = Infinity; // No limit during the first period estimation
          incrementRateRef.current = ratePerMs;
          accumulatorRef.current = todayCount;

          setVisualCount(todayCount);
          setLoading(false);
        } else {
          const currentVisual = accumulatorRef.current;
          targetCountRef.current = todayCount;

          if (todayCount > currentVisual) {
            // Distribute increments evenly over the polling window
            incrementRateRef.current =
              (todayCount - currentVisual) / POLLING_INTERVAL_MS;
          } else {
            // Pause if we have already reached or exceeded the target
            incrementRateRef.current = 0;
          }
        }
      })
      .catch((err) => {
        console.error('Failed to fetch live call count:', err);
      });
  };

  useEffect(() => {
    fetchCount();

    // Poll for new data every 2 minutes
    const pollInterval = setInterval(fetchCount, POLLING_INTERVAL_MS);

    // Ticker animation interval: updates the display at high frequency
    let lastTickTime = Date.now();
    const tickInterval = setInterval(() => {
      if (!isLiveInitializedRef.current) {
        return;
      }

      const now = Date.now();
      const delta = now - lastTickTime;
      lastTickTime = now;

      if (incrementRateRef.current > 0) {
        const nextVal =
          accumulatorRef.current + incrementRateRef.current * delta;

        // Cap the accumulator to targetCountRef.current
        accumulatorRef.current = Math.min(targetCountRef.current, nextVal);

        setVisualCount(Math.floor(accumulatorRef.current));
      }
    }, TICK_INTERVAL_MS);

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
        We&rsquo;ve made{' '}
        <span key={visualCount} className="live-count-number">
          {visualCount.toLocaleString()}
        </span>{' '}
        calls today. Join&nbsp;us.
      </span>
    </span>
  );
};

export default CallCount;
