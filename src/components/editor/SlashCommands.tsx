import { Editor, useCurrentEditor } from '@tiptap/react'
import { useEffect, useState, useRef } from 'react'

interface CommandItem {
  title: string
  description: string
  icon: string
  command: (editor: Editor) => void
}

const commands: CommandItem[] = [
  {
    title: 'Text',
    description: 'Just start writing with plain text',
    icon: '📝',
    command: (editor) => {
      editor.chain().focus().toggleParagraph().run()
    },
  },
  {
    title: 'Heading 1',
    description: 'Big section heading',
    icon: 'H1',
    command: (editor) => {
      editor.chain().focus().toggleHeading({ level: 1 }).run()
    },
  },
  {
    title: 'Heading 2',
    description: 'Medium section heading',
    icon: 'H2',
    command: (editor) => {
      editor.chain().focus().toggleHeading({ level: 2 }).run()
    },
  },
  {
    title: 'Heading 3',
    description: 'Small section heading',
    icon: 'H3',
    command: (editor) => {
      editor.chain().focus().toggleHeading({ level: 3 }).run()
    },
  },
  {
    title: 'Bullet List',
    description: 'Create a simple bullet list',
    icon: '•',
    command: (editor) => {
      editor.chain().focus().toggleBulletList().run()
    },
  },
  {
    title: 'Numbered List',
    description: 'Create a list with numbering',
    icon: '1.',
    command: (editor) => {
      editor.chain().focus().toggleOrderedList().run()
    },
  },
  {
    title: 'Task List',
    description: 'Create a checklist with checkboxes',
    icon: '☑',
    command: (editor) => {
      editor.chain().focus().toggleTaskList().run()
    },
  },
  {
    title: 'Quote',
    description: 'Capture a quote',
    icon: '"',
    command: (editor) => {
      editor.chain().focus().toggleBlockquote().run()
    },
  },
  {
    title: 'Code',
    description: 'Capture a code snippet',
    icon: '</>',
    command: (editor) => {
      editor.chain().focus().toggleCodeBlock().run()
    },
  },
  {
    title: 'Image',
    description: 'Add an image',
    icon: '🖼',
    command: (editor) => {
      const url = window.prompt('Enter image URL')
      if (url) {
        editor.chain().focus().setImage({ src: url }).run()
      }
    },
  },
  {
    title: 'Link',
    description: 'Add a link',
    icon: '🔗',
    command: (editor) => {
      const url = window.prompt('Enter URL')
      if (url) {
        editor.chain().focus().setLink({ href: url }).run()
      }
    },
  },
  {
    title: 'Table',
    description: 'Add a table',
    icon: '▦',
    command: (editor) => {
      editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
    },
  },
  {
    title: 'Horizontal Rule',
    description: 'Add a divider',
    icon: '—',
    command: (editor) => {
      editor.chain().focus().setHorizontalRule().run()
    },
  },
  {
    title: 'Hard Break',
    description: 'Add a line break',
    icon: '↵',
    command: (editor) => {
      editor.chain().focus().setHardBreak().run()
    },
  },
]

interface SlashCommandsProps {
  editor: Editor
}

export function SlashCommands({ editor }: SlashCommandsProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const menuRef = useRef<HTMLDivElement>(null)

  const filteredCommands = commands.filter(cmd =>
    cmd.title.toLowerCase().includes(query.toLowerCase()) ||
    cmd.description.toLowerCase().includes(query.toLowerCase())
  )

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(prev => (prev + 1) % filteredCommands.length)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length)
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].command(editor)
          setOpen(false)
          setQuery('')
        }
      } else if (e.key === 'Escape') {
        setOpen(false)
        setQuery('')
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, selectedIndex, filteredCommands, editor])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const { from } = editor.state.selection
    const textBefore = editor.state.doc.textBetween(0, from)
    const lastChar = textBefore.slice(-1)

    if (lastChar === '/') {
      setOpen(true)
      setQuery('')
    } else if (open && !textBefore.endsWith('/')) {
      const queryMatch = textBefore.match(/\/([a-zA-Z0-9\s]*)$/)
      if (queryMatch) {
        setQuery(queryMatch[1])
      } else {
        setOpen(false)
        setQuery('')
      }
    }
  }, [editor.state.selection, editor.state.doc, open])

  if (!open) return null

  const rect = editor.view.coordsAtPos(editor.state.selection.from)
  const editorContainer = editor.view.dom.getBoundingClientRect()

  return (
    <div
      ref={menuRef}
      className="fixed z-50 w-80 bg-white rounded-lg shadow-xl border border-neutral-200 overflow-hidden"
      style={{
        left: Math.min(rect.left - editorContainer.left, window.innerWidth - 350),
        top: rect.bottom - editorContainer.top + 8,
        maxHeight: 'min(400px, 60vh)',
        overflowY: 'auto',
      }}
    >
      <div className="p-2 border-b border-neutral-100 bg-neutral-50">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search commands..."
          className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
        />
      </div>
      
      <div className="py-2">
        {filteredCommands.length === 0 ? (
          <div className="px-4 py-3 text-sm text-neutral-500">
            No commands found
          </div>
        ) : (
          filteredCommands.map((cmd, index) => (
            <button
              key={cmd.title}
              onClick={() => {
                cmd.command(editor)
                setOpen(false)
                setQuery('')
              }}
              className={`w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors flex items-start gap-3 ${
                index === selectedIndex ? 'bg-blue-50' : ''
              }`}
            >
              <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-neutral-100 rounded-md text-lg font-semibold text-neutral-700">
                {typeof cmd.icon === 'string' && cmd.icon.length <= 2 ? cmd.icon : cmd.icon.charAt(0)}
              </span>
              <div>
                <div className="font-medium text-neutral-900">{cmd.title}</div>
                <div className="text-sm text-neutral-500">{cmd.description}</div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}

export default SlashCommands
