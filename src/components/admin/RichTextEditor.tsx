import Blockquote from '@tiptap/extension-blockquote'
import CodeBlock from '@tiptap/extension-code-block'
import Color from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import HorizontalRule from '@tiptap/extension-horizontal-rule'
import TiptapImage from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import TaskItem from '@tiptap/extension-task-item'
import TaskList from '@tiptap/extension-task-list'
import TextAlign from '@tiptap/extension-text-align'
import { TextStyle } from '@tiptap/extension-text-style'
import Underline from '@tiptap/extension-underline'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import React, { useEffect, useRef, useState } from 'react'
import { MediaModal } from './MediaModal'
import { convertPayloadToTiptap } from './rte/converters/payloadToTiptap'
import { convertTiptapToPayload } from './rte/converters/tiptapToPayload'

// Create a custom image extension to store media ID and optional link
const Image = TiptapImage.extend({
  selectable: true,
  draggable: true,
  addAttributes() {
    return {
      ...((TiptapImage as any).config?.addAttributes?.call(this) || {}),
      'data-id': {
        default: null,
      },
      href: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute('href'),
      },
      target: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute('target'),
      },
    }
  },
  renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, unknown> }) {
    const { href, target, ...rest } = HTMLAttributes as Record<string, any>
    if (href) {
      return ['a', { href, target: target || '_blank' }, ['img', rest]]
    }
    return ['img', rest]
  },
})

interface RichTextEditorProps {
  value: any
  onChange: (value: any) => void
  placeholder?: string
  readOnly?: boolean
}

// Detect content format
const detectContentFormat = (value: any): 'html' | 'tiptap' | 'lexical' | 'unknown' => {
  if (!value) return 'unknown'

  if (typeof value === 'string') {
    if (value.includes('<') && value.includes('>')) {
      return 'html'
    }
    return 'unknown'
  }

  // Legacy Payload richText (Lexical) often stored as an object with a `root` node
  if (value && typeof value === 'object' && value.root && value.root.type === 'root') {
    return 'lexical'
  }

  if (Array.isArray(value)) {
    // Older Payload richText array form
    if (value.some((node: any) => node.type === 'paragraph' && node.children)) {
      return 'lexical'
    }
    return 'unknown'
  }

  if (value.type === 'doc' && Array.isArray(value.content)) {
    // TipTap JSON format
    if (
      value.content.some(
        (node: any) =>
          node.type === 'paragraph' || node.type === 'heading' || node.type === 'bulletList',
      )
    ) {
      return 'tiptap'
    }
  }

  return 'unknown'
}

// Process inline elements (spans, strong, em, etc.)
const processInlineElements = (element: Element): any[] => {
  const content: any[] = []

  Array.from(element.childNodes).forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim()
      if (text) {
        content.push({ type: 'text', text })
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const childElement = node as Element
      const tagName = childElement.tagName.toLowerCase()
      const childContent = processInlineElements(childElement)

      if (childContent.length > 0) {
        const marks: any[] = []

        // Apply text formatting
        if (tagName === 'strong' || tagName === 'b') {
          marks.push({ type: 'bold' })
        }
        if (tagName === 'em' || tagName === 'i') {
          marks.push({ type: 'italic' })
        }
        if (tagName === 'u') {
          marks.push({ type: 'underline' })
        }
        if (tagName === 's' || tagName === 'strike') {
          marks.push({ type: 'strike' })
        }
        if (tagName === 'code') {
          marks.push({ type: 'code' })
        }
        if (tagName === 'a') {
          const href = childElement.getAttribute('href')
          if (href) {
            marks.push({ type: 'link', attrs: { href } })
          }
        }

        // Apply marks to all text nodes
        childContent.forEach((item) => {
          if (item.type === 'text' && marks.length > 0) {
            item.marks = marks
          }
        })

        content.push(...childContent)
      }
    }
  })

  return content
}

