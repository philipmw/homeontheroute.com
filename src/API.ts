const BASE_URL = 'http://api.homeontheroute.com';

interface Stop {
  id: string;
  lat: number;
  lon: number;
}

export function stops(): Promise<Stop[]> {
  // FIXME: what if there's an error?
  return new Promise((res, rej) => {
    const req = new XMLHttpRequest();
    req.addEventListener('load', function (ev: Event) {
      res(JSON.parse(this.responseText));
    });
    req.open('GET', `${BASE_URL}/stops`);
    req.send();
  });
}