'use client'

import { Editor } from '@tiptap/react'
import {
    Bold,
    Italic,
    List,
    Link2,
    Quote,
    Code,
    Undo,
    Redo,
    ListOrdered,
    Heading1,
    Heading2,
    Heading3,
    Strikethrough,
    Type,
    Image,
    X
} from 'lucide-react'

interface EditorToolbarProps {
    editor: Editor | null
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
    if (!editor) {
        return null
    }

    const ToolbarButton = ({
        onClick,
        disabled,
        active,
        children,
        title
    }: {
        onClick: () => void
        disabled?: boolean
        active?: boolean
        children: React.ReactNode
        title: string
    }) => (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`p-2 rounded hover:bg-gray-100 transition-colors ${
                active ? 'bg-blue-100 text-blue-600' : ''
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={title}
        >
            {children}
        </button>
    )

    const addImage = () => {
        const url = window.prompt('Enter image URL:')
        if (url) {
            editor.chain().focus().setImage({ src: url }).run()
        }
    }

    const addLink = () => {
        const url = window.prompt('Enter URL:')
        if (url) {
            editor.chain().focus().setLink({ href: url }).run()
        }
    }

    return (
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-2 z-10">
            <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1 flex-wrap">
                    <ToolbarButton
                        onClick={() => editor.chain().focus().undo().run()}
                        disabled={!editor.can().undo()}
                        title="Undo (Ctrl+Z)"
                    >
                        <Undo size={18} />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().redo().run()}
                        disabled={!editor.can().redo()}
                        title="Redo (Ctrl+Y)"
                    >
                        <Redo size={18} />
                    </ToolbarButton>

                    <div className="w-px h-6 bg-gray-200 mx-1" />

                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        disabled={!editor.can().toggleBold()}
                        active={editor.isActive('bold')}
                        title="Bold (Ctrl+B)"
                    >
                        <Bold size={18} />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        disabled={!editor.can().toggleItalic()}
                        active={editor.isActive('italic')}
                        title="Italic (Ctrl+I)"
                    >
                        <Italic size={18} />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                        disabled={!editor.can().toggleStrike()}
                        active={editor.isActive('strike')}
                        title="Strikethrough"
                    >
                        <Strikethrough size={18} />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleCode().run()}
                        disabled={!editor.can().toggleCode()}
                        active={editor.isActive('code')}
                        title="Inline Code"
                    >
                        <Code size={18} />
                    </ToolbarButton>

                    <div className="w-px h-6 bg-gray-200 mx-1" />

                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                        disabled={!editor.can().toggleHeading({ level: 1 })}
                        active={editor.isActive('heading', { level: 1 })}
                        title="Heading 1"
                    >
                        <Heading1 size={18} />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        disabled={!editor.can().toggleHeading({ level: 2 })}
                        active={editor.isActive('heading', { level: 2 })}
                        title="Heading 2"
                    >
                        <Heading2 size={18} />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                        disabled={!editor.can().toggleHeading({ level: 3 })}
                        active={editor.isActive('heading', { level: 3 })}
                        title="Heading 3"
                    >
                        <Heading3 size={18} />
                    </ToolbarButton>

                    <div className="w-px h-6 bg-gray-200 mx-1" />

                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        disabled={!editor.can().toggleBulletList()}
                        active={editor.isActive('bulletList')}
                        title="Bullet List"
                    >
                        <List size={18} />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        disabled={!editor.can().toggleOrderedList()}
                        active={editor.isActive('orderedList')}
                        title="Numbered List"
                    >
                        <ListOrdered size={18} />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                        disabled={!editor.can().toggleBlockquote()}
                        active={editor.isActive('blockquote')}
                        title="Quote"
                    >
                        <Quote size={18} />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                        disabled={!editor.can().toggleCodeBlock()}
                        active={editor.isActive('codeBlock')}
                        title="Code Block"
                    >
                        <Code size={18} />
                    </ToolbarButton>

                    <div className="w-px h-6 bg-gray-200 mx-1" />

                    <ToolbarButton
                        onClick={addLink}
                        title="Insert Link (Ctrl+K)"
                        active={editor.isActive('link')}
                    >
                        <Link2 size={18} />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={addImage}
                        title="Insert Image"
                    >
                        <Image size={18} />
                    </ToolbarButton>

                    <div className="w-px h-6 bg-gray-200 mx-1" />

                    <ToolbarButton
                        onClick={() => editor.chain().focus().unsetAllMarks().run()}
                        title="Clear Formatting"
                    >
                        <X size={18} />
                    </ToolbarButton>
                </div>
            </div>
        </div>
    )
}
