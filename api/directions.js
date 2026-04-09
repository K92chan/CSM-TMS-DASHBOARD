export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { start, goal, waypoints } = req.body;
  const clientId = 'nti3kkmh2c';
  const clientSecret = process.env.NAVER_CLIENT_SECRET;

  const headers = {
    'X-NCP-APIGW-API-KEY-ID': clientId,
    'X-NCP-APIGW-API-KEY': clientSecret
  };

  const 경유배열 = waypoints
    ? waypoints.split('|').map(w => w.trim()).filter(w => w.includes(','))
    : [];

  const 시도목록 = [
    { base: 'https://maps.apigw.ntruss.com',         api: 'map-direction-15', 최대: 15, 구분자: '|' },
    { base: 'https://naveropenapi.apigw.ntruss.com', api: 'map-direction-15', 최대: 15, 구분자: '|' },
    { base: 'https://maps.apigw.ntruss.com',         api: 'map-direction',    최대: 5,  구분자: ':' },
    { base: 'https://naveropenapi.apigw.ntruss.com', api: 'map-direction',    최대: 5,  구분자: ':' },
  ];

  for (const { base, api, 최대, 구분자 } of 시도목록) {
    try {
      const wp = 경유배열.slice(0, 최대).join(구분자);
      let url = `${base}/${api}/v1/driving?start=${start}&goal=${goal}`;
      if (wp) url += `&waypoints=${wp}`;
      url += `&option=trafast`;

      const r = await fetch(url, { headers });
      const data = await r.json();

      if (data.code === 0 && data.route) {
        return res.status(200).json(data);
      }
    } catch(e) {
      console.log(`[${api}] 오류:`, e.message);
    }
  }

  return res.status(200).json({ code: -1, message: '모든 엔드포인트 실패' });
}
