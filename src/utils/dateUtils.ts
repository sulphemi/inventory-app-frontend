export function isValidDate(dateString: string) {
  const dateObject = new Date(dateString);
  if (isNaN(dateObject.getTime())) return false;
  const formatted = dateObject.toISOString().split('T')[0];
  return formatted === dateString;
}

export const widToDate = (wid: string) => {
  if (wid.length >= 6) {
    const yyy_ = (new Date()).getFullYear().toString().slice(0, 3);
    const _y = wid[1];
    const mm = wid.slice(2, 4);
    const dd = wid.slice(4, 6);
    const interpretedDate = `${yyy_}${_y}-${mm}-${dd}`;
    if (isValidDate(interpretedDate)) return interpretedDate;
  }
  return null;
};
