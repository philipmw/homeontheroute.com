const BASE_URL = 'http://api.homeontheroute.com';

interface Stop {
  id: string;
  lat: number;
  lon: number;
}

export function stops(): Promise<Stop[]> {
  return new Promise((res, rej) => {
    const req = new XMLHttpRequest();
    req.addEventListener('load', function() {
      res(JSON.parse(this.responseText));
    });
    req.addEventListener('error', function() {
      rej('HTTP API error fetching Stops');
    });
    req.open('GET', `${BASE_URL}/stops`);
    req.send();
  });
}