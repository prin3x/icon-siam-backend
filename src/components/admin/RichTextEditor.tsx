import React from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import { TextStyle } from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import Placeholder from '@tiptap/extension-placeholder'
import CodeBlock from '@tiptap/extension-code-block'
import Blockquote from '@tiptap/extension-blockquote'
import HorizontalRule from '@tiptap/extension-horizontal-rule'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'

interface RichTextEditorProps {
  value: any
  onChange: (value: any) => void
  placeholder?: string
  readOnly?: boolean
}

// Convert PayloadCMS rich text format to Tiptap JSON
const convertPayloadToTiptap = (payloadValue: any): any => {
  if (!payloadValue) return { type: 'doc', content: [{ type: 'paragraph', content: [] }] }

  if (typeof payloadValue === 'string') {
    return {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: payloadValue }],
        },
      ],
    }
  }

  if (Array.isArray(payloadValue)) {
    return {
      type: 'doc',
      content: payloadValue.map((node: any) => {
        if (node.type === 'paragraph' && node.children) {
          return {
            type: 'paragraph',
            content: node.children.map((child: any) => ({
              type: 'text',
              text: child.text || '',
              marks: child.bold
                ? [{ type: 'bold' }]
                : child.italic
                  ? [{ type: 'italic' }]
                  : child.underline
                    ? [{ type: 'underline' }]
                    : [],
            })),
          }
        }
        return { type: 'paragraph', content: [{ type: 'text', text: node.text || '' }] }
      }),
    }
  }

  // If it's already in Tiptap format, return as is
  if (payloadValue.type === 'doc') {
    return payloadValue
  }

  return { type: 'doc', content: [{ type: 'paragraph', content: [] }] }
}

