'use client'

import { useState } from 'react'
import { WikiEditor } from '@/components/editor/WikiEditor'

export function WikiEditorWrapper({ defaultValue }: { defaultValue: string }) {
    const [content, setContent] = useState(defaultValue)

    // Simple heuristic: if it starts with <, it's likely HTML/Rich Text.
    // Otherwise, assume Markdown.
    const initialViewMode = defaultValue.trim().startsWith('<') ? 'rich' : 'markdown'

    return (
        <>
            <input type="hidden" name="content" value={content} />
            <WikiEditor
                value={content}
                onChange={setContent}
                initialViewMode={initialViewMode}
                placeholder="Start writing... Type @ to mention people, labs, or institutes."
            />
        </>
    )
}
