export function json2Query(data: any): string {
  let url = '';
  if (data) {
    url = url + '?';
    for (let key of Object.keys(data)) {
      const value = data[key];
      if (value) {
        if (value instanceof Array) {
          url = url + `${key}=${value.join(',')}&`;
        } else {
          url = url + `${key}=${value}&`;
        }
      }
    }
    url = url.substring(0, url.length - 1);
  }
  return url;
}