// TODO: move to shared table utils
import { getLocale } from '@personio-web/i18n';

export const sortByDate = (
  aDateStr?: string,
  bDateStr?: string,
  desc?: boolean,
) => {
  if (!aDateStr && !bDateStr) return 0;
  if (!aDateStr) return 1;
  if (!bDateStr) return -1;

  const aDate = new Date(aDateStr).getTime();
  const bDate = new Date(bDateStr).getTime();

  return desc ? bDate - aDate : aDate - bDate;
};

export const sortByStr = (aStr = '', bStr = '', desc?: boolean) => {
  const compare = Intl.Collator(getLocale()).compare;
  return desc ? compare(bStr, aStr) : compare(aStr, bStr);
};

export const sortByNum = (aNum = 0, bNum = 0, desc?: boolean) => {
  return desc ? bNum - aNum : aNum - bNum;
};
