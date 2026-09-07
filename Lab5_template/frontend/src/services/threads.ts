import axios from 'axios'
import type { Post } from '../types/posts'

// P3
const baseUrl = `/api/threads`;
const threadUrl = `/api/thread`;

const getAll = () => {
  const request = axios.get<Post[]>(`${baseUrl}/`)
  return request.then(response => response.data)
}

interface ThreadAnswer {
  thread: Post
  comments: Post[]
}
const getThread = (id: string) => {
  const request = axios.get<ThreadAnswer>(`${threadUrl}/${id}`) // baseUrl -> threadUrl
  return request.then(response => response.data)
}

interface ThreadCreateData {
  content: string
  author?: string
}
const create = (data: ThreadCreateData) => {
  return axios.post<Post>(`${baseUrl}`, data).then(request => request.data)
}

interface CommentCreateData {
  content: string
  author?: string
  parent?: number
}
const createComment = (data: CommentCreateData, threadId: number) => {
  return axios.post<Post>(`${threadUrl}/${threadId}`, data).then(request => request.data) // baseUrl -> threadUrl
}

const update = (id: number, newObject: Post) => {
  return axios
    .put<Post>(`/api/posts/${id}`, newObject) // `/posts/${id}` -> `/api/posts/${id}`
    .then(request => request.data)
}

export default {
  getAll,
  getThread,
  create,
  createComment,
  update,
}
