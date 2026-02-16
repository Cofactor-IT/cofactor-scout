# Fix Imports Script - Cofactor Project Reorganization
# Run this from project root: .\fix-imports.ps1

Write-Host "🔧 Starting Import Path Updates..." -ForegroundColor Cyan
Write-Host ""

$replacements = @(
    # Server Actions
    @{Find='from [''"]@/app/auth/actions[''"]'; Replace="from '@/actions/auth.actions'"; Name="Auth Actions"},
    @{Find='from [''"]@/app/admin/actions[''"]'; Replace="from '@/actions/admin.actions'"; Name="Admin Actions"},
    @{Find='from [''"]@/app/admin/settings/actions[''"]'; Replace="from '@/actions/admin-settings.actions'"; Name="Admin Settings Actions"},
    @{Find='from [''"]@/app/admin/universities/actions[''"]'; Replace="from '@/actions/admin-universities.actions'"; Name="Admin Universities Actions"},
    @{Find='from [''"]@/app/members/actions[''"]'; Replace="from '@/actions/members.actions'"; Name="Members Actions"},
    @{Find='from [''"]@/app/profile/actions[''"]'; Replace="from '@/actions/profile.actions'"; Name="Profile Actions"},
    @{Find='from [''"]@/app/profile/settings-actions[''"]'; Replace="from '@/actions/profile-settings.actions'"; Name="Profile Settings Actions"},
    @{Find='from [''"]@/app/profile/connect/actions[''"]'; Replace="from '@/actions/social-connect.actions'"; Name="Social Connect Actions"},
    @{Find='from [''"]@/app/actions/social[''"]'; Replace="from '@/actions/social.actions'"; Name="Social Actions"},
    @{Find='from [''"]@/app/wiki/actions[''"]'; Replace="from '@/actions/wiki.actions'"; Name="Wiki Actions"},
    @{Find='from [''"]@/app/wiki/activity-actions[''"]'; Replace="from '@/actions/wiki-activity.actions'"; Name="Wiki Activity Actions"},
    @{Find='from [''"]@/app/wiki/history-actions[''"]'; Replace="from '@/actions/wiki-history.actions'"; Name="Wiki History Actions"},
    @{Find='from [''"]@/app/wiki/people-actions[''"]'; Replace="from '@/actions/wiki-people.actions'"; Name="Wiki People Actions"},
    @{Find='from [''"]@/app/wiki/structure-actions[''"]'; Replace="from '@/actions/wiki-structure.actions'"; Name="Wiki Structure Actions"},
    
    # Auth Module
    @{Find='from [''"]@/lib/auth-checks[''"]'; Replace="from '@/lib/auth/permissions'"; Name="Auth Checks"},
    @{Find='from [''"]@/lib/auth-config[''"]'; Replace="from '@/lib/auth/config'"; Name="Auth Config"},
    @{Find='from [''"]@/lib/auth[''"]'; Replace="from '@/lib/auth/session'"; Name="Auth Session"},
    
    # Security Module
    @{Find='from [''"]@/lib/rate-limit-edge[''"]'; Replace="from '@/lib/security/rate-limit-edge'"; Name="Rate Limit Edge"},
    @{Find='from [''"]@/lib/rate-limit-redis[''"]'; Replace="from '@/lib/security/rate-limit-redis'"; Name="Rate Limit Redis"},
    @{Find='from [''"]@/lib/rate-limit[''"]'; Replace="from '@/lib/security/rate-limit'"; Name="Rate Limit"},
    @{Find='from [''"]@/lib/sanitization[''"]'; Replace="from '@/lib/security/sanitization'"; Name="Sanitization"},
    @{Find='from [''"]@/lib/csrf[''"]'; Replace="from '@/lib/security/csrf'"; Name="CSRF"},
    
    # Database Module
    @{Find='from [''"]@/lib/prisma[''"]'; Replace="from '@/lib/database/prisma'"; Name="Prisma"},
    @{Find='from [''"]@/lib/db-helpers[''"]'; Replace="from '@/lib/database/helpers'"; Name="DB Helpers"},
    
    # Utils Module (order matters - most specific first)
    @{Find='from [''"]@/lib/universityUtils[''"]'; Replace="from '@/lib/utils/university'"; Name="University Utils"},
    @{Find='from [''"]@/lib/middleware-helpers[''"]'; Replace="from '@/lib/utils/middleware'"; Name="Middleware Helpers"},
    @{Find='from [''"]@/lib/api-response[''"]'; Replace="from '@/lib/utils/api-response'"; Name="API Response"},
    @{Find='from [''"]@/lib/search[''"]'; Replace="from '@/lib/utils/search'"; Name="Search"},
    @{Find='from [''"]@/lib/mentions[''"]'; Replace="from '@/lib/utils/mentions'"; Name="Mentions"},
    @{Find='from [''"]@/lib/utils[''"]'; Replace="from '@/lib/utils/formatting'"; Name="Utils"},
    
    # Email & Validation
    @{Find='from [''"]@/lib/email[''"]'; Replace="from '@/lib/email/send'"; Name="Email"},
    @{Find='from [''"]@/lib/validation[''"]'; Replace="from '@/lib/validation/schemas'"; Name="Validation"},
    
    # Components
    @{Find='from [''"]@/components/navbar[''"]'; Replace="from '@/components/shared/Navbar'"; Name="Navbar"},
    @{Find='from [''"]@/components/SignOutButton[''"]'; Replace="from '@/components/shared/SignOutButton'"; Name="SignOut Button"},
    @{Find='from [''"]@/components/error-boundary[''"]'; Replace="from '@/components/shared/ErrorBoundary'"; Name="Error Boundary"},
    @{Find='from [''"]@/components/AnalyticsProvider[''"]'; Replace="from '@/components/shared/AnalyticsProvider'"; Name="Analytics Provider"},
    @{Find='from [''"]@/components/SearchBar[''"]'; Replace="from '@/components/features/search/SearchBar'"; Name="Search Bar"}
)

$totalReplacements = 0
$fileExtensions = @("*.ts", "*.tsx", "*.js", "*.jsx")

foreach ($replacement in $replacements) {
    Write-Host "📝 Updating: $($replacement.Name)..." -ForegroundColor Yellow
    
    $count = 0
    foreach ($ext in $fileExtensions) {
        $files = Get-ChildItem -Path . -Filter $ext -Recurse -File | 
                 Where-Object { $_.FullName -notmatch '\\node_modules\\' -and 
                               $_.FullName -notmatch '\\.next\\' -and
                               $_.FullName -notmatch '\\dist\\' -and
                               $_.FullName -notmatch '\\build\\' }
        
        foreach ($file in $files) {
            $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
            if ($content -match $replacement.Find) {
                $newContent = $content -replace $replacement.Find, $replacement.Replace
                Set-Content -Path $file.FullName -Value $newContent -NoNewline
                $count++
            }
        }
    }
    
    if ($count -gt 0) {
        Write-Host "   ✅ Updated $count file(s)" -ForegroundColor Green
        $totalReplacements += $count
    } else {
        Write-Host "   ⏭️  No matches found" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "✨ Import update complete!" -ForegroundColor Green
Write-Host "📊 Total files updated: $totalReplacements" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔍 Next steps:" -ForegroundColor Yellow
Write-Host "   1. Run: npm run type-check" -ForegroundColor White
Write-Host "   2. Fix any remaining import errors manually" -ForegroundColor White
Write-Host "   3. Run: npm run build" -ForegroundColor White
Write-Host ""
