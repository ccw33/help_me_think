import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ChatPanel from '@/components/ChatPanel.vue'

/**
 * ChatPanel组件单元测试
 * 测试组件基础渲染、消息显示和事件触发功能
 */
describe('ChatPanel.vue', () => {
  // 测试组件是否能正确渲染
  it('组件基础渲染测试', () => {
    const wrapper = mount(ChatPanel)
    expect(wrapper.exists()).toBe(true)
  })

  // 测试组件是否能正确显示传入的消息
  it('消息显示功能测试', async () => {
    const wrapper = mount(ChatPanel, {
      props: {
        messages: [
          { id: 1, content: '测试消息', sender: 'user' }
        ]
      }
    })
    expect(wrapper.text()).toContain('测试消息')
  })

  // 测试点击发送按钮时是否能正确触发send事件
  it('发送消息事件测试', async () => {
    const wrapper = mount(ChatPanel)
    await wrapper.find('input').setValue('新消息')
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted()).toHaveProperty('send')
  })
})
