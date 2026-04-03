import { Stats, StatName, StatCaps } from '../types/stats';
import { CAPTURE_CAST_TIME } from '../utils/constants';

export interface CaptureRequirement {
  stat: StatName;
  min: number;
}

/** Проверить, может ли Сфера захватить тело с данными требованиями */
export function canCapture(sphereStats: Stats, requirements: CaptureRequirement[]): boolean {
  return requirements.every(req => sphereStats[req.stat] >= req.min);
}

export enum CaptureState {
  Idle = 'idle',
  Casting = 'casting',
  Success = 'success',
  Interrupted = 'interrupted',
}

export interface CaptureProcess {
  state: CaptureState;
  elapsed: number;       // мс прошло
  duration: number;      // мс всего (CAPTURE_CAST_TIME)
  targetId: string;
}

export function startCapture(targetId: string): CaptureProcess {
  return {
    state: CaptureState.Casting,
    elapsed: 0,
    duration: CAPTURE_CAST_TIME,
    targetId,
  };
}

export function updateCapture(process: CaptureProcess, deltaMs: number): CaptureProcess {
  if (process.state !== CaptureState.Casting) return process;

  const elapsed = process.elapsed + deltaMs;
  if (elapsed >= process.duration) {
    return { ...process, elapsed, state: CaptureState.Success };
  }
  return { ...process, elapsed };
}

export function interruptCapture(process: CaptureProcess): CaptureProcess {
  return { ...process, state: CaptureState.Interrupted };
}
