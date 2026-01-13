import { useState, useEffect } from 'react'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL

function App() {
  const [todos, setTodos] = useState([])
  const [newTodo, setNewTodo] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState('')

  // 할 일 목록 조회
  const fetchTodos = async () => {
    try {
      setLoading(true)
      setError(null)

       // API_URL이 설정되지 않은 경우 처리
    if (!API_URL) {
      throw new Error('API URL이 설정되지 않았습니다.')
    }


      const response = await fetch(API_URL)

// Content-Type 확인
const contentType = response.headers.get('content-type')
if (!contentType || !contentType.includes('application/json')) {
  throw new Error('서버가 JSON 형식의 응답을 반환하지 않았습니다.')
}



      if (!response.ok) throw new Error('할 일을 불러오는데 실패했습니다.')
      const data = await response.json()
      setTodos(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTodos()
  }, [])

  // 할 일 추가
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!newTodo.trim()) return

    try {
      setError(null)
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTodo.trim() })
      })
      if (!response.ok) throw new Error('할 일 추가에 실패했습니다.')
      const data = await response.json()
      setTodos([data, ...todos])
      setNewTodo('')
    } catch (err) {
      setError(err.message)
    }
  }

  // 완료 상태 토글
  const handleToggle = async (todo) => {
    try {
      setError(null)
      const response = await fetch(`${API_URL}/${todo._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !todo.completed })
      })
      if (!response.ok) throw new Error('상태 변경에 실패했습니다.')
      const data = await response.json()
      setTodos(todos.map(t => t._id === todo._id ? data : t))
    } catch (err) {
      setError(err.message)
    }
  }

  // 수정 시작
  const startEdit = (todo) => {
    setEditingId(todo._id)
    setEditTitle(todo.title)
  }

  // 수정 취소
  const cancelEdit = () => {
    setEditingId(null)
    setEditTitle('')
  }

  // 수정 저장
  const handleUpdate = async (id) => {
    if (!editTitle.trim()) return

    try {
      setError(null)
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editTitle.trim() })
      })
      if (!response.ok) throw new Error('수정에 실패했습니다.')
      const data = await response.json()
      setTodos(todos.map(t => t._id === id ? data : t))
      setEditingId(null)
      setEditTitle('')
    } catch (err) {
      setError(err.message)
    }
  }

  // 삭제
  const handleDelete = async (id) => {
    try {
      setError(null)
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('삭제에 실패했습니다.')
      setTodos(todos.filter(t => t._id !== id))
    } catch (err) {
      setError(err.message)
    }
  }

  // 날짜 포맷
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const completedCount = todos.filter(t => t.completed).length
  const totalCount = todos.length

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1>Todo</h1>
          <p>오늘 할 일을 정리해보세요</p>
        </header>

        <form className="todo-form" onSubmit={handleSubmit}>
          <input
            type="text"
            className="todo-input"
            placeholder="새로운 할 일을 입력하세요..."
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">
            추가
          </button>
        </form>

        {error && <div className="error">{error}</div>}

        {totalCount > 0 && (
          <div className="stats">
            <div className="stat">
              <div className="stat-value">{totalCount}</div>
              <div className="stat-label">전체</div>
            </div>
            <div className="stat">
              <div className="stat-value">{completedCount}</div>
              <div className="stat-label">완료</div>
            </div>
            <div className="stat">
              <div className="stat-value">{totalCount - completedCount}</div>
              <div className="stat-label">남은 일</div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>불러오는 중...</p>
          </div>
        ) : todos.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h3>할 일이 없습니다</h3>
            <p>새로운 할 일을 추가해보세요!</p>
          </div>
        ) : (
          <div className="todo-list">
            {todos.map((todo, index) => (
              <div 
                key={todo._id} 
                className={`todo-item ${todo.completed ? 'completed' : ''}`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {editingId === todo._id ? (
                  <>
                    <form className="edit-form" onSubmit={(e) => { e.preventDefault(); handleUpdate(todo._id); }}>
                      <input
                        type="text"
                        className="edit-input"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        autoFocus
                      />
                      <button type="submit" className="btn-icon btn-save">✓</button>
                      <button type="button" className="btn-icon btn-cancel" onClick={cancelEdit}>✕</button>
                    </form>
                  </>
                ) : (
                  <>
                    <label className="checkbox-wrapper">
                      <input
                        type="checkbox"
                        checked={todo.completed}
                        onChange={() => handleToggle(todo)}
                      />
                      <span className="checkmark"></span>
                    </label>
                    <div className="todo-content">
                      <div className="todo-title">{todo.title}</div>
                      <div className="todo-date">{formatDate(todo.createdAt)}</div>
                    </div>
                    <div className="todo-actions">
                      <button className="btn-icon btn-edit" onClick={() => startEdit(todo)}>✎</button>
                      <button className="btn-icon btn-delete" onClick={() => handleDelete(todo._id)}>✕</button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
