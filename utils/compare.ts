export const hasChanges = <T>(data: T, baseInfo: T): boolean => {
    return JSON.stringify(data) !== JSON.stringify(baseInfo);
}