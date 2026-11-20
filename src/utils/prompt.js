const MAX_CONTENT = 500;

// TODO(AI 담당): 테스트 후 문구 조정
export function buildCoverPrompt({ title, author, content }) {
  const summary = content.length > MAX_CONTENT ? `${content.slice(0, MAX_CONTENT)}...` : content;
  return [
    'Create a vertical book cover illustration.',
    `Book title: "${title}"`,
    `Author: ${author}`,
    `Story / content: ${summary}`,
    'Capture the mood, genre and key imagery of the content.',
    'Leave clean space at the top for the title.',
    'Do not add any text, letters or watermarks to the image.',
  ].join('\n');
}
