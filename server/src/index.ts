import { Hono } from "hono";
import { cors } from "hono/cors";
import type { ApiResponse } from "shared";
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
class TaskStore {
  private tasks: Map<string, TaskData> = new Map();
  private taskCounter: number = 0;
  private readonly similarityThreshold: number = 0.6;

  async addTask(taskText: string, context?: string): Promise<{ taskId: string; items: TaskItem[]; similarTasks: string[] }> {
    this.taskCounter++;
    const taskId = `task_${this.taskCounter}`;
    
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
          content: typeof item === 'string' ? item : (item.content || ''),
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
      content: i < sentences.length ? sentences[i]! : `ステップ${i + 1}: ${base}の詳細処理`,
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

const store = new TaskStore();

// ==================== Hono アプリ ====================
export const app = new Hono()
  .use(cors())
  
  // 元のルート
  .get("/", (c) => {
    return c.text("Hello Hono!");
  })
  .get("/hello", async (c) => {
    const data: ApiResponse = {
      message: "Hello BHVR!",
      success: true,
    };
    return c.json(data, { status: 200 });
  })
  
  // ヘルスチェック
  .get("/health", (c) => {
    return c.json({ status: 'ok', taskCount: store.listTasks().length });
  })
  
  // タスク作成
  .post("/task", async (c) => {
    try {
      const { task, context } = await c.req.json<TaskRequest>();
      
      if (!task || !task.trim()) {
        return c.json({ error: 'タスクが空です' }, 400);
      }
      
      const result = await store.addTask(task, context);
      return c.json(result);
    } catch (error) {
      console.error('Task creation error:', error);
      return c.json({ error: '内部エラー' }, 500);
    }
  })
  
  // タスク取得
  .get("/task/:taskId", (c) => {
    const taskId = c.req.param("taskId");
    const task = store.getTask(taskId);
    if (!task) {
      return c.json({ error: 'タスクが見つかりません' }, 404);
    }
    return c.json({ taskId, ...task });
  })
  
  // アイテム更新
  .patch("/task/:taskId/item/:itemId", async (c) => {
    const taskId = c.req.param("taskId");
    const itemId = parseInt(c.req.param("itemId"));
    const { status } = await c.req.json();
    
    if (!['pending', 'in_progress', 'done'].includes(status)) {
      return c.json({ error: '無効なステータス' }, 400);
    }
    
    if (!store.updateItem(taskId, itemId, status)) {
      return c.json({ error: 'タスクまたはアイテムが見つかりません' }, 404);
    }
    
    return c.json({ message: '更新されました' });
  })
  
  // タスク一覧
  .get("/tasks", (c) => {
    return c.json(store.listTasks());
  });

export default app;