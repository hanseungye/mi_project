
export async function generateCoverImage({
  prompt,
  quality = 'low',
}) {
  const response = await fetch('/api/cover', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt, quality }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error || 'AI 표지 생성에 실패했습니다.'
    );
  }

  if (!data.imageDataUrl) {
    throw new Error('생성된 이미지가 없습니다.');
  }

  return data.imageDataUrl;
}
