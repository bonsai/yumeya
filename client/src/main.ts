import { createRoot } from 'react-dom/client';
import { store } from './store';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from './store';

// --- 簡易 UI 描画 (本来はコンポーネントファイルを分けますが、単一ファイルで完結させるためここに記述) ---
const renderApp = () => {
  const rootElement = document.getElementById('root');
  if (!rootElement) return;

  const user = store.getUser();
  const tasks = store.getTasks();

  // 基本スタイル
  const styles = {
    container: { fontFamily: 'sans-serif', maxWidth: '600px', margin: '2rem auto', padding: '1rem' },
    button: { padding: '0.5rem 1rem', cursor: 'pointer', backgroundColor: '#ff7eb3', color: 'white', border: 'none', borderRadius: '4px' },
    input: { padding: '0.5rem', width: '70%', marginRight: '0.5rem' },
    taskItem: { borderBottom: '1px solid #eee', padding: '1rem 0' },
    subtask: { marginLeft: '1.5rem', fontSize: '0.9rem', color: '#555' }
  };

  if (!user) {
    // 未認証画面
    rootElement.innerHTML = `
      <div style="${Object.entries(styles.container).map(([k,v])=>`${k}:${v}`).join(';')}">
        <h1>🌸 Sakura Task Service</h1>
        <p>Firebase Authentication でログインしてください。</p>
        <button id="login-btn" style="${Object.entries(styles.button).map(([k,v])=>`${k}:${v}`).join(';')}">Google でログイン</button>
      </div>
    `;
    
    document.getElementById('login-btn')?.addEventListener('click', async () => {
      const provider = new GoogleAuthProvider();
      try {
        await signInWithPopup(auth, provider);
      } catch (error) {
        console.error("Login failed", error);
        alert("ログインに失敗しました");
      }
    });
  } else {
    // 認証済み画面
    let tasksHtml = tasks.map(task => `
      <div style="${Object.entries(styles.taskItem).map(([k,v])=>`${k}:${v}`).join(';')}">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <strong>${task.title}</strong>
          <span style="font-size:0.8rem; background:#eee; padding:2px 6px; border-radius:4px;">${task.status}</span>
        </div>
        <p>${task.description}</p>
        ${task.subtasks && task.subtasks.length > 0 ? `
          <div style="margin-top:0.5rem;">
            <small>🤖 Sakura AI Subtasks:</small>
            <ul>
              ${task.subtasks.map(st => `<li style="${styles.subtask as any}">${st.isCompleted ? '✅' : '⬜'} ${st.title}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
        <div style="margin-top:0.5rem;">
          <button onclick="window.splitTask('${task.id}')" style="font-size:0.8rem; cursor:pointer;">✨ AI で分割</button>
          <button onclick="window.doneTask('${task.id}')" style="font-size:0.8rem; cursor:pointer; margin-left:5px;">✅ 完了</button>
          <button onclick="window.deleteTask('${task.id}')" style="font-size:0.8rem; cursor:pointer; margin-left:5px; color:red;">🗑️ 削除</button>
        </div>
      </div>
    `).join('');

    if (tasks.length === 0) {
      tasksHtml = '<p style="color:#777;">タスクがありません。新しく追加してみましょう！</p>';
    }

    rootElement.innerHTML = `
      <div style="${Object.entries(styles.container).map(([k,v])=>`${k}:${v}`).join(';')}">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
          <h1>🌸 Hello, ${user.displayName || 'User'}!</h1>
          <button id="logout-btn" style="background:#ccc; color:#333; ${Object.entries(styles.button).map(([k,v])=>`${k}:${v}`).join(';')}">ログアウト</button>
        </div>

        <div style="margin-bottom:1.5rem; display:flex;">
          <input type="text" id="new-task-title" placeholder="タスクタイトル" style="${Object.entries(styles.input).map(([k,v])=>`${k}:${v}`).join(';')}" />
          <button id="add-btn" style="${Object.entries(styles.button).map(([k,v])=>`${k}:${v}`).join(';')}">追加</button>
        </div>

        <h2>マイタスク</h2>
        <div id="task-list">
          ${tasksHtml}
        </div>
      </div>
    `;

    // イベントリスナー設定
    document.getElementById('logout-btn')?.addEventListener('click', () => signOut(auth));
    
    document.getElementById('add-btn')?.addEventListener('click', async () => {
      const input = document.getElementById('new-task-title') as HTMLInputElement;
      const title = input.value.trim();
      if (!title) return alert('タイトルを入力してください');
      
      try {
        await store.addTask(title, '説明は後で編集できます');
        input.value = '';
      } catch (e) {
        alert('追加エラー:' + e);
      }
    });

    // グローバル関数としてエクスポート (HTML の onclick から呼ぶため)
    (window as any).splitTask = (id: string) => store.splitTaskWithSakuraAI(id);
    (window as any).doneTask = (id: string) => store.updateTask(id, { status: 'done' });
    (window as any).deleteTask = (id: string) => store.deleteTask(id);
  }
};

// 初期化と購読
store.subscribe(renderApp);
renderApp(); // 初回描画