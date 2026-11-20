import { ApiError } from './bookApi';

const OPENAI_IMAGE_URL = 'https://api.openai.com/v1/images/generations';

// TODO(AI 담당): M5 힌트 TODO 1~5 구현
// 반환: 'data:image/png;base64,...'  /  실패: ApiError (401, 429, 0, -1)
export async function generateCoverImage({ apiKey, prompt, quality = 'low' }) {
  void OPENAI_IMAGE_URL; void apiKey; void prompt; void quality;
  throw new ApiError(-1, '아직 구현되지 않았습니다.');
}
