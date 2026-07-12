const ISO_DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function isLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

function daysInMonth(year: number, month: number): number {
  if (month === 2) {
    return isLeapYear(year) ? 29 : 28;
  }

  return [4, 6, 9, 11].includes(month) ? 30 : 31;
}

export function isValidISODateOnly(value: string): boolean {
  const match = ISO_DATE_ONLY_PATTERN.exec(value);

  if (!match) {
    return false;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  return (
    year >= 1 &&
    month >= 1 &&
    month <= 12 &&
    day >= 1 &&
    day <= daysInMonth(year, month)
  );
}

export function compareISODateOnlyDescending(a: string, b: string): number {
  const aIsValid = isValidISODateOnly(a);
  const bIsValid = isValidISODateOnly(b);

  if (aIsValid !== bIsValid) {
    return aIsValid ? -1 : 1;
  }

  if (!aIsValid || a === b) {
    return 0;
  }

  return a > b ? -1 : 1;
}

export function formatDateYYYYMMDD(value: string): string {
  if (!isValidISODateOnly(value)) {
    return "날짜 미정";
  }

  return value.replaceAll("-", ".");
}
