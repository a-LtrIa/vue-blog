<template>
  <div>
    <div class="page-header">
      <h1>留言管理</h1>
      <button @click="loadFeedback" class="btn btn-primary" :disabled="loading">
        {{ loading ? '加载中...' : '刷新' }}
      </button>
    </div>

    <div class="card">
      <div class="card-header">
        <h3>游客留言</h3>
        <span class="badge">{{ feedbacks.length }} 条留言</span>
      </div>

      <div v-if="feedbacks.length === 0 && !loading" class="empty-state">
        <p>暂无留言</p>
      </div>

      <div v-else class="feedback-list">
        <div
          v-for="item in feedbacks"
          :key="item.id"
          class="feedback-item"
          :class="{ 'has-reply': item.reply }"
        >
          <div class="feedback-header">
            <div class="feedback-user">
              <span class="username">{{ item.username }}</span>
              <span class="email" v-if="item.email">{{ item.email }}</span>
            </div>
            <div class="feedback-meta">
              <span class="ip">IP: {{ item.ip }}</span>
              <span class="time">{{ formatDate(item.created_at) }}</span>
            </div>
          </div>

          <div class="feedback-content">
            {{ item.content }}
          </div>

          <div v-if="item.reply" class="feedback-reply">
            <div class="reply-header">
              <div class="reply-title">
                <span class="reply-label">我的回复</span>
                <span class="reply-badge">已邮件通知</span>
              </div>
              <span class="reply-time">{{ formatDate(item.reply_created_at) }}</span>
            </div>
            <div class="reply-content">{{ item.reply }}</div>
          </div>

          <div v-else class="feedback-actions">
            <button
              v-if="!item.showReplyForm && item.email"
              @click="item.showReplyForm = true"
              class="btn btn-primary btn-sm"
            >
              回复
            </button>
            <span v-else-if="!item.email" class="no-email-tip">用户未留邮箱，无法回复</span>
            <button
              @click="deleteFeedback(item.id)"
              class="btn btn-danger btn-sm"
            >
              删除
            </button>
          </div>

          <div v-if="item.showReplyForm" class="reply-form">
            <textarea
              v-model="item.replyContent"
              placeholder="输入回复内容..."
              rows="3"
            ></textarea>
            <div class="reply-form-actions">
              <button
                @click="submitReply(item)"
                class="btn btn-primary btn-sm"
                :disabled="item.submitting || !item.replyContent.trim()"
              >
                {{ item.submitting ? '提交中...' : '提交回复' }}
              </button>
              <button
                @click="cancelReply(item)"
                class="btn btn-secondary btn-sm"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { feedbackApi } from '../api/modules.js'

const feedbacks = ref([])
const loading = ref(false)

const loadFeedback = async () => {
  loading.value = true
  try {
    const res = await feedbackApi.getAll()
    const list = res.data.data || []
    feedbacks.value = list.map(item => ({
      ...item,
      showReplyForm: false,
      replyContent: '',
      submitting: false
    }))
  } catch (err) {
    alert('加载留言失败')
    console.error(err)
  } finally {
    loading.value = false
  }
}

const submitReply = async (item) => {
  if (!item.replyContent.trim()) return

  item.submitting = true
  try {
    const { data } = await feedbackApi.reply(item.id, {
      reply: item.replyContent.trim()
    })
    item.reply = data.reply
    item.reply_created_at = data.reply_created_at
    item.showReplyForm = false
    item.replyContent = ''
  } catch (err) {
    alert('回复失败')
    console.error(err)
  } finally {
    item.submitting = false
  }
}

const cancelReply = (item) => {
  item.showReplyForm = false
  item.replyContent = ''
}

const deleteFeedback = async (id) => {
  if (!confirm('确定要删除这条留言吗？')) return

  try {
    await feedbackApi.delete(id)
    feedbacks.value = feedbacks.value.filter(item => item.id !== id)
  } catch (err) {
    alert('删除失败')
    console.error(err)
  }
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  loadFeedback()
})
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 28px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0;
}

.badge {
  background: rgba(0, 0, 0, 0.08);
  color: #1d1d1f;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 13px;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #7a7a7a;
}

.feedback-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.feedback-item {
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 16px;
}

.feedback-item.has-reply {
  border-left: 3px solid #4CAF50;
}

.feedback-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.feedback-user {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.username {
  font-weight: 600;
  color: #1d1d1f;
  font-size: 15px;
}

.email {
  font-size: 13px;
  color: #7a7a7a;
}

.feedback-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  font-size: 12px;
  color: #7a7a7a;
}

.feedback-content {
  color: #1d1d1f;
  line-height: 1.6;
  margin-bottom: 12px;
  white-space: pre-wrap;
}

.feedback-reply {
  background: #f5f5f7;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 12px;
  margin-top: 12px;
}

.reply-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.reply-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.reply-label {
  color: #4CAF50;
  font-weight: 600;
  font-size: 13px;
}

.reply-badge {
  background: #4CAF50;
  color: #fff;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
}

.reply-time {
  font-size: 12px;
  color: #7a7a7a;
}

.reply-content {
  color: #1d1d1f;
  line-height: 1.6;
  white-space: pre-wrap;
}

.feedback-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  align-items: center;
}

.no-email-tip {
  font-size: 13px;
  color: #999;
  font-style: italic;
}

.reply-form {
  margin-top: 12px;
}

.reply-form textarea {
  width: 100%;
  padding: 12px;
  background: #fafafc;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  color: #1d1d1f;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  box-sizing: border-box;
}

.reply-form textarea:focus {
  outline: none;
  border-color: #0066cc;
}

.reply-form-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: #0066cc;
  color: #ffffff;
}

.btn-primary:hover:not(:disabled) {
  background: #0071e3;
}

.btn-secondary {
  background: #f0f0f0;
  color: #1d1d1f;
}

.btn-secondary:hover:not(:disabled) {
  background: #e0e0e0;
}

.btn-danger {
  background: #ff3b30;
  color: #ffffff;
}

.btn-danger:hover:not(:disabled) {
  background: #d63929;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 13px;
}
</style>