// Process list items
const processListItems = (listElement: Element, listType: string): any[] => {
  const content: any[] = []

  Array.from(listElement.children).forEach((item) => {
    if (item.tagName.toLowerCase() === 'li') {
      const itemContent = processInlineElements(item)
      if (itemContent.length > 0) {
        content.push({
          type: listType === 'bulletList' ? 'listItem' : 'listItem',
          content: [
            {
              type: 'paragraph',
              content: itemContent,
            },
          ],
        })
      } else {
        content.push({
          type: listType === 'bulletList' ? 'listItem' : 'listItem',
          content: [
            {
              type: 'paragraph',
            },
          ],
        })
      }
    }
  })

  return content
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder,
  readOnly,
}) => {
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false)
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [linkTarget, setLinkTarget] = useState('_blank')
  const isInternallyUpdating = useRef(false)
  const contentFormat = detectContentFormat(value)
  const formatLabel = contentFormat === 'html' ? 'HTML Import' : 'Corrected Format'

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline',
        },
        validate: (href) => /^https?:\/\//.test(href),
        protocols: ['http', 'https', 'mailto', 'tel'],
        autolink: true,
        linkOnPaste: true,
        defaultProtocol: 'https',
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto',
        },
      }),
      TextAlign.configure({
        types: ['paragraph'],
        alignments: ['left', 'center', 'right'],
        defaultAlignment: 'left',
      }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      Placeholder.configure({
        placeholder,
      }),
      CodeBlock.configure({
        HTMLAttributes: {
          class: 'bg-gray-100 p-4 rounded font-mono text-sm',
        },
      }),
      Blockquote.configure({
        HTMLAttributes: {
          class: 'border-l-4 border-gray-300 pl-4 italic',
        },
      }),
      HorizontalRule.configure({
        HTMLAttributes: {
          class: 'border-t border-gray-300 my-4',
        },
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
    ],
    content: convertPayloadToTiptap(value),
    editable: !readOnly,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      isInternallyUpdating.current = true
      const json = editor.getJSON()
      const payloadFormat = convertTiptapToPayload(json)
      onChange(payloadFormat)
    },
  })

  useEffect(() => {
    if (isInternallyUpdating.current) {
      isInternallyUpdating.current = false
      return
    }

    if (editor) {
      const tiptapContent = convertPayloadToTiptap(value)
      if (JSON.stringify(tiptapContent) !== JSON.stringify(editor.getJSON())) {
        editor.commands.setContent(tiptapContent, { emitUpdate: false })
      }
    }
  }, [editor, value])

  const handleImageSelection = (media: { id: string | number; url: string; filename?: string }) => {
    if (media.url) {
      const resolvedId = media.id === undefined || media.id === null ? null : String(media.id)

      editor
        ?.chain()
        .focus()
        .setImage({
          src: media.url,
          alt: media.filename || '',
          'data-id': resolvedId,
        } as any)
        .createParagraphNear()
        .run()
    }
    setIsMediaModalOpen(false)
  }

  const handleLinkSubmit = () => {
    const url = linkUrl.trim()
    if (editor?.isActive('image')) {
      if (url) {
        editor.chain().focus().updateAttributes('image', { href: url, target: linkTarget }).run()
      } else {
        editor.chain().focus().updateAttributes('image', { href: null, target: null }).run()
      }
    } else if (url) {
      if (editor?.state.selection.empty) {
        const linkText = url.replace(/^https?:\/\//, '').replace(/^www\./, '')
        const linkContent = {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: linkText,
                  marks: [
                    {
                      type: 'link',
                      attrs: {
                        href: url,
                        target: linkTarget,
                      },
                    },
                  ],
                },
              ],
            },
          ],
        }
        editor?.chain().focus().insertContent(linkContent).run()
      } else {
        editor?.chain().focus().setLink({ href: url, target: linkTarget }).run()
      }
    }
    setIsLinkModalOpen(false)
    setLinkUrl('')
  }

  const handleRemoveLink = () => {
    if (editor?.isActive('image')) {
      editor.chain().focus().updateAttributes('image', { href: null, target: null }).run()
    } else {
      editor?.chain().focus().unsetLink().run()
    }
  }

  const openLinkModal = () => {
    if (editor?.isActive('image')) {
      const imgAttrs = editor.getAttributes('image') as any
      setLinkUrl(imgAttrs?.href || '')
      setLinkTarget(imgAttrs?.target || '_blank')
    } else {
      const { from, to } = editor?.state.selection || {}
      if (from !== to) {
        const linkMark = editor?.getAttributes('link')
        if (linkMark?.href) {
          setLinkUrl(linkMark.href)
          setLinkTarget(linkMark.target || '_blank')
        } else {
          setLinkUrl('')
          setLinkTarget('_blank')
        }
      } else {
        setLinkUrl('')
        setLinkTarget('_blank')
      }
    }
    setIsLinkModalOpen(true)
  }

  if (!editor) {
    return (
      <div
        style={{
          width: '100%',
          padding: '12px',
          border: '1px solid #d1d5db',
          borderRadius: '8px',
          fontSize: '14px',
          backgroundColor: '#f9fafb',
          color: '#6b7280',
        }}
      >
        Loading Tiptap editor...
      </div>
    )
  }

  return (
    <div style={{ width: '100%' }}>
      {!readOnly && (
        <div
          style={{
            border: '1px solid #d1d5db',
            borderBottom: 'none',
            borderTopLeftRadius: '8px',
            borderTopRightRadius: '8px',
            padding: '12px',
            backgroundColor: '#f8fafc',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            alignItems: 'center',
          }}
        >
          {/* Format Indicator */}
          <div
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '500',
              backgroundColor: contentFormat === 'html' ? '#fef3c7' : '#dbeafe',
              color: contentFormat === 'html' ? '#92400e' : '#1e40af',
              border: '1px solid',
              borderColor: contentFormat === 'html' ? '#f59e0b' : '#3b82f6',
              cursor: 'help',
              userSelect: 'none',
            }}
            title={`Content format: ${formatLabel}. ${
              contentFormat === 'html'
                ? 'This content was imported from the old platform and will be converted to TipTap format when edited.'
                : 'This content is in the current format and can be edited normally.'
            }`}
          >
            {formatLabel}
          </div>

          <button
            onClick={() => editor?.chain().focus().toggleBold().run()}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '500',
              backgroundColor: editor?.isActive('bold') ? '#3b82f6' : '#ffffff',
              color: editor?.isActive('bold') ? '#ffffff' : '#374151',
              border: '1px solid #d1d5db',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (!editor?.isActive('bold')) {
                e.currentTarget.style.backgroundColor = '#f3f4f6'
                e.currentTarget.style.borderColor = '#9ca3af'
              }
            }}
            onMouseLeave={(e) => {
              if (!editor?.isActive('bold')) {
                e.currentTarget.style.backgroundColor = '#ffffff'
                e.currentTarget.style.borderColor = '#d1d5db'
              }
            }}
            type="button"
          >
            Bold
          </button>
          <button
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '500',
              backgroundColor: editor?.isActive('italic') ? '#3b82f6' : '#ffffff',
              color: editor?.isActive('italic') ? '#ffffff' : '#374151',
              border: '1px solid #d1d5db',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (!editor?.isActive('italic')) {
                e.currentTarget.style.backgroundColor = '#f3f4f6'
                e.currentTarget.style.borderColor = '#9ca3af'
              }
            }}
            onMouseLeave={(e) => {
              if (!editor?.isActive('italic')) {
                e.currentTarget.style.backgroundColor = '#ffffff'
                e.currentTarget.style.borderColor = '#d1d5db'
              }
            }}
            type="button"
          >
            Italic
          </button>
          <button
            onClick={() => editor?.chain().focus().toggleUnderline().run()}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '500',
              backgroundColor: editor?.isActive('underline') ? '#3b82f6' : '#ffffff',
              color: editor?.isActive('underline') ? '#ffffff' : '#374151',
              border: '1px solid #d1d5db',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (!editor?.isActive('underline')) {
                e.currentTarget.style.backgroundColor = '#f3f4f6'
                e.currentTarget.style.borderColor = '#9ca3af'
              }
            }}
            onMouseLeave={(e) => {
              if (!editor?.isActive('underline')) {
                e.currentTarget.style.backgroundColor = '#ffffff'
                e.currentTarget.style.borderColor = '#d1d5db'
              }
            }}
            type="button"
          >
            Underline
          </button>
          <button
            onClick={openLinkModal}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '500',
              backgroundColor: editor?.isActive('link') ? '#3b82f6' : '#ffffff',
              color: editor?.isActive('link') ? '#ffffff' : '#374151',
              border: '1px solid #d1d5db',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (!editor?.isActive('link')) {
                e.currentTarget.style.backgroundColor = '#f3f4f6'
                e.currentTarget.style.borderColor = '#9ca3af'
              }
            }}
            onMouseLeave={(e) => {
              if (!editor?.isActive('link')) {
                e.currentTarget.style.backgroundColor = '#ffffff'
                e.currentTarget.style.borderColor = '#d1d5db'
              }
            }}
            type="button"
          >
            Link
          </button>
          {editor?.isActive('link') && (
            <button
              onClick={handleRemoveLink}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '500',
                backgroundColor: '#ef4444',
                color: '#ffffff',
                border: '1px solid #dc2626',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#dc2626'
                e.currentTarget.style.borderColor = '#b91c1c'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ef4444'
                e.currentTarget.style.borderColor = '#dc2626'
              }}
              type="button"
            >
              Remove Link
            </button>
          )}
          <button
            onClick={() => setIsMediaModalOpen(true)}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '500',
              backgroundColor: editor?.isActive('image') ? '#3b82f6' : '#ffffff',
              color: editor?.isActive('image') ? '#ffffff' : '#374151',
              border: '1px solid #d1d5db',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (!editor?.isActive('image')) {
                e.currentTarget.style.backgroundColor = '#f3f4f6'
                e.currentTarget.style.borderColor = '#9ca3af'
              }
            }}
            onMouseLeave={(e) => {
              if (!editor?.isActive('image')) {
                e.currentTarget.style.backgroundColor = '#ffffff'
                e.currentTarget.style.borderColor = '#d1d5db'
              }
            }}
            type="button"
          >
            Image
          </button>

          <button
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '500',
              backgroundColor: editor?.isActive('bulletList') ? '#3b82f6' : '#ffffff',
              color: editor?.isActive('bulletList') ? '#ffffff' : '#374151',
              border: '1px solid #d1d5db',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (!editor?.isActive('bulletList')) {
                e.currentTarget.style.backgroundColor = '#f3f4f6'
                e.currentTarget.style.borderColor = '#9ca3af'
              }
            }}
            onMouseLeave={(e) => {
              if (!editor?.isActive('bulletList')) {
                e.currentTarget.style.backgroundColor = '#ffffff'
                e.currentTarget.style.borderColor = '#d1d5db'
              }
            }}
            type="button"
          >
            List
          </button>
          <button
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '500',
              backgroundColor: editor?.isActive('orderedList') ? '#3b82f6' : '#ffffff',
              color: editor?.isActive('orderedList') ? '#ffffff' : '#374151',
              border: '1px solid #d1d5db',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (!editor?.isActive('orderedList')) {
                e.currentTarget.style.backgroundColor = '#f3f4f6'
                e.currentTarget.style.borderColor = '#9ca3af'
              }
            }}
            onMouseLeave={(e) => {
              if (!editor?.isActive('orderedList')) {
                e.currentTarget.style.backgroundColor = '#ffffff'
                e.currentTarget.style.borderColor = '#d1d5db'
              }
            }}
            type="button"
          >
            Ordered
          </button>
          <button
            onClick={() => editor?.chain().focus().toggleBlockquote().run()}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '500',
              backgroundColor: editor?.isActive('blockquote') ? '#3b82f6' : '#ffffff',
              color: editor?.isActive('blockquote') ? '#ffffff' : '#374151',
              border: '1px solid #d1d5db',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (!editor?.isActive('blockquote')) {
                e.currentTarget.style.backgroundColor = '#f3f4f6'
                e.currentTarget.style.borderColor = '#9ca3af'
              }
            }}
            onMouseLeave={(e) => {
              if (!editor?.isActive('blockquote')) {
                e.currentTarget.style.backgroundColor = '#ffffff'
                e.currentTarget.style.borderColor = '#d1d5db'
              }
            }}
            type="button"
          >
            Quote
          </button>

          <button
            onClick={() => editor?.chain().focus().setHorizontalRule().run()}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '500',
              backgroundColor: '#ffffff',
              color: '#374151',
              border: '1px solid #d1d5db',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6'
              e.currentTarget.style.borderColor = '#9ca3af'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#ffffff'
              e.currentTarget.style.borderColor = '#d1d5db'
            }}
            type="button"
          >
            HR
          </button>
          <button
            onClick={() => editor?.chain().focus().setTextAlign('left').run()}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '500',
              backgroundColor: '#ffffff',
              color: '#374151',
              border: '1px solid #d1d5db',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6'
              e.currentTarget.style.borderColor = '#9ca3af'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#ffffff'
              e.currentTarget.style.borderColor = '#d1d5db'
            }}
            type="button"
          >
            Left
          </button>
          <button
            onClick={() => editor?.chain().focus().setTextAlign('center').run()}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '500',
              backgroundColor: '#ffffff',
              color: '#374151',
              border: '1px solid #d1d5db',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6'
              e.currentTarget.style.borderColor = '#9ca3af'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#ffffff'
              e.currentTarget.style.borderColor = '#d1d5db'
            }}
            type="button"
          >
            Center
          </button>
          <button
            onClick={() => editor?.chain().focus().setTextAlign('right').run()}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '500',
              backgroundColor: '#ffffff',
              color: '#374151',
              border: '1px solid #d1d5db',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6'
              e.currentTarget.style.borderColor = '#9ca3af'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#ffffff'
              e.currentTarget.style.borderColor = '#d1d5db'
            }}
            type="button"
          >
            Right
          </button>
        </div>
      )}
      {isMediaModalOpen && (
        <MediaModal onClose={() => setIsMediaModalOpen(false)} onSelect={handleImageSelection} />
      )}
      {isLinkModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setIsLinkModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              padding: '24px',
              borderRadius: '8px',
              boxShadow:
                '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              minWidth: '400px',
              maxWidth: '500px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{
                margin: '0 0 16px 0',
                fontSize: '18px',
                fontWeight: '600',
                color: '#111827',
              }}
            >
              {editor?.state.selection.empty ? 'Insert Link' : 'Edit Link'}
            </h3>
            <div style={{ marginBottom: '16px' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                }}
              >
                URL
              </label>
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  outline: 'none',
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleLinkSubmit()
                  } else if (e.key === 'Escape') {
                    setIsLinkModalOpen(false)
                  }
                }}
                autoFocus
              />
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setIsLinkModalOpen(false)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  backgroundColor: '#ffffff',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f3f4f6'
                  e.currentTarget.style.borderColor = '#9ca3af'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffffff'
                  e.currentTarget.style.borderColor = '#d1d5db'
                }}
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={handleLinkSubmit}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  backgroundColor: '#3b82f6',
                  color: '#ffffff',
                  border: '1px solid #2563eb',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#2563eb'
                  e.currentTarget.style.borderColor = '#1d4ed8'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#3b82f6'
                  e.currentTarget.style.borderColor = '#2563eb'
                }}
                type="button"
              >
                {editor?.state.selection.empty ? 'Insert' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      )}
      <div
        style={{
          border: '1px solid #d1d5db',
          borderTopLeftRadius: readOnly ? '8px' : '0',
          borderTopRightRadius: readOnly ? '8px' : '0',
          borderBottomLeftRadius: '8px',
          borderBottomRightRadius: '8px',
          padding: '16px',
          minHeight: '200px',
          outline: 'none',
          transition: 'all 0.2s ease',
          backgroundColor: readOnly ? '#f9fafb' : '#ffffff',
        }}
      >
        <EditorContent
          editor={editor}
          style={{
            width: '100%',
            height: '100%',
          }}
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `
            .ProseMirror {
              outline: none !important;
              border: none !important;
              background: transparent !important;
              font-family: inherit !important;
              font-size: 14px !important;
              line-height: 1.6 !important;
              color: #000000 !important;
              min-height: 150px !important;
              padding: 0 !important;
              margin: 0 !important;
              box-shadow: none !important;
            }
            .ProseMirror * {
              color: #000000 !important;
            }
            .ProseMirror p {
              margin: 0 0 1em 0 !important;
              color: #000000 !important;
            }
            .ProseMirror p:last-child {
              margin-bottom: 0 !important;
              color: #000000 !important;
            }
            .ProseMirror h1 {
              font-size: 1.875rem !important;
              font-weight: 700 !important;
              margin: 0 0 0.5em 0 !important;
              color: #000000 !important;
            }
            .ProseMirror h2 {
              font-size: 1.5rem !important;
              font-weight: 600 !important;
              margin: 0 0 0.5em 0 !important;
              color: #000000 !important;
            }
            .ProseMirror ul,
            .ProseMirror ol {
              margin: 0 0 1em 0 !important;
              padding-left: 2em !important;
              color: #000000 !important;
            }
            .ProseMirror ul {
              list-style-type: disc !important;
              color: #000000 !important;
            }
            .ProseMirror ol {
              list-style-type: decimal !important;
              color: #000000 !important;
            }
            .ProseMirror li {
              margin: 0.25em 0 !important;
              color: #000000 !important;
            }
            .ProseMirror blockquote {
              border-left: 4px solid #d1d5db !important;
              padding-left: 1rem !important;
              margin: 0 0 1em 0 !important;
              font-style: italic !important;
              color: #000000 !important;
            }
            .ProseMirror code {
              background-color: #f3f4f6 !important;
              padding: 0.125rem 0.25rem !important;
              border-radius: 0.25rem !important;
              font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace !important;
              font-size: 0.875rem !important;
              color: #000000 !important;
            }
            .ProseMirror pre {
              background-color: #f3f4f6 !important;
              padding: 1rem !important;
              border-radius: 0.5rem !important;
              overflow-x: auto !important;
              margin: 0 0 1em 0 !important;
              color: #000000 !important;
            }
            .ProseMirror pre code {
              background: none !important;
              padding: 0 !important;
            }
            .ProseMirror hr {
              border: none !important;
              border-top: 1px solid #d1d5db !important;
              margin: 1em 0 !important;
            }
            .ProseMirror a {
              color: #2563eb !important;
              text-decoration: underline !important;
              text-decoration-color: #93c5fd !important;
              text-underline-offset: 2px !important;
            }
            .ProseMirror a:hover {
              color: #1d4ed8 !important;
              text-decoration-color: #60a5fa !important;
            }
            .ProseMirror img {
              cursor: pointer !important;
            }
            .ProseMirror-selectednode {
              outline: 2px solid #3b82f6 !important;
              outline-offset: 2px !important;
              border-radius: 4px !important;
            }
            
            /* Force all text to be black with maximum specificity */
            .ProseMirror,
            .ProseMirror *,
            .ProseMirror p,
            .ProseMirror div,
            .ProseMirror span,
            .ProseMirror li,
            .ProseMirror h1,
            .ProseMirror h2,
            .ProseMirror h3,
            .ProseMirror h4,
            .ProseMirror h5,
            .ProseMirror h6 {
              color: #000000 !important;
            }
          `,
          }}
        />
      </div>
    </div>
  )
}
