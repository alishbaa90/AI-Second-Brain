import { pool } from './db';
import { getEmbedding } from './gemini';

export async function saveMessage(
  userId: string,
  projectId: string,
  role: 'user' | 'assistant',
  content: string
) {
  const embedding = await getEmbedding(content);
  const embeddingString = `[${embedding.join(',')}]`;

  await pool.query(
    `INSERT INTO messages (user_id, project_id, role, content, embedding)
     VALUES ($1, $2, $3, $4, $5)`,
    [userId, projectId, role, content, embeddingString]
  );
}

export async function searchMemory(
  userId: string,
  projectId: string,
  query: string,
  limit: number = 5,
  minSimilarity: number = 0.65
) {
  const queryEmbedding = await getEmbedding(query);
  const embeddingString = `[${queryEmbedding.join(',')}]`;

  const result = await pool.query(
    `SELECT id, role, content, created_at,
            1 - (embedding <=> $1) AS similarity
     FROM messages
     WHERE project_id = $2 AND user_id = $3
     ORDER BY embedding <=> $1
     LIMIT $4`,
    [embeddingString, projectId, userId, limit * 3]
  );

  return result.rows.filter((row) => row.similarity >= minSimilarity).slice(0, limit);
}