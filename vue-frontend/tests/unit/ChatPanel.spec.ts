import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ChatPanel from '../../src/components/ChatPanel.vue'

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
    
    // 验证初始布局属性
    expect(chatPanel.attributes('style')).toContain('position: fixed')
    expect(chatPanel.attributes('style')).toContain('right: 20px')
    expect(chatPanel.attributes('style')).toContain('bottom: 20px')
    expect(chatPanel.attributes('style')).toContain('width: 33vw')
    expect(chatPanel.attributes('style')).toContain('height: 80vh')
    
    // 验证消息容器滚动行为
    const messageContainer = wrapper.find('.message-container')
    expect(messageContainer.attributes('style')).toContain('overflow-y: auto')
    
    // 验证输入区域高度限制
    const textarea = wrapper.find('.input-area textarea')
    expect(textarea.attributes('style')).toContain('height: 60px')
    expect(textarea.attributes('style')).toContain('resize: none')
  })

  // 测试折叠/展开状态切换
  it('折叠/展开状态DOM变化', async () => {
    const wrapper = mount(ChatPanel)
    
    // 初始状态验证
    expect(wrapper.find('.message-container').isVisible()).toBe(true)
    expect(wrapper.find('.input-area').isVisible()).toBe(true)
    
    // 点击折叠
    await wrapper.find('.chat-header').trigger('click')
    expect(wrapper.find('.chat-panel').classes()).toContain('collapsed')
    expect(wrapper.find('.message-container').isVisible()).toBe(false)
    expect(wrapper.find('.input-area').isVisible()).toBe(false)
    
    // 再次点击展开
    await wrapper.find('.chat-header').trigger('click')
    expect(wrapper.find('.chat-panel').classes()).not.toContain('collapsed')
    expect(wrapper.find('.message-container').isVisible()).toBe(true)
    expect(wrapper.find('.input-area').isVisible()).toBe(true)
  })

  // 测试消息显示DOM结构
  it('消息显示DOM结构测试', async () => {
    const wrapper = mount(ChatPanel, {
      props: {
        messages: [
          { 
            id: 1, 
            content: '测试消息', 
            sender: 'user',
            role: 'user',
            referencedNode: '节点1'
          }
        ]
      }
    })
    
    // 验证消息容器
    const messages = wrapper.findAll('.message')
    expect(messages.length).toBe(1)
    
    // 验证消息内容
    expect(wrapper.find('.message-content').text()).toBe('测试消息')
    expect(wrapper.find('.message-reference').text()).toContain('节点1')
    
    // 验证消息样式类
    expect(wrapper.find('.message').classes()).toContain('user')
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
  })
})
