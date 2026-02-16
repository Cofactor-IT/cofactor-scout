# Fix all broken imports in the project

$files = @(
    # Wiki files with @/lib/prisma
    "app\wiki\[slug]\page.tsx",
    "app\wiki\[slug]\edit\page.tsx",
    "app\wiki\[slug]\history\page.tsx",
    "app\wiki\diff\[revisionId]\page.tsx",
    "app\wiki\institutes\[slug]\page.tsx",
    "app\wiki\institutes\[slug]\history\page.tsx",
    "app\wiki\labs\[slug]\page.tsx",
    "app\wiki\labs\[slug]\history\page.tsx",
    "app\wiki\people\[slug]\page.tsx",
    "app\wiki\university\[universityId]\history\page.tsx",
    "app\admin\revision\[id]\page.tsx",
    
    # Files with @/lib/auth-config
    "app\wiki\[slug]\page.tsx",
    "app\wiki\[slug]\history\page.tsx",
    "app\wiki\diff\[revisionId]\page.tsx",
    "app\wiki\institutes\[slug]\page.tsx",
    "app\wiki\institutes\[slug]\history\page.tsx",
    "app\wiki\labs\[slug]\page.tsx",
    "app\wiki\labs\[slug]\history\page.tsx",
    "app\wiki\university\[universityId]\history\page.tsx",
    "app\api\admin\backups\[filename]\route.ts",
    "app\api\gdpr\export\download\[id]\route.ts",
    "app\api\moderation\reports\[id]\resolve\route.ts",
    
    # Files with @/lib/utils
    "app\wiki\institutes\[slug]\page.tsx",
    "app\wiki\labs\[slug]\page.tsx",
    "app\wiki\people\[slug]\page.tsx",
    
    # Files with relative imports in wiki
    "app\wiki\institutes\[slug]\page.tsx",
    "app\wiki\labs\[slug]\page.tsx"
)

Write-Host "Fixing imports..." -ForegroundColor Green

# Fix @/lib/prisma -> @/lib/database/prisma
Get-ChildItem -Path "app" -Recurse -Include *.ts,*.tsx | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    if ($content -match "from '@/lib/prisma'") {
        $content = $content -replace "from '@/lib/prisma'", "from '@/lib/database/prisma'"
        Set-Content $_.FullName -Value $content -NoNewline
        Write-Host "Fixed prisma import in: $($_.FullName)" -ForegroundColor Yellow
    }
}

# Fix @/lib/auth-config -> @/lib/auth/config
Get-ChildItem -Path "app" -Recurse -Include *.ts,*.tsx | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    if ($content -match "from '@/lib/auth-config'") {
        $content = $content -replace "from '@/lib/auth-config'", "from '@/lib/auth/config'"
        Set-Content $_.FullName -Value $content -NoNewline
        Write-Host "Fixed auth-config import in: $($_.FullName)" -ForegroundColor Yellow
    }
}

# Fix @/lib/utils -> @/lib/utils/formatting
Get-ChildItem -Path "app\wiki" -Recurse -Include *.ts,*.tsx | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    if ($content -match "from '@/lib/utils'") {
        $content = $content -replace "from '@/lib/utils'", "from '@/lib/utils/formatting'"
        Set-Content $_.FullName -Value $content -NoNewline
        Write-Host "Fixed utils import in: $($_.FullName)" -ForegroundColor Yellow
    }
}

# Fix relative imports in wiki files
$wikiRelativeImports = @{
    "app\wiki\institutes\[slug]\page.tsx" = @(
        @{ old = "from '../../ProposeStructureModal'"; new = "from '@/components/features/wiki/ProposeStructureModal'" },
        @{ old = "from '../../AddPersonModal'"; new = "from '@/components/features/wiki/AddPersonModal'" },
        @{ old = "from '../../EditPersonModal'"; new = "from '@/components/features/wiki/EditPersonModal'" },
        @{ old = "from '../../AddArticleButton'"; new = "from '@/components/features/wiki/AddArticleButton'" }
    )
    "app\wiki\labs\[slug]\page.tsx" = @(
        @{ old = "from '../../AddPersonModal'"; new = "from '@/components/features/wiki/AddPersonModal'" },
        @{ old = "from '../../EditPersonModal'"; new = "from '@/components/features/wiki/EditPersonModal'" },
        @{ old = "from '../../AddArticleButton'"; new = "from '@/components/features/wiki/AddArticleButton'" }
    )
    "app\wiki\[slug]\edit\page.tsx" = @(
        @{ old = "from '../../actions'"; new = "from '@/actions/wiki.actions'" }
    )
    "app\wiki\[slug]\history\page.tsx" = @(
        @{ old = "from '../../history-actions'"; new = "from '@/actions/wiki-history.actions'" }
    )
    "app\wiki\institutes\[slug]\history\page.tsx" = @(
        @{ old = "from '@/app/wiki/activity-actions'"; new = "from '@/actions/wiki-activity.actions'" }
    )
    "app\wiki\labs\[slug]\history\page.tsx" = @(
        @{ old = "from '@/app/wiki/activity-actions'"; new = "from '@/actions/wiki-activity.actions'" }
    )
    "app\wiki\university\[universityId]\history\page.tsx" = @(
        @{ old = "from '@/app/wiki/activity-actions'"; new = "from '@/actions/wiki-activity.actions'" }
    )
    "app\admin\revision\[id]\page.tsx" = @(
        @{ old = "from '../../actions'"; new = "from '@/actions/admin.actions'" }
    )
}

foreach ($file in $wikiRelativeImports.Keys) {
    $fullPath = Join-Path $PSScriptRoot $file
    if (Test-Path $fullPath) {
        $content = Get-Content $fullPath -Raw
        foreach ($replacement in $wikiRelativeImports[$file]) {
            if ($content -match [regex]::Escape($replacement.old)) {
                $content = $content -replace [regex]::Escape($replacement.old), $replacement.new
                Write-Host "Fixed relative import in: $file" -ForegroundColor Cyan
            }
        }
        Set-Content $fullPath -Value $content -NoNewline
    }
}

Write-Host "`nAll imports fixed!" -ForegroundColor Green
