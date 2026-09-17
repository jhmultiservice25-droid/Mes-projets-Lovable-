param(
    [ValidateSet('Ensure','Reset','Test')]
    [string]$Action = 'Ensure',
    [switch]$Reconfigure
)

$ErrorActionPreference = 'Stop'
$Root = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$ConfigPath = Join-Path $Root '.ecommune-postgresql.env'
$DatabaseName = 'ecommune_kasavubu'
$SchemaFile = Join-Path $Root 'database\schema.sql'
$PilotFile = Join-Path $Root 'database\pilot-kasa-vubu.sql'
$MigrationDir = Join-Path $Root 'database\migrations'
$RootEnv = Join-Path $Root '.env'
$WebEnv = Join-Path $Root 'apps\web\.env.local'
$RootEnvExample = Join-Path $Root '.env.example'
$WebEnvExample = Join-Path $Root 'apps\web\.env.example'

function Find-PostgresBin {
    $psql = Get-Command psql.exe -ErrorAction SilentlyContinue
    if ($psql) { return Split-Path $psql.Source -Parent }

    $base = Join-Path $env:ProgramFiles 'PostgreSQL'
    if (Test-Path $base) {
        $bins = Get-ChildItem -Path $base -Directory -ErrorAction SilentlyContinue |
            Sort-Object { try { [version]$_.Name } catch { [version]'0.0' } } -Descending |
            ForEach-Object { Join-Path $_.FullName 'bin' } |
            Where-Object { Test-Path (Join-Path $_ 'psql.exe') }
        if ($bins) { return $bins[0] }
    }
    return $null
}

function Read-KeyValueFile([string]$Path) {
    $values = @{}
    if (-not (Test-Path $Path)) { return $values }
    foreach ($line in Get-Content -LiteralPath $Path -Encoding UTF8) {
        if ([string]::IsNullOrWhiteSpace($line) -or $line.TrimStart().StartsWith('#')) { continue }
        $idx = $line.IndexOf('=')
        if ($idx -lt 1) { continue }
        $key = $line.Substring(0, $idx).Trim()
        $value = $line.Substring($idx + 1)
        $values[$key] = $value
    }
    return $values
}

function Save-LocalConfig([hashtable]$Config) {
    $content = @(
        '# Configuration locale PostgreSQL e-Commune. Ne pas publier ce fichier.',
        "PGHOST=$($Config.PGHOST)",
        "PGPORT=$($Config.PGPORT)",
        "PGUSER=$($Config.PGUSER)",
        "PGPASSWORD=$($Config.PGPASSWORD)",
        "PGDATABASE=$DatabaseName"
    )
    Set-Content -LiteralPath $ConfigPath -Value $content -Encoding UTF8
}

function Prompt-Config {
    Write-Host ''
    Write-Host 'Configuration PostgreSQL locale e-Commune' -ForegroundColor Cyan
    $hostName = Read-Host 'Serveur PostgreSQL [localhost]'
    if ([string]::IsNullOrWhiteSpace($hostName)) { $hostName = 'localhost' }
    $port = Read-Host 'Port PostgreSQL [5432]'
    if ([string]::IsNullOrWhiteSpace($port)) { $port = '5432' }
    $user = Read-Host 'Utilisateur administrateur PostgreSQL [postgres]'
    if ([string]::IsNullOrWhiteSpace($user)) { $user = 'postgres' }
    $secure = Read-Host 'Mot de passe PostgreSQL' -AsSecureString
    $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
    try { $password = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr) }
    finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr) }
    if ([string]::IsNullOrWhiteSpace($password)) {
        throw 'Le mot de passe PostgreSQL ne peut pas etre vide.'
    }
    return @{
        PGHOST = $hostName
        PGPORT = $port
        PGUSER = $user
        PGPASSWORD = $password
        PGDATABASE = $DatabaseName
    }
}

function Set-EnvValue([string]$Path, [string]$Key, [string]$Value, [string]$ExamplePath) {
    if (-not (Test-Path $Path)) {
        if (Test-Path $ExamplePath) { Copy-Item -LiteralPath $ExamplePath -Destination $Path -Force }
        else { New-Item -ItemType File -Path $Path -Force | Out-Null }
    }
    $lines = @(Get-Content -LiteralPath $Path -Encoding UTF8)
    $pattern = '^' + [regex]::Escape($Key) + '='
    $found = $false
    $out = foreach ($line in $lines) {
        if ($line -match $pattern) {
            $found = $true
            "$Key=$Value"
        } else { $line }
    }
    if (-not $found) { $out += "$Key=$Value" }
    Set-Content -LiteralPath $Path -Value $out -Encoding UTF8
}

