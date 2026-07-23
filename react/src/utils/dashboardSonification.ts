import * as d3 from 'd3';
import {
  BeeswarmCallCount,
  BeeswarmNode,
  calculateToneProperties
} from './dashboardData';

//
// Sonification synthesis code for the dashboard.
//

export const SONFICATION_DURATION = 7; // In seconds.

const playTone = (
  context: AudioContext,
  frequency: number,
  gain: number,
  offsetSeconds: number
) => {
  const oscillator = context.createOscillator();
  const gainNode = context.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(frequency, context.currentTime);

  oscillator.connect(gainNode);
  gainNode.connect(context.destination);

  gainNode.gain.setValueAtTime(gain, context.currentTime + offsetSeconds);
  oscillator.start(context.currentTime + offsetSeconds);
  oscillator.stop(context.currentTime + offsetSeconds + 0.15);
};

const playBackgroundTone = (context: AudioContext, durationSeconds: number) => {
  const droneOsc = context.createOscillator();
  const droneGain = context.createGain();

  droneOsc.type = 'triangle'; // Some texture
  droneOsc.frequency.setValueAtTime(220, context.currentTime); // Low tone
  droneGain.gain.setValueAtTime(0.05, context.currentTime); // Subtle volume

  droneOsc.connect(droneGain);
  droneGain.connect(context.destination);

  droneOsc.start(context.currentTime);
  droneOsc.stop(context.currentTime + durationSeconds);
};

export const playData = (
  context: AudioContext,
  beeswarm: BeeswarmNode<BeeswarmCallCount>[],
  beeswarmScale: d3.ScaleTime<number, number>,
  beeswarmTargetWidth: number
) => {
  // We assume data has the oldest element first.
  for (let i = beeswarm.length - 1; i >= 0; i--) {
    const item = beeswarm[i];
    // Skip things rendered too early. TODO: Maybe just start earlier instead.
    if (item.x < 0) {
      continue;
    }
    const { frequency, gain, offsetSeconds } = calculateToneProperties(
      item.x, // x0 is the preferred offset, x is where it is rendered.
      item.data.selected,
      beeswarmTargetWidth,
      SONFICATION_DURATION
    );
    playTone(context, frequency, gain, offsetSeconds);
  }
  beeswarmScale.ticks().forEach((tick: number) => {
    playTone(context, 212, 0.1, beeswarmScale(tick) / 85);
  });
  playBackgroundTone(context, SONFICATION_DURATION);
  return context.currentTime;
};
