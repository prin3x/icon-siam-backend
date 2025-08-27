import React, { useState, useEffect, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import TiptapImage from '@tiptap/extension-image'
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
import { MediaModal } from './MediaModal'

/**
 * Enhanced RichTextEditor with HTML-to-TipTap Conversion
 *
 * This component solves the content migration challenge by:
 * 1. Detecting content format (HTML, TipTap, Lexical, or unknown)
 * 2. Converting HTML content from the old platform to TipTap format
 * 3. Maintaining compatibility with PayloadCMS collections
 * 4. Providing visual feedback about content format
 *
 * When editing HTML content:
 * - HTML is parsed and converted to TipTap JSON structure
 * - All formatting (bold, italic, lists, headings) is preserved
 * - Images are handled gracefully (with placeholders if no ID)
 * - Content is saved back in PayloadCMS-compatible format
 *
 * IMAGE HANDLING STRATEGY:
 * - Images with PayloadCMS media IDs are preserved as uploads
 * - Images from HTML conversion (without IDs) are converted to informative placeholders
 * - Placeholders show both alt text and source URL for easy identification
 * - Users can manually replace placeholders with proper media uploads or use URL upload
 * - URL upload allows direct pasting of image URLs for quick image replacement
 *
 * This allows seamless editing of legacy HTML content while maintaining
 * the modern TipTap editing experience.
 */

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

// Convert PayloadCMS rich text format (including legacy Lexical) to Tiptap JSON
const convertPayloadToTiptap = (payloadValue: any): any => {
  if (!payloadValue) return { type: 'doc', content: [] }

  // Handle HTML strings (from old platform data)
  if (typeof payloadValue === 'string') {
    // Check if it's HTML content
    if (payloadValue.includes('<') && payloadValue.includes('>')) {
      return convertHtmlToTiptap(payloadValue)
    }

    // Plain text fallback
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

  // Legacy Lexical object shape
  if (payloadValue && typeof payloadValue === 'object' && payloadValue.root) {
    return convertLexicalToTiptap(payloadValue)
  }

  if (Array.isArray(payloadValue)) {
    const content = payloadValue.map((node: any) => {
      if (node.type === 'upload' && node.value?.url) {
        return {
          type: 'image',
          attrs: {
            src: node.value.url,
            alt: node.value.filename,
            'data-id': node.value.id,
            ...(node.value.href ? { href: node.value.href } : {}),
            ...(node.value.target ? { target: node.value.target } : {}),
          },
        }
      }

      if (node.type === 'paragraph' && node.children) {
        // Handle payload's empty paragraph representation
        if (
          node.children.length === 1 &&
          node.children[0].text === '' &&
          Object.keys(node.children[0]).length === 1
        ) {
          return { type: 'paragraph' }
        }

        return {
          type: 'paragraph',
          content: node.children.map((child: any) => {
            const marks = []
            if (child.bold) marks.push({ type: 'bold' })
            if (child.italic) marks.push({ type: 'italic' })
            if (child.underline) marks.push({ type: 'underline' })
            if (child.strike) marks.push({ type: 'strike' })
            if (child.code) marks.push({ type: 'code' })
            if (child.link)
              marks.push({
                type: 'link',
                attrs: {
                  href: child.link.url,
                  target: child.link.target || '_blank',
                },
              })

            const tiptapChild: { type: string; text: string; marks?: any[] } = {
              type: 'text',
              text: child.text || '',
            }

            if (marks.length > 0) {
              tiptapChild.marks = marks
            }

            return tiptapChild
          }),
        }
      }
      // Fallback for any unknown node types
      return { type: 'paragraph' }
    })

    return { type: 'doc', content }
  }

  if (payloadValue.type === 'doc') {
    return payloadValue
  }

  return { type: 'doc', content: [] }
}

// Map Lexical textFormat bitmask to TipTap marks
const applyMarksFromLexicalFormat = (textNode: any): any => {
  const marks: any[] = []
  const format =
    typeof textNode.textFormat === 'number'
      ? textNode.textFormat
      : typeof textNode.format === 'number'
        ? textNode.format
        : 0
  // Lexical format bit flags
  const BOLD = 1
  const ITALIC = 2
  const STRIKETHROUGH = 4
  const UNDERLINE = 8
  const CODE = 16
  const SUBSCRIPT = 32
  const SUPERSCRIPT = 64
  const HIGHLIGHT = 128

  if (format & BOLD) marks.push({ type: 'bold' })
  if (format & ITALIC) marks.push({ type: 'italic' })
  if (format & UNDERLINE) marks.push({ type: 'underline' })
  if (format & STRIKETHROUGH) marks.push({ type: 'strike' })
  if (format & CODE) marks.push({ type: 'code' })
  // TipTap does not support sub/sup as marks by default; ignore or extend if needed
  if (format & HIGHLIGHT) marks.push({ type: 'highlight' })

  // Colors from Lexical inline style, e.g. "color: #ff0000" can be represented by TextStyle+Color extension
  if (typeof textNode.style === 'string' && /color:\s*#[0-9a-fA-F]{3,6}/.test(textNode.style)) {
    const match = textNode.style.match(/color:\s*(#[0-9a-fA-F]{3,6})/)
    if (match) {
      marks.push({ type: 'textStyle', attrs: { color: match[1] } })
    }
  }

  return marks
}

// Convert Lexical JSON to TipTap JSON
const convertLexicalToTiptap = (lexicalValue: any): any => {
  try {
    const root = lexicalValue.root
    if (!root || !Array.isArray(root.children)) return { type: 'doc', content: [] }

    const docContent: any[] = []

    const mapChildrenInline = (children: any[], linkHref?: string): any[] => {
      const inline: any[] = []
      children?.forEach((child) => {
        switch (child.type) {
          case 'text': {
            const node: any = { type: 'text', text: child.text || '' }
            const marks = applyMarksFromLexicalFormat(child)
            if (marks.length > 0) node.marks = marks
            // Link mark
            if (linkHref) {
              node.marks = [...(node.marks || []), { type: 'link', attrs: { href: linkHref } }]
            }
            inline.push(node)
            break
          }
          case 'linebreak': {
            inline.push({ type: 'hardBreak' })
            break
          }
          case 'link': {
            const href = child.url || child.fields?.url || ''
            inline.push(...mapChildrenInline(child.children || [], href))
            break
          }
          default: {
            // Recurse for unknown wrappers like span
            if (Array.isArray(child.children)) {
              inline.push(...mapChildrenInline(child.children, linkHref))
            }
            break
          }
        }
      })
      return inline
    }

    const normalizeAlign = (value: any): 'left' | 'right' | 'center' | undefined => {
      if (!value) return undefined
      if (value === 'start' || value === '') return 'left'
      if (value === 'end') return 'right'
      if (['left', 'right', 'center', 'justify'].includes(value)) {
        return value === 'justify' ? 'left' : (value as 'left' | 'right' | 'center')
      }
      return undefined
    }

    const toTiptapParagraph = (lexNode: any): any => {
      const content = mapChildrenInline(lexNode.children || [])
      const para: any = { type: 'paragraph' }
      if (content.length > 0) para.content = content
      // Alignment
      const align = normalizeAlign(lexNode.format)
      if (align) para.attrs = { textAlign: align }
      return para
    }

    const toTiptapHeading = (lexNode: any): any => {
      const tag = lexNode.tag || 'h1'
      const level = Number(tag.replace('h', '')) || 1
      const content = mapChildrenInline(lexNode.children || [])
      const heading: any = { type: 'heading', attrs: { level } }
      if (content.length > 0) heading.content = content
      const align = normalizeAlign(lexNode.format)
      if (align) heading.attrs.textAlign = align
      return heading
    }

    const toTiptapList = (lexNode: any): any => {
      const listType =
        lexNode.listType === 'number' || lexNode.tag === 'ol' ? 'orderedList' : 'bulletList'
      const items: any[] = []
      ;(lexNode.children || []).forEach((li: any) => {
        if (li.type === 'listitem' || li.type === 'listItem') {
          // Build paragraph content from direct inline children (text/link/linebreak)
          const inline = mapChildrenInline(li.children || [])
          const content: any[] = [
            inline.length > 0 ? { type: 'paragraph', content: inline } : { type: 'paragraph' },
          ]

          // Handle nested lists inside a list item
          ;(li.children || []).forEach((child: any) => {
            if (child.type === 'list') {
              const nested = toTiptapList(child)
              if (nested) content.push(nested)
            }
          })

          items.push({ type: 'listItem', content })
        }
      })
      return { type: listType, content: items }
    }

    root.children.forEach((node: any) => {
      switch (node.type) {
        case 'paragraph':
          docContent.push(toTiptapParagraph(node))
          break
        case 'heading':
          docContent.push(toTiptapHeading(node))
          break
        case 'list':
          docContent.push(toTiptapList(node))
          break
        case 'quote':
        case 'blockquote': {
          const content = mapChildrenInline(node.children || [])
          if (content.length > 0) {
            docContent.push({ type: 'blockquote', content: [{ type: 'paragraph', content }] })
          } else {
            docContent.push({ type: 'blockquote', content: [{ type: 'paragraph' }] })
          }
          break
        }
        default:
          // Try to unwrap unknown containers as paragraphs
          if (Array.isArray(node.children)) {
            const content = mapChildrenInline(node.children)
            if (content.length > 0) {
              docContent.push({ type: 'paragraph', content })
            }
          }
      }
    })

    if (docContent.length === 0) {
      docContent.push({ type: 'paragraph' })
    }

    return { type: 'doc', content: docContent }
  } catch (e) {
    console.warn('Error converting Lexical to Tiptap:', e)
    return { type: 'doc', content: [] }
  }
}

// Convert HTML to Tiptap JSON format
const convertHtmlToTiptap = (html: string): any => {
  try {
    // Handle edge cases
    if (!html || typeof html !== 'string') {
      return { type: 'doc', content: [] }
    }

    // Clean up common HTML issues
    const cleanHtml = html
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/<br\s*\/?>/gi, '<br>') // Normalize br tags
      .trim()

    // Create a temporary DOM element to parse HTML
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = cleanHtml

    const content: any[] = []

    // Process each child node
    Array.from(tempDiv.childNodes).forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent?.trim()
        if (text) {
          content.push({
            type: 'paragraph',
            content: [{ type: 'text', text }],
          })
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element
        const tagName = element.tagName.toLowerCase()

        switch (tagName) {
          case 'p':
            const paragraphContent = processInlineElements(element)
            if (paragraphContent.length > 0) {
              content.push({
                type: 'paragraph',
                content: paragraphContent,
              })
            } else {
              content.push({ type: 'paragraph' })
            }
            break

          case 'h1':
          case 'h2':
          case 'h3':
          case 'h4':
          case 'h5':
          case 'h6':
            const level = parseInt(tagName.charAt(1))
            const headingContent = processInlineElements(element)
            if (headingContent.length > 0) {
              content.push({
                type: 'heading',
                attrs: { level },
                content: headingContent,
              })
            }
            break

          case 'ul':
            const ulContent = processListItems(element, 'bulletList')
            if (ulContent.length > 0) {
              content.push({
                type: 'bulletList',
                content: ulContent,
              })
            }
            break

          case 'ol':
            const olContent = processListItems(element, 'orderedList')
            if (olContent.length > 0) {
              content.push({
                type: 'orderedList',
                content: olContent,
              })
            }
            break

          case 'blockquote':
            const quoteContent = processInlineElements(element)
            if (quoteContent.length > 0) {
              content.push({
                type: 'blockquote',
                content: quoteContent,
              })
            }
            break

          case 'hr':
            content.push({ type: 'horizontalRule' })
            break

          case 'img':
            const src = element.getAttribute('src')
            const alt = element.getAttribute('alt') || ''
            if (src) {
              content.push({
                type: 'image',
                attrs: {
                  src,
                  alt,
                  'data-id': null, // Will be handled in convertTiptapToPayload
                  'original-src': src, // Preserve original source for reference
                },
              })
            }
            break

          case 'br':
            // Handle line breaks by adding empty paragraph
            content.push({ type: 'paragraph' })
            break

          case 'div':
          case 'span':
            // Handle generic containers by processing their content
            const containerContent = processInlineElements(element)
            if (containerContent.length > 0) {
              content.push({
                type: 'paragraph',
                content: containerContent,
              })
            }
            break

          default:
            // For unknown tags, try to process as inline content
            const inlineContent = processInlineElements(element)
            if (inlineContent.length > 0) {
              content.push({
                type: 'paragraph',
                content: inlineContent,
              })
            }
        }
      }
    })

    // Ensure we always have at least one paragraph
    if (content.length === 0) {
      content.push({ type: 'paragraph' })
    }

    return { type: 'doc', content }
  } catch (error) {
    console.warn('Error converting HTML to Tiptap:', error)
    // Fallback to plain text
    return {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: html }],
        },
      ],
    }
  }
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

