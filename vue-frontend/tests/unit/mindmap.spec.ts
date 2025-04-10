import { describe, it, expect, vi, beforeAll } from 'vitest'
import { mount } from '@vue/test-utils'
import { render } from '@testing-library/vue'
import MindMap from '../../src/components/MindMap.vue'
import axios from 'axios'

vi.mock('axios')

describe('MindMap.vue', () => {
  beforeAll(() => {
    window.alert = vi.fn()
  })

  it('渲染基础画布布局', () => {
    const { getByTestId } = render(MindMap)
    const container = getByTestId('mindmap-container')
    
    // 验证容器基础样式
    expect(container).toHaveStyle('position: absolute')
    expect(container).toHaveStyle('top: 0')
    expect(container).toHaveStyle('bottom: 0')
    expect(container).toHaveStyle('left: 0')
    expect(container).toHaveStyle('right: 0')
    expect(container).toHaveStyle('overflow: hidden')
    expect(container).toHaveStyle('margin: 0')
    expect(container).toHaveStyle('padding: 0')
  })

  it('验证画布div尺寸和背景', () => {
    const wrapper = mount(MindMap)
    const diagramDiv = wrapper.find('div[ref="diagramDiv"]')
    
    // 验证画布div存在
    expect(diagramDiv.exists()).toBe(true)
    
    // 验证画布样式
    expect(diagramDiv.attributes('style')).toContain('width:100%')
    expect(diagramDiv.attributes('style')).toContain('height:100%')
    expect(diagramDiv.attributes('style')).toContain('background-color: white')
    
    // 验证画布层级
    expect(diagramDiv.element).toBeInstanceOf(HTMLDivElement)
  })

  it('验证画布div结构', () => {
    const wrapper = mount(MindMap)
    const diagramDiv = wrapper.find('div[ref="diagramDiv"]')
    
    // 验证画布div存在
    expect(diagramDiv.exists()).toBe(true)
    
    // 验证画布样式
    expect(diagramDiv.attributes('style')).toContain('width:100%')
    expect(diagramDiv.attributes('style')).toContain('height:100%')
    expect(diagramDiv.attributes('style')).toContain('background-color: white')
  })

  it('渲染保存按钮DOM结构', () => {
    const { getByText } = render(MindMap)
    const button = getByText('保存')
    
    // 验证按钮存在和基础样式
    expect(button).toBeInTheDocument()
    expect(button).toHaveStyle('background-color: #00a1ff')
    expect(button).toHaveStyle('color: white')
    expect(button).toHaveStyle('border: none')
    expect(button).toHaveStyle('border-radius: 6px')
    
    // 验证按钮位置
    expect(button).toHaveStyle('position: fixed')
    expect(button).toHaveStyle('bottom: 30px')
    expect(button).toHaveStyle('left: 30px')
    expect(button).toHaveStyle('z-index: 1000')
  })

  it('测试保存按钮点击', async () => {
    const wrapper = mount(MindMap)
    vi.mocked(axios.post).mockResolvedValue({ data: { message: '保存成功' } })
    
    // 点击保存按钮
    await wrapper.find('.save-button').trigger('click')
    
    // 验证axios被调用
    expect(axios.post).toHaveBeenCalled()
    
    // 验证alert显示
    expect(window.alert).toHaveBeenCalledWith('保存成功')
  })

  it('测试保存失败情况', async () => {
    const wrapper = mount(MindMap)
    vi.mocked(axios.post).mockRejectedValue(new Error('保存失败'))
    
    // 点击保存按钮
    await wrapper.find('.save-button').trigger('click')
    
    // 验证alert显示错误
    expect(window.alert).toHaveBeenCalledWith('保存失败')
  })
})
