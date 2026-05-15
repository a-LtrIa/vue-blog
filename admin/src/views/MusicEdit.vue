<template>
  <div>
    <div class="page-header">
      <h1>{{ isEdit ? '编辑音乐' : '添加音乐' }}</h1>
      <router-link to="/music" class="btn btn-secondary">返回列表</router-link>
    </div>

    <div class="card">
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label>标题</label>
          <input v-model="form.title" type="text" placeholder="请输入音乐标题（留空将使用文件名）" />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>艺术家</label>
            <input v-model="form.artist" type="text" placeholder="请输入艺术家名称（选填）" />
          </div>
          <div class="form-group">
            <label>专辑</label>
            <input v-model="form.album" type="text" placeholder="请输入专辑名称（选填）" />
          </div>
        </div>

        <div class="form-group">
          <label>音频文件</label>
          <div
            class="audio-upload"
            :class="{ 'drag-over': isAudioDragOver }"
            @click="audioInputRef?.click()"
            @dragover.prevent="isAudioDragOver = true"
            @dragleave.prevent="isAudioDragOver = false"
            @drop.prevent="handleAudioDrop"
          >
            <input ref="audioInputRef" type="file" accept="audio/*" @change="handleAudioUpload" />
            <p v-if="!form.audio_url">{{ isUploading ? '正在解析元数据...' : '点击或拖拽上传音频文件（支持 MP3、WAV、OGG 等）' }}</p>
            <div v-else class="audio-info">
              <span>✓ 已选择: {{ audioFileName }}</span>
              <button type="button" class="btn btn-sm btn-danger" @click.stop="removeAudio">移除</button>
            </div>
          </div>
          <p v-if="form.audio_url" class="audio-url-hint">文件地址: {{ form.audio_url }}</p>
        </div>

        <div class="form-group">
          <label>封面图片</label>
          <div
            class="image-upload"
            :class="{ 'drag-over': isCoverDragOver }"
            @click="coverInput?.click()"
            @dragover.prevent="isCoverDragOver = true"
            @dragleave.prevent="isCoverDragOver = false"
            @drop.prevent="handleCoverDrop"
          >
            <input ref="coverInput" type="file" accept="image/*" @change="handleCoverUpload" />
            <p v-if="!form.cover_url">点击或拖拽上传封面图片（选填）</p>
            <img v-else :src="form.cover_url" class="image-preview" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>时长（秒）</label>
            <input v-model.number="form.duration" type="number" placeholder="自动识别（选填）" />
          </div>
          <div class="form-group">
            <label>排序</label>
            <input v-model.number="form.sort_order" type="number" placeholder="数字越小越靠前" />
          </div>
          <div class="form-group">
            <label>状态</label>
            <select v-model="form.status">
              <option value="published">发布</option>
              <option value="draft">草稿</option>
            </select>
          </div>
        </div>

        <div class="actions" style="margin-top: 20px;">
          <button type="submit" class="btn btn-primary" :disabled="loading">
            {{ loading ? '保存中...' : '保存' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { musicApi, uploadApi } from '../api/modules.js'

const route = useRoute()
const router = useRouter()

const isEdit = computed(() => !!route.params.id)
const audioFileName = ref('')

const form = ref({
  title: '',
  artist: '',
  album: '',
  cover_url: '',
  audio_url: '',
  duration: 0,
  sort_order: 0,
  status: 'published'
})

const loading = ref(false)
const isUploading = ref(false)
const isAudioDragOver = ref(false)
const isCoverDragOver = ref(false)

const handleAudioDrop = (e) => {
  isAudioDragOver.value = false
  const file = e.dataTransfer.files[0]
  if (!file) return
  if (!file.type.startsWith('audio/')) {
    alert('请上传音频文件')
    return
  }
  const dt = new DataTransfer()
  dt.items.add(file)
  audioInputRef.value.files = dt.files
  handleAudioUpload({ target: { files: [file] } })
}

const handleAudioUpload = async (e) => {
  const file = e.target.files[0]
  if (!file) return

  isUploading.value = true
  try {
    const { data } = await uploadApi.uploadAudioWithMetadata(file)
    form.value.audio_url = data.url
    audioFileName.value = file.name

    const extracted = []
    if (data.title) {
      form.value.title = data.title
      extracted.push('标题')
    }
    if (data.artist) {
      form.value.artist = data.artist
      extracted.push('艺术家')
    }
    if (data.album) {
      form.value.album = data.album
      extracted.push('专辑')
    }
    if (data.duration) {
      form.value.duration = data.duration
      extracted.push('时长')
    }
    if (data.coverUrl) {
      form.value.cover_url = data.coverUrl
      extracted.push('封面')
    }

    if (extracted.length > 0) {
      showToast(`已自动提取: ${extracted.join('、')}`)
    } else {
      showToast('未识别到元数据，请手动填写')
    }
  } catch (err) {
    alert(err.response?.data?.error || '上传音频失败')
  } finally {
    isUploading.value = false
  }
}

const showToast = (msg) => {
  const toastEl = document.createElement('div')
  toastEl.className = 'upload-toast'
  toastEl.textContent = msg
  document.body.appendChild(toastEl)
  setTimeout(() => {
    toastEl.classList.add('fade-out')
    setTimeout(() => toastEl.remove(), 300)
  }, 3000)
}

const removeAudio = () => {
  form.value.audio_url = ''
  audioFileName.value = ''
  if (audioInputRef.value) {
    audioInputRef.value.value = ''
  }
}

const audioInputRef = ref(null)
const coverInput = ref(null)

const handleCoverDrop = (e) => {
  isCoverDragOver.value = false
  const file = e.dataTransfer.files[0]
  if (!file) return
  if (!file.type.startsWith('image/')) {
    alert('请上传图片文件')
    return
  }
  const dt = new DataTransfer()
  dt.items.add(file)
  coverInput.value.files = dt.files
  handleCoverUpload({ target: { files: [file] } })
}

const handleCoverUpload = async (e) => {
  const file = e.target.files[0]
  if (!file) return

  try {
    const { data } = await uploadApi.uploadImage(file)
    form.value.cover_url = data.url
  } catch (err) {
    alert('上传封面失败')
  }
}

const handleSubmit = async () => {
  if (!form.value.audio_url) {
    alert('请上传音频文件')
    return
  }

  if (!form.value.title) {
    form.value.title = audioFileName.value.replace(/\.[^/.]+$/, '')
  }

  loading.value = true

  try {
    if (isEdit.value) {
      await musicApi.update(route.params.id, form.value)
    } else {
      await musicApi.create(form.value)
    }
    router.push('/music')
  } catch (err) {
    alert(err.response?.data?.error || '保存失败')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  if (isEdit.value) {
    const { data: song } = await musicApi.getOne(route.params.id)
    form.value = {
      title: song.title,
      artist: song.artist || '',
      album: song.album || '',
      cover_url: song.cover_url || '',
      audio_url: song.audio_url || '',
      duration: song.duration || 0,
      sort_order: song.sort_order || 0,
      status: song.status
    }
    if (song.audio_url) {
      audioFileName.value = song.audio_url.split('/').pop()
    }
  }
})
</script>

<style scoped>
.audio-upload {
  border: 2px dashed #ddd;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.3s;
}

.audio-upload:hover {
  border-color: #ffffff;
}

.audio-upload.drag-over {
  border-color: #7877c6;
  background: rgba(120, 119, 198, 0.1);
}

.audio-upload input {
  display: none;
}

.audio-upload p {
  color: #666;
  margin: 0;
}

.audio-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.audio-url-hint {
  font-size: 12px;
  color: #888;
  margin-top: 8px;
  word-break: break-all;
}

.audio-info span {
  color: #333;
}

.image-upload {
  border: 2px dashed #ddd;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.3s, background 0.3s;
}

.image-upload:hover {
  border-color: #7877c6;
}

.image-upload.drag-over {
  border-color: #7877c6;
  background: rgba(120, 119, 198, 0.1);
}

.image-upload input {
  display: none;
}

.image-preview {
  max-width: 120px;
  max-height: 120px;
  border-radius: 8px;
}
</style>

<style>
.upload-toast {
  position: fixed;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  z-index: 9999;
  animation: toast-in 0.3s ease;
}

.upload-toast.fade-out {
  animation: toast-out 0.3s ease forwards;
}

@keyframes toast-in {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

@keyframes toast-out {
  from {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
  to {
    opacity: 0;
    transform: translateX(-50%) translateY(20px);
  }
}
</style>