// Convert Tiptap JSON to PayloadCMS format
const convertTiptapToPayload = (tiptapValue: any): any => {
  if (!tiptapValue || !tiptapValue.content) return []

  return tiptapValue.content.map((node: any) => {
    if (node.type === 'paragraph') {
      return {
        type: 'paragraph',
        children:
          node.content?.map((child: any) => ({
            text: child.text || '',
            bold: child.marks?.some((mark: any) => mark.type === 'bold'),
            italic: child.marks?.some((mark: any) => mark.type === 'italic'),
            underline: child.marks?.some((mark: any) => mark.type === 'underline'),
          })) || [],
      }
    }
    return { type: 'paragraph', children: [{ text: '' }] }
  })
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Enter content...',
  readOnly = false,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
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
      const json = editor.getJSON()
      const payloadFormat = convertTiptapToPayload(json)
      onChange(payloadFormat)
    },
  })

  React.useEffect(() => {
    if (editor && value !== undefined) {
      const tiptapContent = convertPayloadToTiptap(value)
      editor.commands.setContent(tiptapContent)
    }
  }, [editor, value])

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
          }}
        >
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
            onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '500',
              backgroundColor: editor?.isActive('heading', { level: 1 }) ? '#3b82f6' : '#ffffff',
              color: editor?.isActive('heading', { level: 1 }) ? '#ffffff' : '#374151',
              border: '1px solid #d1d5db',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (!editor?.isActive('heading', { level: 1 })) {
                e.currentTarget.style.backgroundColor = '#f3f4f6'
                e.currentTarget.style.borderColor = '#9ca3af'
              }
            }}
            onMouseLeave={(e) => {
              if (!editor?.isActive('heading', { level: 1 })) {
                e.currentTarget.style.backgroundColor = '#ffffff'
                e.currentTarget.style.borderColor = '#d1d5db'
              }
            }}
            type="button"
          >
            H1
          </button>
          <button
            onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '500',
              backgroundColor: editor?.isActive('heading', { level: 2 }) ? '#3b82f6' : '#ffffff',
              color: editor?.isActive('heading', { level: 2 }) ? '#ffffff' : '#374151',
              border: '1px solid #d1d5db',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (!editor?.isActive('heading', { level: 2 })) {
                e.currentTarget.style.backgroundColor = '#f3f4f6'
                e.currentTarget.style.borderColor = '#9ca3af'
              }
            }}
            onMouseLeave={(e) => {
              if (!editor?.isActive('heading', { level: 2 })) {
                e.currentTarget.style.backgroundColor = '#ffffff'
                e.currentTarget.style.borderColor = '#d1d5db'
              }
            }}
            type="button"
          >
            H2
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
            onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '500',
              backgroundColor: editor?.isActive('codeBlock') ? '#3b82f6' : '#ffffff',
              color: editor?.isActive('codeBlock') ? '#ffffff' : '#374151',
              border: '1px solid #d1d5db',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (!editor?.isActive('codeBlock')) {
                e.currentTarget.style.backgroundColor = '#f3f4f6'
                e.currentTarget.style.borderColor = '#9ca3af'
              }
            }}
            onMouseLeave={(e) => {
              if (!editor?.isActive('codeBlock')) {
                e.currentTarget.style.backgroundColor = '#ffffff'
                e.currentTarget.style.borderColor = '#d1d5db'
              }
            }}
            type="button"
          >
            Code
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
              backgroundColor: editor?.isActive({ textAlign: 'left' }) ? '#3b82f6' : '#ffffff',
              color: editor?.isActive({ textAlign: 'left' }) ? '#ffffff' : '#374151',
              border: '1px solid #d1d5db',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (!editor?.isActive({ textAlign: 'left' })) {
                e.currentTarget.style.backgroundColor = '#f3f4f6'
                e.currentTarget.style.borderColor = '#9ca3af'
              }
            }}
            onMouseLeave={(e) => {
              if (!editor?.isActive({ textAlign: 'left' })) {
                e.currentTarget.style.backgroundColor = '#ffffff'
                e.currentTarget.style.borderColor = '#d1d5db'
              }
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
              backgroundColor: editor?.isActive({ textAlign: 'center' }) ? '#3b82f6' : '#ffffff',
              color: editor?.isActive({ textAlign: 'center' }) ? '#ffffff' : '#374151',
              border: '1px solid #d1d5db',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (!editor?.isActive({ textAlign: 'center' })) {
                e.currentTarget.style.backgroundColor = '#f3f4f6'
                e.currentTarget.style.borderColor = '#9ca3af'
              }
            }}
            onMouseLeave={(e) => {
              if (!editor?.isActive({ textAlign: 'center' })) {
                e.currentTarget.style.backgroundColor = '#ffffff'
                e.currentTarget.style.borderColor = '#d1d5db'
              }
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
              backgroundColor: editor?.isActive({ textAlign: 'right' }) ? '#3b82f6' : '#ffffff',
              color: editor?.isActive({ textAlign: 'right' }) ? '#ffffff' : '#374151',
              border: '1px solid #d1d5db',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (!editor?.isActive({ textAlign: 'right' })) {
                e.currentTarget.style.backgroundColor = '#f3f4f6'
                e.currentTarget.style.borderColor = '#9ca3af'
              }
            }}
            onMouseLeave={(e) => {
              if (!editor?.isActive({ textAlign: 'right' })) {
                e.currentTarget.style.backgroundColor = '#ffffff'
                e.currentTarget.style.borderColor = '#d1d5db'
              }
            }}
            type="button"
          >
            Right
          </button>
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
              color: #374151 !important;
              min-height: 150px !important;
              padding: 0 !important;
              margin: 0 !important;
              box-shadow: none !important;
            }
            .ProseMirror p {
              margin: 0 0 1em 0 !important;
            }
            .ProseMirror p:last-child {
              margin-bottom: 0 !important;
            }
            .ProseMirror h1 {
              font-size: 1.875rem !important;
              font-weight: 700 !important;
              margin: 0 0 0.5em 0 !important;
              color: #111827 !important;
            }
            .ProseMirror h2 {
              font-size: 1.5rem !important;
              font-weight: 600 !important;
              margin: 0 0 0.5em 0 !important;
              color: #111827 !important;
            }
            .ProseMirror ul, .ProseMirror ol {
              margin: 0 0 1em 0 !important;
              padding-left: 1.5em !important;
            }
            .ProseMirror li {
              margin: 0.25em 0 !important;
            }
            .ProseMirror blockquote {
              border-left: 4px solid #d1d5db !important;
              padding-left: 1rem !important;
              margin: 0 0 1em 0 !important;
              font-style: italic !important;
              color: #6b7280 !important;
            }
            .ProseMirror code {
              background-color: #f3f4f6 !important;
              padding: 0.125rem 0.25rem !important;
              border-radius: 0.25rem !important;
              font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace !important;
              font-size: 0.875rem !important;
            }
            .ProseMirror pre {
              background-color: #f3f4f6 !important;
              padding: 1rem !important;
              border-radius: 0.5rem !important;
              overflow-x: auto !important;
              margin: 0 0 1em 0 !important;
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
          `,
          }}
        />
      </div>
    </div>
  )
}
