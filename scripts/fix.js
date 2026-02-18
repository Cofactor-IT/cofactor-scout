const fs = require('fs');
const path = require('path');

const files = [
  'lib/utils/tokens.ts',
  'components/shared/Navbar.tsx',
  'components/shared/ProfileDropdown.tsx',
  'components/shared/PageHeader.tsx',
  'components/shared/StickyFooter.tsx',
  'components/ui/button.tsx',
  'components/ui/input.tsx',
  'components/ui/textarea.tsx',
  'components/ui/dropdown.tsx',
  'components/ui/checkbox.tsx',
  'components/ui/card.tsx',
  'components/ui/status-badge.tsx',
  'components/ui/avatar.tsx',
  'components/ui/table.tsx',
  'components/ui/tabs.tsx',
  'components/ui/progress-indicator.tsx',
  'components/ui/modal.tsx',
  'components/ui/search-bar.tsx',
  'components/ui/alert-banner.tsx',
  'components/features/submissions/CommentBox.tsx',
  'components/features/submissions/Comment.tsx',
  'components/features/dashboard/StatCard.tsx',
  'components/features/submissions/SubmissionRow.tsx',
  'components/features/submissions/DraftRow.tsx',
  'components/features/submissions/InfoRow.tsx',
  'components/features/profile/AdditionalLinkInput.tsx'
];

files.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  
  if (fs.existsSync(filePath)) {
    console.log(`Processing ${file}...`);
    const content = fs.readFileSync(filePath, 'utf8');
    const newContent = content.split('\n').map(line => {
       const match = line.match(/^(\s+)/);
       if (match) {
         const leadingSpaces = match[1].length;
         if (leadingSpaces > 0 && leadingSpaces % 2 === 0) {
            const newSpaces = ' '.repeat(leadingSpaces * 2); 
            return newSpaces + line.substring(leadingSpaces);
         }
       }
       return line;
    }).join('\n');
    fs.writeFileSync(filePath, newContent);
  } else {
      console.log(`File not found: ${filePath}`);
  }
});
console.log('Done.');
