# Fix Imports Script - Cofactor Project Reorganization
Write-Host "Starting Import Path Updates..." -ForegroundColor Cyan

$replacements = @{
    "@/app/auth/actions" = "@/actions/auth.actions"
    "@/app/admin/settings/actions" = "@/actions/admin-settings.actions"
    "@/app/admin/universities/actions" = "@/actions/admin-universities.actions"
    "@/app/admin/actions" = "@/actions/admin.actions"
    "@/app/members/actions" = "@/actions/members.actions"
    "@/app/profile/settings-actions" = "@/actions/profile-settings.actions"
    "@/app/profile/connect/actions" = "@/actions/social-connect.actions"
    "@/app/profile/actions" = "@/actions/profile.actions"
    "@/app/actions/social" = "@/actions/social.actions"
    "@/app/wiki/activity-actions" = "@/actions/wiki-activity.actions"
    "@/app/wiki/history-actions" = "@/actions/wiki-history.actions"
    "@/app/wiki/people-actions" = "@/actions/wiki-people.actions"
    "@/app/wiki/structure-actions" = "@/actions/wiki-structure.actions"
    "@/app/wiki/actions" = "@/actions/wiki.actions"
    "@/lib/auth-checks" = "@/lib/auth/permissions"
    "@/lib/auth-config" = "@/lib/auth/config"
    "@/lib/auth" = "@/lib/auth/session"
    "@/lib/rate-limit-edge" = "@/lib/security/rate-limit-edge"
    "@/lib/rate-limit-redis" = "@/lib/security/rate-limit-redis"
    "@/lib/rate-limit" = "@/lib/security/rate-limit"
    "@/lib/sanitization" = "@/lib/security/sanitization"
    "@/lib/csrf" = "@/lib/security/csrf"
    "@/lib/prisma" = "@/lib/database/prisma"
    "@/lib/db-helpers" = "@/lib/database/helpers"
    "@/lib/universityUtils" = "@/lib/utils/university"
    "@/lib/middleware-helpers" = "@/lib/utils/middleware"
    "@/lib/api-response" = "@/lib/utils/api-response"
    "@/lib/search" = "@/lib/utils/search"
    "@/lib/mentions" = "@/lib/utils/mentions"
    "@/lib/utils" = "@/lib/utils/formatting"
    "@/lib/email" = "@/lib/email/send"
    "@/lib/validation" = "@/lib/validation/schemas"
    "@/components/navbar" = "@/components/shared/Navbar"
    "@/components/SignOutButton" = "@/components/shared/SignOutButton"
    "@/components/error-boundary" = "@/components/shared/ErrorBoundary"
    "@/components/AnalyticsProvider" = "@/components/shared/AnalyticsProvider"
    "@/components/SearchBar" = "@/components/features/search/SearchBar"
}

$total = 0
$files = Get-ChildItem -Path . -Include *.ts,*.tsx,*.js,*.jsx -Recurse | 
         Where-Object { $_.FullName -notmatch 'node_modules|\.next|dist|build' }

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $modified = $false
    
    foreach ($old in $replacements.Keys) {
        if ($content -match [regex]::Escape($old)) {
            $content = $content -replace [regex]::Escape($old), $replacements[$old]
            $modified = $true
        }
    }
    
    if ($modified) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        $total++
        Write-Host "Updated: $($file.Name)" -ForegroundColor Green
    }
}

Write-Host "`nTotal files updated: $total" -ForegroundColor Cyan
Write-Host "Run 'npm run type-check' to verify" -ForegroundColor Yellow
