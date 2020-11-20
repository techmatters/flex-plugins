export const splitDate = (date: string) => date.split('-').map(s => parseInt(s, 10));

export const splitTime = (time: string) => time.split(':').map(s => parseInt(s, 10));
