export const log = (message: any) => console.log(getDate(), message);
export const logError = (message: any) => console.error(getDate(), message);
export const formatTime = (num: number) => num > 9 ? num : ("0" + num);
export function getDate() {
    const date = new Date();
    return `[${formatTime(date.getHours())}:${formatTime(date.getMinutes())}]`;
}