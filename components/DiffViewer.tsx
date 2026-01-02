'use client'

import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer-continued'

interface DiffViewerProps {
    oldContent: string
    newContent: string
    splitView?: boolean
}

export function DiffViewer({ oldContent, newContent, splitView = true }: DiffViewerProps) {
    return (
        <div className="rounded-lg overflow-hidden border border-zinc-800">
            <ReactDiffViewer
                oldValue={oldContent || '(empty)'}
                newValue={newContent}
                splitView={splitView}
                compareMethod={DiffMethod.WORDS}
                useDarkTheme={true}
                styles={{
                    variables: {
                        dark: {
                            diffViewerBackground: '#09090b',
                            diffViewerColor: '#fafafa',
                            addedBackground: '#132a13',
                            addedColor: '#4ade80',
                            removedBackground: '#3f0d0d',
                            removedColor: '#f87171',
                            wordAddedBackground: '#166534',
                            wordRemovedBackground: '#7f1d1d',
                            addedGutterBackground: '#0d2818',
                            removedGutterBackground: '#2a0d0d',
                            gutterBackground: '#18181b',
                            gutterBackgroundDark: '#09090b',
                            highlightBackground: '#27272a',
                            highlightGutterBackground: '#27272a',
                            codeFoldGutterBackground: '#18181b',
                            codeFoldBackground: '#18181b',
                            emptyLineBackground: '#09090b',
                            codeFoldContentColor: '#71717a',
                        }
                    },
                    contentText: {
                        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, monospace',
                        fontSize: '14px',
                    },
                    gutter: {
                        minWidth: '40px',
                    }
                }}
                leftTitle="Current Content"
                rightTitle="Proposed Changes"
            />
        </div>
    )
}
