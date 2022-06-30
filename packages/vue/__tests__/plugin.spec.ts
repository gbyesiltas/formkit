import { FormKitNode, getNode } from '@formkit/core'
import { token } from '@formkit/utils'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { defaultConfig, FormKit, plugin } from '../src'

describe('plugins', () => {
  it('can define props in a standard plugin', () => {
    const customPlugin = (node: FormKitNode) => {
      node.addProps(['fooBar'])
      expect(node.props.fooBar).toBe('123')
    }
    const wrapper = mount(FormKit, {
      props: {
        type: 'text',
        'foo-bar': '123',
        plugins: [customPlugin],
      },
      global: {
        plugins: [[plugin, defaultConfig]],
      },
    })
    expect(wrapper.find('[foo-bar]').exists()).toBe(false)
  })

  it('can add props after the node as already been created', async () => {
    const id = token()
    const customPlugin = (node: FormKitNode) => {
      node.addProps(['fooBar'])
      expect(node.props.fooBar).toBe('123')
    }
    const wrapper = mount(FormKit, {
      props: {
        type: 'text',
        id,
        'foo-bar': '123',
      },
      global: {
        plugins: [[plugin, defaultConfig]],
      },
    })
    expect(wrapper.find('[foo-bar]').exists()).toBe(true)
    getNode(id)?.use(customPlugin)
    await nextTick()
    expect(wrapper.find('[foo-bar]').exists()).toBe(false)
  })

  it('can directly modify node.prop.attrs via hooks and props', async () => {
    const id = token()
    const changeAttrs = (node: FormKitNode) => {
      node.hook.prop(({ prop, value }, next) => {
        if (prop === 'placeholder') {
          value = 'should be this'
        }
        return next({ prop, value })
      })
      node.props.placeholder = node.props.placeholder
      node.props.label = 'this label'
    }
    const wrapper = mount(FormKit, {
      props: {
        placeholder: 'should not be this',
        type: 'select',
        label: 'not this label',
        options: ['a', 'b'],
        id,
        plugins: [changeAttrs],
      },
      global: {
        plugins: [[plugin, defaultConfig]],
      },
    })
    await nextTick()
    expect(getNode(id)!.props.placeholder).toBe('should be this')
    expect(wrapper.find('option[data-is-placeholder]').text()).toBe(
      'should be this'
    )
    expect(wrapper.find('label').text()).toBe('this label')
  })
})