'use client'

import { useState } from 'react'
import { WikiEditor } from '@/components/WikiEditor'

export function WikiEditorWrapper({ defaultValue }: { defaultValue: string }) {
    const [content, setContent] = useState(defaultValue)

    return (
        <>
            <input type="hidden" name="content" value={content} />
            <WikiEditor
                value={content}
                onChange={setContent}
                placeholder="Start writing... Type @ to mention people, labs, or institutes."
            />
        </>
    )
}