// Convert Tiptap JSON to PayloadCMS format
const convertTiptapToPayload = (tiptapValue: any): any => {
  if (!tiptapValue || !tiptapValue.content) return []

  return tiptapValue.content
    .map((node: any) => {
      if (node.type === 'image') {
        const id = node.attrs['data-id']
        const src = node.attrs.src
        const alt = node.attrs.alt || 'Image'
        const href = node.attrs.href
        const target = node.attrs.target || '_blank'

        if (id) {
          // Image already has a PayloadCMS media ID
          return {
            type: 'upload',
            value: {
              id,
              url: src,
              filename: alt,
              href: href || undefined,
              target: href ? target : undefined,
            },
            relationTo: 'media',
            children: [{ text: '' }],
          }
        } else if (src) {
          // Image from HTML conversion or URL upload - create informative placeholder
          // This helps users understand what the image was and where it came from
          // Users can manually replace these placeholders with proper media uploads or use URL upload
          if (href) {
            return {
              type: 'paragraph',
              children: [
                {
                  text: `[Image: ${alt}] - Source: ${src}] (link: ${href})`,
                },
              ],
            }
          }
          return {
            type: 'paragraph',
            children: [
              {
                text: `[Image: ${alt}] - Source: ${src}`,
              },
            ],
          }
        }

        // Fallback for images without src
        return {
          type: 'paragraph',
          children: [{ text: `[Image: ${alt || 'No alt text'}]` }],
        }
      }

      if (node.type === 'paragraph') {
        // Handle empty paragraphs from Tiptap
        if (!node.content) {
          return {
            type: 'paragraph',
            children: [{ text: '' }],
          }
        }

        return {
          type: 'paragraph',
          children:
            node.content?.map((child: any) => {
              const payloadChild: {
                text: string
                bold?: true
                italic?: true
                underline?: true
                strike?: true
                code?: true
                link?: {
                  url: string
                  target: string
                }
              } = {
                text: child.text || '',
              }

              if (child.marks?.some((mark: any) => mark.type === 'bold')) {
                payloadChild.bold = true
              }
              if (child.marks?.some((mark: any) => mark.type === 'italic')) {
                payloadChild.italic = true
              }
              if (child.marks?.some((mark: any) => mark.type === 'underline')) {
                payloadChild.underline = true
              }
              if (child.marks?.some((mark: any) => mark.type === 'strike')) {
                payloadChild.strike = true
              }
              if (child.marks?.some((mark: any) => mark.type === 'code')) {
                payloadChild.code = true
              }

              // Handle link marks
              const linkMark = child.marks?.find((mark: any) => mark.type === 'link')
              if (linkMark) {
                payloadChild.link = {
                  url: linkMark.attrs.href,
                  target: linkMark.attrs.target || '_blank',
                }
              }

              return payloadChild
            }) || [],
        }
      }

      // Handle headings
      if (node.type === 'heading') {
        return {
          type: 'paragraph',
          children: [
            {
              text: node.content?.[0]?.text || '',
              bold: true,
            },
          ],
        }
      }

      // Handle lists
      if (node.type === 'bulletList' || node.type === 'orderedList') {
        // For PayloadCMS compatibility, we need to convert lists to a format it can understand
        // Since PayloadCMS expects a flat structure, we'll convert each list item to a paragraph
        // but mark them with a special attribute to indicate they were part of a list
        const listItems =
          node.content
            ?.map((item: any) => {
              if (item.type === 'listItem' && item.content?.[0]?.type === 'paragraph') {
                const listItemText = item.content[0].content
                  ?.map((child: any) => {
                    if (child.type === 'text') {
                      // Add bullet or number prefix based on list type
                      const prefix =
                        node.type === 'bulletList' ? '• ' : `${node.content.indexOf(item) + 1}. `
                      return {
                        text: prefix + (child.text || ''),
                        ...(child.marks?.some((m: any) => m.type === 'bold') && { bold: true }),
                        ...(child.marks?.some((m: any) => m.type === 'italic') && { italic: true }),
                        ...(child.marks?.some((m: any) => m.type === 'underline') && {
                          underline: true,
                        }),
                        ...(child.marks?.some((m: any) => m.type === 'strike') && { strike: true }),
                        ...(child.marks?.some((m: any) => m.type === 'code') && { code: true }),
                        ...(child.marks?.find((m: any) => m.type === 'link') && {
                          link: {
                            url: child.marks.find((m: any) => m.type === 'link').attrs.href,
                            target:
                              child.marks.find((m: any) => m.type === 'link').attrs.target ||
                              '_blank',
                          },
                        }),
                      }
                    }
                    return null
                  })
                  .filter(Boolean) || [{ text: '• ' }]

                return {
                  type: 'paragraph',
                  children: listItemText,
                }
              }
              return null
            })
            .filter(Boolean) || []

        return listItems
      }

      // Handle blockquotes
      if (node.type === 'blockquote') {
        return {
          type: 'paragraph',
          children: [
            {
              text: node.content?.[0]?.content?.[0]?.text || '',
              italic: true,
            },
          ],
        }
      }

      // Handle other Tiptap nodes if necessary, otherwise they are ignored
      return null
    })
    .filter(Boolean) // Remove null values
    .flat() // Flatten arrays from lists
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
  const formatLabel = contentFormat === 'html' ? 'HTML Import' : 'Current Format'

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
            <div style={{ marginBottom: '20px' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                }}
              >
                Target
              </label>
              <select
                value={linkTarget}
                onChange={(e) => setLinkTarget(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  outline: 'none',
                }}
              >
                <option value="_blank">Open in new tab</option>
                <option value="_self">Open in same tab</option>
                <option value="_parent">Open in parent frame</option>
                <option value="_top">Open in top frame</option>
              </select>
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
