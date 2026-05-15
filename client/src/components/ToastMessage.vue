<template>
  <Teleport to="body">
    <Transition name="toast-fade">
      <div v-if="visible" class="toast-message">
        <CheckCircle :size="16" />
        <span>{{ message }}</span>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'
import { CheckCircle } from 'lucide-vue-next'

const props = defineProps({
  message: {
    type: String,
    default: ''
  },
  trigger: {
    type: Number,
    default: 0
  }
})

const visible = ref(false)
let timer = null

watch(() => props.trigger, () => {
  if (props.trigger > 0) {
    clearTimeout(timer)
    visible.value = true
    timer = setTimeout(() => {
      visible.value = false
    }, 2000)
  }
})
</script>

<style scoped>
.toast-message {
  position: fixed;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: rgba(72, 199, 142, 0.15);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(72, 199, 142, 0.3);
  border-radius: 12px;
  color: #48c78e;
  font-size: 14px;
  font-weight: 500;
  z-index: 2000;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  pointer-events: none;
}

.toast-fade-enter-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.toast-fade-leave-active {
  transition: all 0.25s ease;
}

.toast-fade-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(-12px) scale(0.95);
}

.toast-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-8px) scale(0.95);
}
</style>