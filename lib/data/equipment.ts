import equipmentData from "./equipment-raw.json"

export const equipmentOptions = equipmentData

export type Equipment = (typeof equipmentOptions)[number]