function Invoke-Psql([string]$Db, [string[]]$ExtraArgs, [hashtable]$Config, [string]$Bin) {
    $env:PGPASSWORD = $Config.PGPASSWORD
    $psql = Join-Path $Bin 'psql.exe'
    $baseArgs = @('-X','-v','ON_ERROR_STOP=1','-h',$Config.PGHOST,'-p',$Config.PGPORT,'-U',$Config.PGUSER,'-d',$Db)
    & $psql @baseArgs @ExtraArgs
    if ($LASTEXITCODE -ne 0) { throw "PostgreSQL a retourne le code $LASTEXITCODE." }
}

function Test-Connection([hashtable]$Config, [string]$Bin) {
    try {
        $env:PGPASSWORD = $Config.PGPASSWORD
        $psql = Join-Path $Bin 'psql.exe'
        $result = & $psql -X -Atq -h $Config.PGHOST -p $Config.PGPORT -U $Config.PGUSER -d postgres -c 'SELECT 1;' 2>$null
        return ($LASTEXITCODE -eq 0 -and ($result -join '').Trim() -eq '1')
    } catch { return $false }
}

function Try-StartPostgresService {
    $services = Get-Service -Name 'postgresql*' -ErrorAction SilentlyContinue
    foreach ($service in $services) {
        if ($service.Status -ne 'Running') {
            try {
                Write-Host "[INFO] Demarrage du service Windows $($service.Name)..."
                Start-Service -Name $service.Name -ErrorAction Stop
                $service.WaitForStatus('Running', [TimeSpan]::FromSeconds(15))
            } catch {
                Write-Host '[AVERTISSEMENT] Le service PostgreSQL est arrete et n a pas pu etre demarre automatiquement.' -ForegroundColor Yellow
                Write-Host 'Ouvrez Services Windows ou relancez le lanceur en tant qu administrateur.' -ForegroundColor Yellow
            }
        }
    }
}

function Ensure-Database([hashtable]$Config, [string]$Bin) {
    $env:PGPASSWORD = $Config.PGPASSWORD
    $psql = Join-Path $Bin 'psql.exe'
    $exists = & $psql -X -Atq -h $Config.PGHOST -p $Config.PGPORT -U $Config.PGUSER -d postgres -c "SELECT 1 FROM pg_database WHERE datname='$DatabaseName';"
    if ($LASTEXITCODE -ne 0) { throw 'Impossible de verifier la base PostgreSQL.' }
    if (($exists -join '').Trim() -ne '1') {
        Write-Host "[INFO] Creation de la base $DatabaseName..."
        & $psql -X -v ON_ERROR_STOP=1 -h $Config.PGHOST -p $Config.PGPORT -U $Config.PGUSER -d postgres -c "CREATE DATABASE $DatabaseName ENCODING 'UTF8';"
        if ($LASTEXITCODE -ne 0) { throw 'Echec de creation de la base e-Commune.' }
    }

    $initialized = & $psql -X -Atq -h $Config.PGHOST -p $Config.PGPORT -U $Config.PGUSER -d $DatabaseName -c "SELECT CASE WHEN to_regclass('public.communes') IS NULL THEN '0' ELSE '1' END;"
    if ($LASTEXITCODE -ne 0) { throw 'Impossible de verifier le schema e-Commune.' }
    if (($initialized -join '').Trim() -ne '1') {
        Write-Host '[INFO] Initialisation du schema e-Commune...'
        Invoke-Psql -Db $DatabaseName -ExtraArgs @('-f',$SchemaFile) -Config $Config -Bin $Bin
        Write-Host '[INFO] Chargement du pilote Kasa-Vubu...'
        Invoke-Psql -Db $DatabaseName -ExtraArgs @('-f',$PilotFile) -Config $Config -Bin $Bin
    }

    if (Test-Path $MigrationDir) {
        Get-ChildItem -LiteralPath $MigrationDir -Filter '*.sql' -File | Sort-Object Name | ForEach-Object {
            Write-Host "[INFO] Verification migration $($_.Name)..."
            Invoke-Psql -Db $DatabaseName -ExtraArgs @('-f',$_.FullName) -Config $Config -Bin $Bin
        }
    }
}

