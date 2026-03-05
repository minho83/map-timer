import { describe, it, expect, beforeEach } from 'vitest';
import { useAlarmStore } from './alarmStore';

describe('alarmStore', () => {
  beforeEach(() => {
    useAlarmStore.setState({
      alarms: [],
      activeAlarmId: null,
    });
  });

  const sampleAlarm = {
    name: '테스트 알람',
    targetTime: 300000,
    soundFile: 'alarm-default',
    visual: { flash: true, colorChange: true, overlay: true },
    enabled: true,
  };

  it('starts with no alarms', () => {
    expect(useAlarmStore.getState().alarms).toHaveLength(0);
    expect(useAlarmStore.getState().activeAlarmId).toBeNull();
  });

  it('adds an alarm with generated id', () => {
    useAlarmStore.getState().addAlarm(sampleAlarm);
    const alarms = useAlarmStore.getState().alarms;
    expect(alarms).toHaveLength(1);
    expect(alarms[0].name).toBe('테스트 알람');
    expect(alarms[0].triggered).toBe(false);
    expect(alarms[0].id).toBeDefined();
  });

  it('removes an alarm', () => {
    useAlarmStore.getState().addAlarm(sampleAlarm);
    const id = useAlarmStore.getState().alarms[0].id;
    useAlarmStore.getState().removeAlarm(id);
    expect(useAlarmStore.getState().alarms).toHaveLength(0);
  });

  it('updates an alarm', () => {
    useAlarmStore.getState().addAlarm(sampleAlarm);
    const id = useAlarmStore.getState().alarms[0].id;
    useAlarmStore.getState().updateAlarm(id, { name: '수정됨' });
    expect(useAlarmStore.getState().alarms[0].name).toBe('수정됨');
  });

  it('triggers an alarm', () => {
    useAlarmStore.getState().addAlarm(sampleAlarm);
    const id = useAlarmStore.getState().alarms[0].id;
    useAlarmStore.getState().triggerAlarm(id);

    expect(useAlarmStore.getState().activeAlarmId).toBe(id);
    expect(useAlarmStore.getState().alarms[0].triggered).toBe(true);
  });

  it('dismisses active alarm', () => {
    useAlarmStore.getState().addAlarm(sampleAlarm);
    const id = useAlarmStore.getState().alarms[0].id;
    useAlarmStore.getState().triggerAlarm(id);
    useAlarmStore.getState().dismissAlarm();

    expect(useAlarmStore.getState().activeAlarmId).toBeNull();
    // Alarm remains triggered
    expect(useAlarmStore.getState().alarms[0].triggered).toBe(true);
  });

  it('resets all triggers', () => {
    useAlarmStore.getState().addAlarm(sampleAlarm);
    useAlarmStore.getState().addAlarm({ ...sampleAlarm, name: '알람 2' });

    const ids = useAlarmStore.getState().alarms.map((a) => a.id);
    useAlarmStore.getState().triggerAlarm(ids[0]);
    useAlarmStore.getState().triggerAlarm(ids[1]);

    useAlarmStore.getState().resetAllTriggers();

    const alarms = useAlarmStore.getState().alarms;
    expect(alarms.every((a) => !a.triggered)).toBe(true);
    expect(useAlarmStore.getState().activeAlarmId).toBeNull();
  });

  it('toggles alarm enabled state', () => {
    useAlarmStore.getState().addAlarm(sampleAlarm);
    const id = useAlarmStore.getState().alarms[0].id;
    useAlarmStore.getState().updateAlarm(id, { enabled: false });
    expect(useAlarmStore.getState().alarms[0].enabled).toBe(false);
  });
});
