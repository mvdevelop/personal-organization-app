import { renderHook } from '@testing-library/react'
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts'

function dispatchShortcut(key: string, options: Partial<KeyboardEventInit> = {}) {
  window.dispatchEvent(new KeyboardEvent('keydown', { key, ctrlKey: true, ...options }))
}

describe('useKeyboardShortcuts', () => {
  it('executes matching shortcuts', () => {
    const callback = vi.fn()
    renderHook(() => useKeyboardShortcuts([
      { key: 'k', ctrlOrCmd: true, callback, description: 'Quick command' },
    ]))

    dispatchShortcut('k')
    expect(callback).toHaveBeenCalledOnce()
  })

  it('ignores shortcuts while typing in editable elements', () => {
    const callback = vi.fn()
    renderHook(() => useKeyboardShortcuts([
      { key: 'k', ctrlOrCmd: true, callback, description: 'Quick command' },
    ]))
    const input = document.createElement('input')
    document.body.appendChild(input)
    input.focus()
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }))

    expect(callback).not.toHaveBeenCalled()
    input.remove()
  })
})
