import { Language } from '../types.ts';

/**
 * Gets the current date string for the Asia/Bangkok timezone in YYYY-MM-DD format.
 * This function is robust and avoids common timezone pitfalls.
 * @returns An object with a Date object for the start of today in Bangkok (`now`) 
 *          and the date string in YYYY-MM-DD format (`dateString`).
 */
export const getThaiTime = () => {
    // Using 'en-CA' locale is a reliable way to get the 'YYYY-MM-DD' format.
    const dateString = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Bangkok',
    }).format(new Date());

    // Create a Date object that precisely represents the start of the day in Bangkok.
    // By specifying the timezone offset (+07:00), we avoid ambiguity.
    const nowInBangkok = new Date(`${dateString}T00:00:00.000+07:00`);

    return {
        now: nowInBangkok,
        dateString: dateString,
    };
};

/**
 * Formats a date string (ISO or YYYY-MM-DD) into a localized, human-readable date for the 'Asia/Bangkok' timezone.
 * This correctly handles the full timestamp from the database to prevent "one day behind" errors.
 * @param dateString The date string to format, e.g., "2024-07-22T17:00:00.000Z" or "2024-07-23".
 * @param language The target language ('en' or 'th').
 * @returns A formatted date string without time.
 */
export const formatDisplayDate = (dateString: string, language: Language): string => {
    if (!dateString) {
        return '';
    }
    
    // By creating a Date object directly from the string, we preserve the exact moment in time
    // if it's a full ISO string, or correctly interpret it as UTC midnight if it's 'YYYY-MM-DD'.
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
        return dateString; // Return original if not a valid date
    }

    const options: Intl.DateTimeFormatOptions = {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'Asia/Bangkok', // This is the key: format the date for this specific timezone.
    };

    if (language === 'th') {
        // We use formatToParts to construct the custom string "วันที่ d MMMM พ.ศ.yyyy".
        // 'th-TH-u-ca-buddhist' explicitly uses the Thai locale and Buddhist calendar.
        const parts = new Intl.DateTimeFormat('th-TH-u-ca-buddhist', options).formatToParts(date);
        const dayPart = parts.find(p => p.type === 'day')?.value;
        const monthPart = parts.find(p => p.type === 'month')?.value;
        const yearPart = parts.find(p => p.type === 'year')?.value;
        
        if (dayPart && monthPart && yearPart) {
            return `วันที่ ${dayPart} ${monthPart} พ.ศ.${yearPart}`;
        }
        // Fallback to standard Thai format if parts are not found.
        return new Intl.DateTimeFormat('th-TH-u-ca-buddhist', options).format(date);
    }
    
    // 'en-GB' provides the desired "d MMMM yyyy" format (e.g., 22 July 2024).
    return new Intl.DateTimeFormat('en-GB', options).format(date);
};