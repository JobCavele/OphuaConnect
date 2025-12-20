Write-Host "=== VERIFICAÇÃO DE IMPORTS ===" -ForegroundColor Cyan

# Lista de imports comuns que podem falhar
$commonImports = @(
    "import AdminDashboard from './pages/admin/Dashboard';",
    "import CompanyDashboard from './pages/company/Dashboard';",
    "import CompanyEmployeesList from './pages/company/Employees/List';",
    "import PersonalDashboard from './pages/personal/Dashboard';",
    "import CompanyProfileEdit from './pages/company/EditProfile';",
    "import { companyService } from './services/company.service';",
    "import { authService } from './services/auth.service';"
)

foreach ($import in $commonImports) {
    if ($import -match "from\s+['""]([^'""]+)['""]") {
        $module = $matches[1]
        $file = $null
        
        # Tenta encontrar o arquivo
        $paths = @(
            "$module.jsx",
            "$module.js", 
            "$module/index.jsx",
            "$module/index.js"
        )
        
        $found = $false
        foreach ($path in $paths) {
            if (Test-Path $path) {
                $file = $path
                $found = $true
                break
            }
        }
        
        if ($found) {
            $content = Get-Content $file -Raw
            if ($content.Trim() -eq '') {
                Write-Host "⚠️  $module -> ARQUIVO VAZIO ($file)" -ForegroundColor Yellow
            } else {
                Write-Host "✓  $module -> OK" -ForegroundColor Green
            }
        } else {
            Write-Host "❌ $module -> ARQUIVO NÃO ENCONTRADO" -ForegroundColor Red
        }
    }
}
