'use client'

import { Change, diffLines } from 'diff'

export function TextDiffViewer({ oldValue, newValue }: { oldValue: string, newValue: string }) {
    const diff = diffLines(oldValue, newValue)

    return (
        <div className="font-mono text-sm whitespace-pre-wrap rounded-lg border bg-muted/20">
            {diff.map((part: Change, index: number) => {
                let bgColor = 'bg-transparent'
                let textColor = 'text-foreground'
                let prefix = '  '

                if (part.added) {
                    bgColor = 'bg-green-500/10'
                    textColor = 'text-green-600 dark:text-green-400'
                    prefix = '+ '
                } else if (part.removed) {
                    bgColor = 'bg-red-500/10'
                    textColor = 'text-red-600 dark:text-red-400'
                    prefix = '- '
                }

                // Split into lines to ensure proper background for each line
                const lines = part.value.split('\n')
                // Remove last empty split if exact match
                if (lines[lines.length - 1] === '') lines.pop()

                return (
                    <div key={index} className={`${bgColor} ${textColor} block`}>
                        {lines.map((line, i) => (
                            <div key={i} className="px-4 py-0.5">
                                <span className="select-none opacity-50 w-4 inline-block">{prefix}</span>
                                {line}
                            </div>
                        ))}
                    </div>
                )
            })}
        </div>
    )
}
