'use client'

import { useState, useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { EditorToolbar } from './EditorToolbar'
import { Eye, EyeOff, Type, FileText } from 'lucide-react'

type ViewMode = 'rich' | 'markdown'

interface WikiEditorProps {
    value?: string
    onChange?: (value: string) => void
    placeholder?: string
    onImageUpload?: (file: File) => Promise<string>
}

export function WikiEditor({
    value = '',
    onChange,
    placeholder = 'Start writing... Type @ to mention people, labs, or institutes.',
    onImageUpload
}: WikiEditorProps) {
    const [viewMode, setViewMode] = useState<ViewMode>('rich')
    const [localValue, setLocalValue] = useState(value)
    const [wordCount, setWordCount] = useState(0)
    const [charCount, setCharCount] = useState(0)

    const richEditor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3]
                }
            }),
            Image.configure({
                inline: true,
                allowBase64: true
            }),
            Placeholder.configure({
                placeholder
            })
        ],
        content: localValue,
        editorProps: {
            attributes: {
                class: 'prose dark:prose-invert prose-sm sm:prose lg:prose-lg xl:prose-2xl max-w-none focus:outline-none min-h-[300px] px-4 py-3'
            },
            handlePaste: (view, event) => {
                const items = event.clipboardData?.items
                if (!items) return false

                const hasFiles = Array.from(items).some(item => item.type.indexOf('image') !== -1)
                if (hasFiles && onImageUpload) {
                    event.preventDefault()
                    Array.from(items).forEach(async (item) => {
                        if (item.type.indexOf('image') !== -1) {
                            const file = item.getAsFile()
                            if (file) {
                                const url = await onImageUpload(file)
                                const { schema } = view.state
                                const node = schema.nodes.image.create({ src: url })
                                const transaction = view.state.tr.replaceSelectionWith(node)
                                view.dispatch(transaction)
                            }
                        }
                    })
                    return true
                }
                return false
            }
        },
        onUpdate: ({ editor }) => {
            const html = editor.getHTML()
            setLocalValue(html)
            onChange?.(html)
        }
    })

    useEffect(() => {
        setLocalValue(value)
        if (richEditor && viewMode === 'rich' && value !== richEditor.getHTML()) {
            richEditor.commands.setContent(value)
        }
    }, [value])

    useEffect(() => {
        const text = localValue.replace(/<[^>]*>/g, '').trim()
        const words = text ? text.split(/\s+/).length : 0
        const chars = text.length
        setWordCount(words)
        setCharCount(chars)
    }, [localValue])

    const handleMarkdownChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value
        setLocalValue(newValue)
        onChange?.(newValue)
    }

    const handleViewToggle = (mode: ViewMode) => {
        if (mode === 'markdown' && richEditor) {
            // Convert HTML to plain text when switching to markdown
            const htmlContent = richEditor.getHTML()
            const plainText = htmlContent.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()
            setLocalValue(plainText)
        }
        setViewMode(mode)
        if (mode === 'rich' && richEditor) {
            richEditor.commands.setContent(localValue)
        }
    }

    return (
        <div className="border border-border rounded-lg overflow-hidden bg-background">
            <div className="flex items-center justify-between border-b border-border px-4 py-2 bg-muted/30">
                <div className="flex items-center gap-4">
                    <Type size={20} className="text-muted-foreground" />
                    <div className="flex bg-muted p-1 rounded-lg">
                        <button
                            onClick={() => handleViewToggle('rich')}
                            className={`px-3 py-1.5 rounded-md font-medium transition-colors text-sm ${viewMode === 'rich'
                                ? 'bg-background text-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            Rich Text
                        </button>
                        <button
                            onClick={() => handleViewToggle('markdown')}
                            className={`px-3 py-1.5 rounded-md font-medium transition-colors text-sm ${viewMode === 'markdown'
                                ? 'bg-background text-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            Markdown
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span>{wordCount} words</span>
                    <span>|</span>
                    <span>{charCount} characters</span>
                </div>
            </div>

            <div className="relative">
                {viewMode === 'rich' ? (
                    <>
                        <EditorToolbar editor={richEditor} />
                        <EditorContent editor={richEditor} />
                    </>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
                        <div className="flex flex-col">
                            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-4 pt-3">
                                Markdown Editor
                            </label>
                            <textarea
                                value={localValue}
                                onChange={handleMarkdownChange}
                                placeholder={placeholder}
                                className="w-full min-h-[400px] px-4 py-3 border-0 focus:ring-0 focus:outline-none resize-none font-mono text-sm bg-transparent text-foreground"
                                spellCheck={false}
                            />
                        </div>
                        <div className="bg-muted/10 flex flex-col">
                            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-4 pt-3">
                                Preview
                            </label>
                            <div className="p-4 overflow-y-auto prose dark:prose-invert prose-sm max-w-none min-h-[400px] text-foreground">
                                <Markdown
                                    remarkPlugins={[remarkGfm]}
                                >
                                    {localValue}
                                </Markdown>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
