import express, { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

// ==================== 型定義 ====================
interface TaskItem {
  id: number;
  content: string;
  status: 'pending' | 'in_progress' | 'done';
}

interface TaskData {
  originalTask: string;
  context?: string;
  items: TaskItem[];
  similarTasks: string[];
}

interface TaskRequest {
  task: string;
  context?: string;
}

interface TaskResponse {
  taskId: string;
  originalTask: string;
  items: TaskItem[];
  similarTasks: string[];
}

// ==================== タスクストア ====================
// TODO: GCFirestore - 将来の実装予定
// 現在はメモリストアを使用。後日Cloud Firestoreに移行予定。
// 移行時に以下の機能を提供：
// 1. タスクデータの永続化
// 2. 類似タスク検索の最適化（ベクトル検索またはコサイン類似度）
// 3. リアルタイム更新のサポート
class TaskStore {
  private tasks: Map<string, TaskData> = new Map();
  private taskCounter: number = 0;
  private readonly similarityThreshold: number = 0.6;

  async addTask(taskText: string, context?: string): Promise<{ taskId: string; items: TaskItem[]; similarTasks: string[] }> {
    this.taskCounter++;
    const taskId = `task_${this.taskCounter}`;
    
    // Sakura AI APIで分割（またはフォールバック）
    const items = await this.splitWithAI(taskText);
    const similar = this.findSimilar(taskText);
    
    const taskData: TaskData = {
      originalTask: taskText,
      context,
      items,
      similarTasks: similar,
    };
    
    this.tasks.set(taskId, taskData);
    return { taskId, items, similarTasks: similar };
  }

  private async splitWithAI(taskText: string): Promise<TaskItem[]> {
    const apiKey = process.env.SAKURA_AI_API_KEY || '';
    
    if (!apiKey) {
      return this.fallbackSplit(taskText);
    }

    try {
      // Sakura AI APIを同期的に呼び出す（簡易実装）
      // 実際の実装では非同期で適切に処理
      const response = await axios.post(
        'https://api.sakura.ad.jp/v1/chat/completions',
        {
          model: 'gpt-oss-120b',
          messages: [
            {
              role: 'system',
              content: 'タスク分割の専門家。9つのアイテムに分割し、JSON形式で出力。',
            },
            {
              role: 'user',
              content: `タスク: ${taskText}\n\n9つのアイテムに分割してJSON形式で出力してください。`,
            },
          ],
          temperature: 0.7,
          max_tokens: 1500,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      const content = response.data.choices[0].message.content;
      const jsonMatch = content.match(/\{.*\}/s);
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0]);
        const items = data.items || [];
        return items.slice(0, 9).map((item: any, index: number) => ({
          id: index + 1,
          content: typeof item === 'string' ? item : item.content,
          status: 'pending' as const,
        }));
      }
    } catch (error) {
      console.error('AI API Error:', error);
    }

    return this.fallbackSplit(taskText);
  }

  private fallbackSplit(taskText: string): TaskItem[] {
    const sentences = taskText.split(/[。\n！？]+/).filter(s => s.trim().length > 0);
    
    if (sentences.length >= 9) {
      return sentences.slice(0, 9).map((s, i) => ({
        id: i + 1,
        content: s.trim(),
        status: 'pending' as const,
      }));
    }
    
    const base = taskText.slice(0, 100);
    return Array.from({ length: 9 }, (_, i) => ({
      id: i + 1,
      content: i < sentences.length ? sentences[i] : `ステップ${i + 1}: ${base}の詳細処理`,
      status: 'pending' as const,
    }));
  }

  private findSimilar(taskText: string): string[] {
    const taskWords = new Set((taskText.toLowerCase().match(/\w+/g) || []) as string[]);
    const similar: string[] = [];
    
    for (const [tid, tdata] of this.tasks.entries()) {
      const existingWords = new Set((tdata.originalTask.toLowerCase().match(/\w+/g) || []) as string[]);
      if (taskWords.size > 0 && existingWords.size > 0) {
        const overlap = [...taskWords].filter(w => existingWords.has(w)).length;
        const similarity = overlap / Math.max(taskWords.size, existingWords.size);
        if (similarity >= this.similarityThreshold) {
          similar.push(tid);
        }
      }
    }
    
    return similar;
  }

  getTask(taskId: string): TaskData | undefined {
    return this.tasks.get(taskId);
  }

  updateItem(taskId: string, itemId: number, status: 'pending' | 'in_progress' | 'done'): boolean {
    const task = this.tasks.get(taskId);
    if (!task) return false;
    
    const item = task.items.find(i => i.id === itemId);
    if (!item) return false;
    
    item.status = status;
    return true;
  }

  listTasks(): Array<{ taskId: string; originalTask: string; itemCount: number; similarCount: number }> {
    return Array.from(this.tasks.entries()).map(([tid, tdata]) => ({
      taskId: tid,
      originalTask: tdata.originalTask.slice(0, 50),
      itemCount: tdata.items.length,
      similarCount: tdata.similarTasks.length,
    }));
  }
}

// ==================== Expressアプリ ====================
const app = express();
app.use(express.json());

const store = new TaskStore();

// ヘルスチェック
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', taskCount: store.listTasks().length });
});

// タスク作成
app.post('/task', async (req: Request, res: Response) => {
  try {
    const { task, context } = req.body as TaskRequest;
    
    if (!task || !task.trim()) {
      return res.status(400).json({ error: 'タスクが空です' });
    }
    
    const result = await store.addTask(task, context);
    res.json(result);
  } catch (error) {
    console.error('Task creation error:', error);
    res.status(500).json({ error: '内部エラー' });
  }
});

// タスク取得
app.get('/task/:taskId', (req: Request, res: Response) => {
  const task = store.getTask(req.params.taskId);
  if (!task) {
    return res.status(404).json({ error: 'タスクが見つかりません' });
  }
  res.json({ taskId: req.params.taskId, ...task });
});

// アイテム更新
app.patch('/task/:taskId/item/:itemId', (req: Request, res: Response) => {
  const { taskId, itemId } = req.params;
  const { status } = req.body;
  
  if (!['pending', 'in_progress', 'done'].includes(status)) {
    return res.status(400).json({ error: '無効なステータス' });
  }
  
  if (!store.updateItem(taskId, parseInt(itemId), status)) {
    return res.status(404).json({ error: 'タスクまたはアイテムが見つかりません' });
  }
  
  res.json({ message: '更新されました' });
});

// タスク一覧
app.get('/tasks', (req: Request, res: Response) => {
  res.json(store.listTasks());
});

// ==================== サーバー起動 ====================
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Sakura Task Service (TypeScript) running on port ${PORT}`);
});
