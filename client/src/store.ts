import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  Timestamp,
  DocumentData
} from 'firebase/firestore';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';

// --- Firebase 設定 ---
// .env ファイルから読み込むことを想定しています (Vite の場合 import.meta.env)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// アプリ初期化
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// --- Types ---
export interface Task {
  id?: string;
  title: string;
  description: string;
  status: 'todo' | 'doing' | 'done';
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  subtasks?: SubTask[];
}

export interface SubTask {
  id: string;
  title: string;
  isCompleted: boolean;
}

// --- Store Class ---
class TaskStore {
  private tasks: Task[] = [];
  private currentUser: User | null = null;
  private listeners: (() => void)[] = [];

  constructor() {
    // 認証状態の監視
    onAuthStateChanged(auth, (user) => {
      this.currentUser = user;
      if (user) {
        this.fetchTasks();
      } else {
        this.tasks = [];
        this.notifyListeners();
      }
    });
  }

  // ユーザー取得
  getUser(): User | null {
    return this.currentUser;
  }

  // タスク一覧取得 (Firestore からリアルタイムで取得する場合は listenTasks を使用)
  async fetchTasks() {
    if (!this.currentUser) return;

    try {
      const q = query(
        collection(db, 'tasks'),
        where('userId', '==', this.currentUser.uid)
      );
      const querySnapshot = await getDocs(q);
      
      this.tasks = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate()
      })) as Task[];
      
      this.notifyListeners();
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  }

  // タスク追加
  async addTask(title: string, description: string) {
    if (!this.currentUser) throw new Error('User not authenticated');

    const newTask: Omit<Task, 'id'> = {
      title,
      description,
      status: 'todo',
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: this.currentUser.uid,
      subtasks: []
    };

    try {
      const docRef = await addDoc(collection(db, 'tasks'), newTask);
      await this.fetchTasks(); // 再取得
      return docRef.id;
    } catch (error) {
      console.error('Error adding task:', error);
      throw error;
    }
  }

  // タスク更新
  async updateTask(id: string, updates: Partial<Task>) {
    if (!this.currentUser) throw new Error('User not authenticated');

    try {
      const taskRef = doc(db, 'tasks', id);
      await updateDoc(taskRef, {
        ...updates,
        updatedAt: new Date()
      });
      await this.fetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  // タスク削除
  async deleteTask(id: string) {
    if (!this.currentUser) throw new Error('User not authenticated');

    try {
      await deleteDoc(doc(db, 'tasks', id));
      await this.fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }

  // Sakura AI によるサブタスク分割 (シミュレーション)
  async splitTaskWithSakuraAI(taskId: string): Promise<void> {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) throw new Error('Task not found');

    // 実際にはここで Cloud Functions や外部 API を叩くが、今回は簡易的に生成
    // 例：「タイトルに基づいて3つのサブタスクを生成」
    const generatedSubtasks: SubTask[] = [
      { id: crypto.randomUUID(), title: `準備: ${task.title} の資料確認`, isCompleted: false },
      { id: crypto.randomUUID(), title: `実行: ${task.title} の実施`, isCompleted: false },
      { id: crypto.randomUUID(), title: `完了: ${task.title} の振り返り`, isCompleted: false }
    ];

    await this.updateTask(taskId, { subtasks: generatedSubtasks });
  }

  // リスナー登録
  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // 状態通知
  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }

  // 現在のタスク一覧取得
  getTasks(): Task[] {
    return this.tasks;
  }
}

export const store = new TaskStore();
export { db, auth };