function Write-AppEnvironment([hashtable]$Config) {
    $u = [uri]::EscapeDataString($Config.PGUSER)
    $p = [uri]::EscapeDataString($Config.PGPASSWORD)
    $h = $Config.PGHOST
    $port = $Config.PGPORT
    $url = "postgresql://${u}:${p}@${h}:${port}/${DatabaseName}"
    Set-EnvValue -Path $RootEnv -Key 'DATABASE_URL' -Value $url -ExamplePath $RootEnvExample
    Set-EnvValue -Path $RootEnv -Key 'DATABASE_POOL_MAX' -Value '10' -ExamplePath $RootEnvExample
    Set-EnvValue -Path $RootEnv -Key 'DATABASE_SSL' -Value 'false' -ExamplePath $RootEnvExample
    Set-EnvValue -Path $WebEnv -Key 'DATABASE_URL' -Value $url -ExamplePath $WebEnvExample
    Set-EnvValue -Path $WebEnv -Key 'DATABASE_POOL_MAX' -Value '10' -ExamplePath $WebEnvExample
    Set-EnvValue -Path $WebEnv -Key 'DATABASE_SSL' -Value 'false' -ExamplePath $WebEnvExample
}

try {
    $bin = Find-PostgresBin
    if (-not $bin) {
        Write-Host '[ERREUR] PostgreSQL pour Windows est introuvable.' -ForegroundColor Red
        Write-Host 'Installez PostgreSQL 16 ou plus recent avec les outils en ligne de commande (psql), puis relancez e-Commune.' -ForegroundColor Yellow
        Write-Host 'Page officielle : https://www.postgresql.org/download/windows/'
        exit 20
    }
    Write-Host "[OK] PostgreSQL detecte : $bin" -ForegroundColor Green

    Try-StartPostgresService

    $config = Read-KeyValueFile $ConfigPath
    if ($Reconfigure -or -not $config.ContainsKey('PGPASSWORD')) {
        $config = Prompt-Config
        Save-LocalConfig $config
    }

    if (-not (Test-Connection -Config $config -Bin $bin)) {
        if (-not $Reconfigure) {
            Write-Host '[INFO] Connexion PostgreSQL impossible avec la configuration enregistree.' -ForegroundColor Yellow
            $config = Prompt-Config
            Save-LocalConfig $config
        }
        if (-not (Test-Connection -Config $config -Bin $bin)) {
            throw 'Connexion PostgreSQL impossible. Verifiez le service, le port, l utilisateur et le mot de passe.'
        }
    }
    Write-Host '[OK] Connexion PostgreSQL locale valide.' -ForegroundColor Green

    if ($Action -eq 'Test') { exit 0 }

    if ($Action -eq 'Reset') {
        $env:PGPASSWORD = $config.PGPASSWORD
        $psql = Join-Path $bin 'psql.exe'
        Write-Host "[INFO] Reinitialisation de $DatabaseName..." -ForegroundColor Yellow
        & $psql -X -v ON_ERROR_STOP=1 -h $config.PGHOST -p $config.PGPORT -U $config.PGUSER -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='$DatabaseName' AND pid <> pg_backend_pid();"
        if ($LASTEXITCODE -ne 0) { throw 'Impossible de terminer les connexions existantes.' }
        & $psql -X -v ON_ERROR_STOP=1 -h $config.PGHOST -p $config.PGPORT -U $config.PGUSER -d postgres -c "DROP DATABASE IF EXISTS $DatabaseName;"
        if ($LASTEXITCODE -ne 0) { throw 'Impossible de supprimer la base existante.' }
    }

    Ensure-Database -Config $config -Bin $bin
    Write-AppEnvironment -Config $config
    Write-Host '[OK] Base e-Commune prete sans Docker.' -ForegroundColor Green
    exit 0
} catch {
    Write-Host "[ERREUR] $($_.Exception.Message)" -ForegroundColor Red
    exit 1
} finally {
    Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
}
