export const nowUnix = () => {
  const now = Date.now();
  return Math.round(now / 1000);
}

export const toUnix = date => {
  return date ? Math.round(date.getTime() / 1000) : null;
}

export const fromUnix = unix => {
  return unix ? unix * 1000 : null;
}

export const formatDate = date => {
  if (date) {
    return `${date.getUTCDate()}/${date.getUTCMonth()+1}/${date.getUTCFullYear()} ${date.getUTCHours()}:${date.getUTCMinutes()}`;
  }
  return null;
}

export const redactString = (string, count, maxLength) => {
  const xes = 'x'.repeat(count);
  string = `${xes}${string.substring(count, string.length)}`;
  if (maxLength) {
    string = `${string.substring(0, maxLength)}...`;
  }
  return string;
}

export const parseBool = string => {
  return string == 'true' ? true : false
}