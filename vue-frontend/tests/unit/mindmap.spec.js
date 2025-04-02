import { mount } from '@vue/test-utils'
import MindMap from '@/components/MindMap.vue'
import axios from 'axios'

jest.mock('axios')

describe('MindMap.vue', () => {
  beforeAll(() => {
    window.alert = jest.fn()
  })

  it('测试保存按钮点击', async () => {
    const wrapper = mount(MindMap)
    axios.post.mockResolvedValue({ data: { message: '保存成功' } })
    
    // 点击保存按钮
    await wrapper.find('.save-button').trigger('click')
    
    // 验证axios被调用
    expect(axios.post).toHaveBeenCalled()
    
    // 验证alert显示
    expect(window.alert).toHaveBeenCalledWith('保存成功')
  })

  it('测试保存失败情况', async () => {
    const wrapper = mount(MindMap)
    axios.post.mockRejectedValue(new Error('保存失败'))
    
    // 点击保存按钮
    await wrapper.find('.save-button').trigger('click')
    
    // 验证alert显示错误
    expect(window.alert).toHaveBeenCalledWith('保存失败')
  })
})
