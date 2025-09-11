import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'

const chainObj = {
  focus: vi.fn().mockReturnThis(),
  toggleBold: vi.fn().mockReturnThis(),
  toggleItalic: vi.fn().mockReturnThis(),
  toggleUnderline: vi.fn().mockReturnThis(),
  toggleBulletList: vi.fn().mockReturnThis(),
  toggleOrderedList: vi.fn().mockReturnThis(),
  toggleBlockquote: vi.fn().mockReturnThis(),
  setHorizontalRule: vi.fn().mockReturnThis(),
  setTextAlign: vi.fn().mockReturnThis(),
  setLink: vi.fn().mockReturnThis(),
  unsetLink: vi.fn().mockReturnThis(),
  insertContent: vi.fn().mockReturnThis(),
  setImage: vi.fn().mockReturnThis(),
  createParagraphNear: vi.fn().mockReturnThis(),
  run: vi.fn(),
}

const mockEditor: any = {
  chain: () => chainObj,
  commands: { setContent: vi.fn() },
  getJSON: vi.fn(() => ({ type: 'doc', content: [] })),
  isActive: vi.fn(() => false),
  getAttributes: vi.fn(() => ({})),
  state: { selection: { empty: true, from: 0, to: 0 } },
}

vi.mock('@tiptap/react', () => ({
  EditorContent: ({}) => <div data-testid="editor" />,
  useEditor: () => mockEditor,
}))

vi.mock('@/components/admin/MediaModal', () => ({
  MediaModal: ({ onSelect }: any) => {
    onSelect({ id: '7', url: '/img.png', filename: 'img.png' })
    return <div>media-modal</div>
  },
}))

import { RichTextEditor } from '@/components/admin/RichTextEditor'

describe('RichTextEditor', () => {
  beforeEach(() => {
    Object.values(chainObj).forEach((fn: any) => fn.mock && fn.mockClear && fn.mockClear())
    mockEditor.commands.setContent.mockClear()
  })

  it('triggers basic toolbar actions', () => {
    render(<RichTextEditor value={null} onChange={() => {}} />)

    fireEvent.click(screen.getAllByText('Bold')[0])
    expect(chainObj.toggleBold).toHaveBeenCalled()

    fireEvent.click(screen.getAllByText('Italic')[0])
    expect(chainObj.toggleItalic).toHaveBeenCalled()

    fireEvent.click(screen.getAllByText('Underline')[0])
    expect(chainObj.toggleUnderline).toHaveBeenCalled()

    fireEvent.click(screen.getAllByText('List')[0])
    expect(chainObj.toggleBulletList).toHaveBeenCalled()

    fireEvent.click(screen.getAllByText('Ordered')[0])
    expect(chainObj.toggleOrderedList).toHaveBeenCalled()

    fireEvent.click(screen.getAllByText('Quote')[0])
    expect(chainObj.toggleBlockquote).toHaveBeenCalled()

    fireEvent.click(screen.getAllByText('HR')[0])
    expect(chainObj.setHorizontalRule).toHaveBeenCalled()

    fireEvent.click(screen.getAllByText('Left')[0])
    expect(chainObj.setTextAlign).toHaveBeenCalledWith('left')
  })

  it('opens MediaModal and inserts image', () => {
    render(<RichTextEditor value={null} onChange={() => {}} />)
    fireEvent.click(screen.getAllByText('Image')[0])

    expect(chainObj.setImage).toHaveBeenCalledWith({
      src: '/img.png',
      alt: 'img.png',
      'data-id': '7',
    })
    expect(chainObj.createParagraphNear).toHaveBeenCalled()
    expect(chainObj.run).toHaveBeenCalled()
  })

  it('opens Link modal and inserts link when selection empty', () => {
    render(<RichTextEditor value={null} onChange={() => {}} />)

    fireEvent.click(screen.getAllByText('Link')[0])

    const input = screen.getByPlaceholderText('https://example.com')
    fireEvent.change(input, { target: { value: 'https://x.com' } })

    fireEvent.click(screen.getByRole('button', { name: /Insert|Update/ }))

    expect(chainObj.insertContent).toHaveBeenCalled()
    expect(chainObj.run).toHaveBeenCalled()
  })
})
