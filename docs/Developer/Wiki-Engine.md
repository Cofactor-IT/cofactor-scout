# Wiki Engine Internals

## The Revision System

The core of Cofactor Club is its community-moderated wiki. The system is designed to prevent spam and ensure high-quality content through a "propose-and-approve" workflow.

### Workflow Logic

1.  **Drafting**: A user edits a page. The frontend uses a Markdown editor.
2.  **Submission**:
    *   **Staff/Admin**: Edits are applied immediately. A `WikiRevision` is created with status `APPROVED`, and `UniPage` is updated.
    *   **Trusted User**: If within their daily limit, same as Staff. If limit exceeded, treated as Student.
    *   **Student**: A `WikiRevision` is created with status `PENDING`. `UniPage` is **unchanged**.
3.  **Moderation**:
    *   Admins view the "diff" between the `PENDING` revision and the current `UniPage`.
    *   **Approve**: `WikiRevision` -> `APPROVED`. `UniPage.content` updated. Author gets Power Score.
    *   **Reject**: `WikiRevision` -> `REJECTED`. Author gets feedback.

## The Diff Viewer

We use `react-diff-viewer-continued` to visualize changes. 

*   **Input**: Two strings (Old Markdown, New Markdown).
*   **Output**: A side-by-side or split-view comparison highlighting additions (green) and deletions (red).
*   **Security**: The content rendered in the diff viewer is sanitized relative to the user's browser, but the raw storage is Markdown.

## Mentions System (`@` Tagging)

The editor supports tagging other entities (People, Labs, Institutes).

### Parsing Logic
1.  User types `@`.
2.  Frontend searches for entities matching the text.
3.  On selection, a special markdown link is inserted: `[@Name](slug)`.
4.  **Backend Rendering**: `react-markdown` custom components detect these links and render them as styled "Chip" components that link to the profile.

## Content Sanitization

To prevent XSS (Cross-Site Scripting) attacks, all user-generated content is sanitized before rendering.

*   **Library**: `isomorphic-dompurify`.
*   **Process**:
    1.  Markdown is converted to HTML.
    2.  HTML is passed through `DOMPurify`.
    3.  Only safe tags (p, b, i, a, ul, table, etc.) are allowed. Scripts and iframes are stripped.
