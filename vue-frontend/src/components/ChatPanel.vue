<template>
  <div class="chat-panel" :class="{ collapsed: isCollapsed }">
    <div class="chat-header" @click="toggleCollapse">
      <h3>Chat</h3>
      <span class="collapse-icon">{{ isCollapsed ? '▶' : '▼' }}</span>
    </div>
    <div v-if="!isCollapsed" class="message-container">
      <div v-for="(msg, index) in messages" :key="index" class="message" :class="msg.role">
        <div class="message-content">{{ msg.content }}</div>
        <div v-if="msg.referencedNode" class="message-reference">
          关联节点: {{ msg.referencedNode }}
        </div>
      </div>
    </div>
    <div v-if="!isCollapsed" class="input-area">
      <textarea v-model="inputMessage" placeholder="输入您的问题..."></textarea>
      <button @click="sendMessage">发送</button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { initDB, saveChatMessage, getChatMessages } from '../utils/localDB'

interface ChatMessage {
  id: string;
  content: string;
  timestamp: number;
  sender: 'user' | 'assistant';
  role?: 'user' | 'assistant';
  referencedNode?: string;
}

export default defineComponent({
  name: 'ChatPanel',
  setup() {
    const messages = ref<ChatMessage[]>([])

    onMounted(async () => {
      await initDB()
      const savedMessages = await getChatMessages()
      messages.value = savedMessages
    })
    const inputMessage = ref('')
    const socket = ref<WebSocket | null>(null)
    const isCollapsed = ref(false)

    const toggleCollapse = () => {
      isCollapsed.value = !isCollapsed.value
    }

    const connectWebSocket = () => {
      socket.value = new WebSocket('ws://localhost:8000/api/chats/ws')
      
      socket.value.onopen = () => {
        console.log('WebSocket连接已建立')
      }

      socket.value.onmessage = (event) => {
        const data = JSON.parse(event.data)
        messages.value.push({
          id: Date.now().toString(),
          content: data.content,
          timestamp: Date.now(),
          sender: 'assistant',
          role: 'assistant',
          referencedNode: data.referenced_node
        })
      }

      socket.value.onclose = () => {
        console.log('WebSocket连接已关闭')
      }
    }

    const sendMessage = async () => {
      if (!inputMessage.value.trim()) return
      
      const message: ChatMessage = {
        id: Date.now().toString(),
        content: inputMessage.value,
        timestamp: Date.now(),
        sender: 'user',
        role: 'user'
      }
      
      messages.value.push(message)
      
      if (socket.value && socket.value.readyState === WebSocket.OPEN) {
        socket.value.send(JSON.stringify({
          type: "message",
          user_id: "current_user", // TODO: 替换为实际用户ID
          content: inputMessage.value,
          node_id: null
        }))
      }
      
      inputMessage.value = ''
    }

    connectWebSocket()

    return {
      messages,
      inputMessage,
      sendMessage,
      isCollapsed,
      toggleCollapse
    }
  }
})
</script>

<style scoped>
.chat-panel {
  position: fixed;
  right: 20px;
  bottom: 20px;
  width: 33vw;
  height: 80vh;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
}

.chat-panel.collapsed {
  height: 40px;
}

.chat-header {
  padding: 10px;
  background: #1976d2;
  color: white;
  border-radius: 8px 8px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}

.chat-header h3 {
  margin: 0;
}

.collapse-icon {
  font-size: 14px;
}

.message-container {
  flex: 1;
  padding: 10px;
  overflow-y: auto;
}

.message {
  margin-bottom: 10px;
  padding: 8px 12px;
  border-radius: 4px;
}

.message.user {
  background: #e3f2fd;
  align-self: flex-end;
}

.message.assistant {
  background: #f5f5f5;
  align-self: flex-start;
}

.message-reference {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}

.input-area {
  padding: 10px;
  border-top: 1px solid #eee;
  display: flex;
}

.input-area textarea {
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: none;
  height: 60px;
}

.input-area button {
  margin-left: 8px;
  padding: 0 12px;
  background: #1976d2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
