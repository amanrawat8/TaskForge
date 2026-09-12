type RecurrenceUnit = "MONTHLY" | "QUARTERLY" | "YEARLY" | null;

export function normalizePeriod(recurrenceUnit: RecurrenceUnit, referenceDate: Date) {
    const year = referenceDate.getUTCFullYear();
    const month = referenceDate.getUTCMonth();

    if(recurrenceUnit === "MONTHLY") {
        return {
            periodStart: new Date(Date.UTC(year, month, 1)),
            periodEnd: new Date(Date.UTC(year, month + 1, 0)),
        };
    }

    if(recurrenceUnit === "QUARTERLY") {
        const quarterStartMonth = Math.floor(month / 3) * 3;

        return {
            periodStart: new Date(Date.UTC(year, quarterStartMonth, 1)),
            periodEnd: new Date(Date.UTC(year, quarterStartMonth + 3, 0)),
        };
    }

    if(recurrenceUnit === "YEARLY") {
        return {
            periodStart: new Date(Date.UTC(year, 0, 1)),
            periodEnd: new Date(Date.UTC(year, 11, 31)),
        };
    }

    //one-time: the engagements "period" is just the single day it was requested for
    const day = new Date(Date.UTC(year, month, referenceDate.getUTCDate()));
    return {
        periodStart: day,
        periodEnd: day 
    };

}


export function addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setUTCDate(result.getUTCDate() + days);
    return result;
}