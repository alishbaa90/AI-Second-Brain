import { pool } from './db';
import { getEmbedding } from './gemini';

export async function saveMessage(
  projectId: string,
  role: 'user' | 'assistant',
  content: string
) {
  try {
    const embedding = await getEmbedding(content);

    // pgvector expects the vector as a string like '[0.1,0.2,0.3,...]'
    const embeddingString = `[${embedding.join(',')}]`;

    console.log(`📡 Attempting to save message for ${role}...`);

    await pool.query(
      `INSERT INTO messages (project_id, role, content, embedding)
       VALUES ($1, $2, $3, $4)`,
      [projectId, role, content, embeddingString]
    );

    console.log(`Message saved successfully for ${role}!`);
  } catch (error) {
    console.error(`CRITICAL ERROR in saveMessage (${role}):`, error);
    throw error; // Yeh line route.ts ko error pass karegi taake response 500 aaye aur humein pata chale
  }
}

export async function searchMemory(
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
     WHERE project_id = $2
     ORDER BY embedding <=> $1
     LIMIT $3`,
    [embeddingString, projectId, limit * 3]
  );

  return result.rows
    .filter((row) => row.similarity >= minSimilarity)
    .slice(0, limit);
}