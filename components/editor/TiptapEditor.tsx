'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import { useEffect } from 'react'

interface TiptapEditorProps {
    value?: string
    onChange?: (value: string) => void
    placeholder?: string
    editable?: boolean
    onImageUpload?: (file: File) => Promise<string>
}

export function TiptapEditor({
    value = '',
    onChange,
    placeholder = 'Start typing...',
    editable = true,
    onImageUpload
}: TiptapEditorProps) {
    const editor = useEditor({
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
        content: value,
        editable,
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl max-w-none focus:outline-none min-h-[300px] px-4 py-3'
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
            onChange?.(html)
        }
    })

    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value)
        }
    }, [value, editor])

    if (!editor) {
        return null
    }

    return (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
            <EditorContent editor={editor} />
        </div>
    )
}
