import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import ChatPanel from '../../src/components/ChatPanel.vue'

// Mock WebSocket
const mockWebSocket = {
  onopen: vi.fn(),
  onmessage: vi.fn(),
  onclose: vi.fn(),
  send: vi.fn(),
  readyState: WebSocket.OPEN
}

vi.stubGlobal('WebSocket', vi.fn(() => mockWebSocket))

// Mock localDB module
vi.mock('../../src/utils/localDB', () => ({
  initDB: vi.fn(() => Promise.resolve({
    transaction: vi.fn(() => ({
      objectStore: vi.fn(() => ({
        put: vi.fn(() => Promise.resolve()),
        getAll: vi.fn(() => Promise.resolve([]))
      }))
    }))
  })),
  getChatMessages: vi.fn(() => Promise.resolve([]))
}))

/**
 * ChatPanel组件单元测试
 * 测试组件基础渲染、消息显示和事件触发功能
 */
describe('ChatPanel.vue', () => {
  // 测试组件基础DOM结构
  it('组件基础DOM结构测试', () => {
    const wrapper = mount(ChatPanel)
    expect(wrapper.exists()).toBe(true)
    
    // 验证基础DOM结构
    const chatPanel = wrapper.find('.chat-panel')
    expect(chatPanel.exists()).toBe(true)
    expect(wrapper.find('.chat-header').exists()).toBe(true)
    expect(wrapper.find('.message-container').exists()).toBe(true)
    expect(wrapper.find('.input-area').exists()).toBe(true)
    
    // 验证初始样式类
    expect(chatPanel.classes()).not.toContain('collapsed')
    
    // 验证样式类
    expect(chatPanel.classes()).toContain('chat-panel')
    
    // 验证消息容器存在
    expect(wrapper.find('.message-container').exists()).toBe(true)
    
    // 验证输入区域存在
    expect(wrapper.find('.input-area textarea').exists()).toBe(true)
  })

  // 测试折叠/展开状态切换
  it('折叠/展开状态DOM变化', async () => {
    const wrapper = mount(ChatPanel)
    
    // 初始状态验证
    expect(wrapper.find('.message-container').exists()).toBe(true)
    expect(wrapper.find('.input-area').exists()).toBe(true)
    
    // 点击折叠
    await wrapper.find('.chat-header').trigger('click')
    expect(wrapper.find('.chat-panel').classes()).toContain('collapsed')
    expect(wrapper.find('.message-container').exists()).toBe(false)
    expect(wrapper.find('.input-area').exists()).toBe(false)
    
    // 再次点击展开
    await wrapper.find('.chat-header').trigger('click')
    expect(wrapper.find('.chat-panel').classes()).not.toContain('collapsed')
    expect(wrapper.find('.message-container').exists()).toBe(true)
    expect(wrapper.find('.input-area').exists()).toBe(true)
  })

  // 测试消息显示DOM结构
  it('消息显示DOM结构测试', async () => {
    const testMessage = { 
      id: '1',
      content: '测试消息',
      sender: 'user',
      role: 'user',
      timestamp: Date.now(),
      referencedNode: '节点1'
    }
    
    const wrapper = mount(ChatPanel, {
      setup() {
        return {
          messages: ref([testMessage])
        }
      }
    })
    
    // 调试输出
    console.log('Wrapper HTML:', wrapper.html())
    console.log('Component messages:', wrapper.vm.messages)
    
    // 等待渲染完成
    await new Promise(resolve => setTimeout(resolve, 200))
    await wrapper.vm.$nextTick()
    
    // 验证消息容器存在
    const messageContainer = wrapper.find('.message-container')
    expect(messageContainer.exists()).toBe(true)
    
    // 验证消息渲染
    const messageElements = messageContainer.findAll('.message')
    console.log('Found message elements:', messageElements.length)
    
    expect(messageElements.length).toBe(1)
    
    // 验证消息内容
    const messageElement = messageElements[0]
    expect(messageElement.find('.message-content').exists()).toBe(true)
    expect(messageElement.find('.message-content').text()).toBe(testMessage.content)
    
    if (testMessage.referencedNode) {
      expect(messageElement.find('.message-reference').exists()).toBe(true)
      expect(messageElement.find('.message-reference').text()).toContain(testMessage.referencedNode)
    }
    
    // 验证消息样式类
    expect(messageElement.classes()).toContain(testMessage.role)
  })

  // 测试输入区域DOM结构
  it('输入区域DOM结构测试', () => {
    const wrapper = mount(ChatPanel)
    
    // 验证输入区域结构
    expect(wrapper.find('.input-area textarea').exists()).toBe(true)
    expect(wrapper.find('.input-area textarea').attributes('placeholder')).toBe('输入您的问题...')
    expect(wrapper.find('.input-area button').exists()).toBe(true)
    expect(wrapper.find('.input-area button').text()).toBe('发送')
  })

  // 测试发送消息事件
  it('发送消息事件测试', async () => {
    const wrapper = mount(ChatPanel)
    await wrapper.find('.input-area textarea').setValue('新消息')
    await wrapper.find('.input-area button').trigger('click')
    await new Promise(resolve => setTimeout(resolve, 100))
    expect(wrapper.emitted()).toHaveProperty('send')
    expect(mockWebSocket.send).toHaveBeenCalledWith(JSON.stringify({
      type: "message",
      user_id: "current_user",
      content: "新消息",
      node_id: null
    }))
  })

  // 测试WebSocket消息接收
  it('测试接收WebSocket消息', async () => {
    const wrapper = mount(ChatPanel)
    const testMessage = {
      content: '测试回复',
      referenced_node: '节点1'
    }
    // 模拟WebSocket消息接收
    const messageEvent = new MessageEvent('message', {
      data: JSON.stringify(testMessage)
    })
    mockWebSocket.onmessage(messageEvent)
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.messages).toContainEqual({
      id: expect.any(String),
      content: '测试回复',
      timestamp: expect.any(Number),
      sender: 'assistant',
      role: 'assistant',
      referencedNode: '节点1'
    })
  })

  // 测试WebSocket连接
  it('测试WebSocket连接建立', async () => {
    const wrapper = mount(ChatPanel)
    // 验证WebSocket构造函数被调用
    expect(WebSocket).toHaveBeenCalledWith('ws://localhost:8000/api/chats/ws')
    // 模拟连接成功
    const openHandler = vi.fn()
    mockWebSocket.onopen = openHandler
    const openEvent = new Event('open')
    mockWebSocket.onopen(openEvent)
    await wrapper.vm.$nextTick()
    expect(openHandler).toHaveBeenCalled()
  })
})
