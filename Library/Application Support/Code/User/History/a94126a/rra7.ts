import { generateNumberFromString } from '@personio-web/design-system-utils';

export function getAttributeValue<T extends string[]>(
  attributeOptions: T,
  personId: string | number,
): T[0] {
  return attributeOptions[
    generateNumberFromString(String(personId), attributeOptions.length)
  ];
}
