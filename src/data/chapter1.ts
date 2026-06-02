/**
 * Chapter 1 spawn group type.
 *
 * Historical note: this file used to contain hardcoded sub-zone definitions
 * (grey_forest, orc_camp, witch_house, etc.) and a `VILLAGE_STARTER_SPAWNS`
 * list. None of that was wired into the runtime; mob spawns now live in
 * `zones.ts ZoneConfig.spawnGroups` and (for editor-placed mobs) in
 * `mapLayouts/<zoneId>.json`. The dead spawn data was removed when the
 * map was cleared per the "skills first" design pass — see CLAUDE.md.
 */
export interface SpawnGroup {
  x: number;
  y: number;
  creatureId: string;
  count: number;
}
