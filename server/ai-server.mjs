
import { createServer } from 'node:http';

const API_KEY = process.env.OPENAI_API_KEY || process.env.API_KEY;
const PORT = 3100;
console.log('API 키 로드 여부:', Boolean(API_KEY));


function sendJson(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(JSON.stringify(data));
}

createServer(async (req, res) => {
  if (req.method !== 'POST' || req.url !== '/api/cover') {
    return sendJson(res, 404, { error: '요청 경로가 없습니다.' });
  }

  try {
    const chunks = [];
    let size = 0;

    for await (const chunk of req) {
      size += chunk.length;

      if (size > 20000) {
        return sendJson(res, 413, {
          error: '요청 데이터가 너무 큽니다.',
        });
      }

      chunks.push(chunk);
    }

    const { prompt, quality = 'low' } = JSON.parse(
      Buffer.concat(chunks).toString('utf8')
    );

    if (
      typeof prompt !== 'string' ||
      !prompt.trim() ||
      !['low', 'medium', 'high'].includes(quality)
    ) {
      return sendJson(res, 400, {
        error: '이미지 생성 요청이 올바르지 않습니다.',
      });
    }

    const response = await fetch(
      'https://api.openai.com/v1/images/generations',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-image-2',
          prompt,
          n: 1,
          size: '1024x1536',
          quality,
          output_format: 'png',
        }),
        signal: AbortSignal.timeout(180000),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      return sendJson(res, response.status, {
        error: result.error?.message || '이미지 생성에 실패했습니다.',
      });
    }

    const base64 = result.data?.[0]?.b64_json;

    if (!base64) {
      return sendJson(res, 502, {
        error: '이미지 응답 형식이 올바르지 않습니다.',
      });
    }

    return sendJson(res, 200, {
      imageDataUrl: `data:image/png;base64,${base64}`,
    });
  } catch (error) {
    console.error('Image API error:', error.message);

    return sendJson(res, 500, {
      error: '이미지 생성 서버에서 오류가 발생했습니다.',
    });
  }
}).listen(PORT, '127.0.0.1', () => {
  console.log(`AI 서버: http://127.0.0.1:${PORT}`);
});
