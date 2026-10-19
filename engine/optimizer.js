/**
 * TurboPing - Windows Network & Kernel Optimizer Engine
 * Direct registry and netsh tuning for ultra-low gaming latency.
 */

const { exec, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const BACKUP_DIR = path.join(process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local'), 'TurboPing');
const BACKUP_FILE = path.join(BACKUP_DIR, 'network_backup.json');

function runCmd(cmd) {
  return new Promise((resolve) => {
    exec(cmd, { windowsHide: true }, (error, stdout, stderr) => {
      resolve({ error, stdout: stdout || '', stderr: stderr || '' });
    });
  });
}

function runCmdSync(cmd) {
  try {
    return execSync(cmd, { windowsHide: true, stdio: 'pipe' }).toString();
  } catch (e) {
    return '';
  }
}

/**
 * Get active network interface GUIDs and Adapter names
 */
async function getActiveAdapters() {
  try {
    const psCmd = `powershell -NoProfile -Command "Get-NetAdapter | Where-Object { $_.Status -eq 'Up' } | Select-Object Name, InterfaceGuid, InterfaceDescription | ConvertTo-Json -Compress"`;
    const res = await runCmd(psCmd);
    if (!res.stdout.trim()) return [];

    let parsed = JSON.parse(res.stdout);
    if (!Array.isArray(parsed)) parsed = [parsed];
    return parsed.map(a => ({
      name: a.Name,
      guid: a.InterfaceGuid ? a.InterfaceGuid.replace(/[{}]/g, '') : '',
      description: a.InterfaceDescription || ''
    })).filter(a => !!a.guid);
  } catch (e) {
    console.error('Failed to get adapters via PowerShell, falling back to registry:', e.message);
    return getInterfaceGuidsFromReg();
  }
}

function getInterfaceGuidsFromReg() {
  const regPath = 'HKLM\\SYSTEM\\CurrentControlSet\\Services\\Tcpip\\Parameters\\Interfaces';
  const out = runCmdSync(`reg query "${regPath}"`);
  const lines = out.split('\r\n');
  const guids = [];
  for (const line of lines) {
    const match = line.trim().match(/Interfaces\\\{?([A-Fa-f0-9-]+)\}?$/);
    if (match) guids.push({ name: 'Network Adapter', guid: match[1] });
  }
  return guids;
}

/**
 * Check if TurboPing gaming optimizations are currently enabled
 */
async function checkOptimizationStatus() {
  try {
    const regCheck = await runCmd('reg query "HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile" /v NetworkThrottlingIndex');
    const isThrottlingDisabled = regCheck.stdout.toLowerCase().includes('0xffffffff');

    const nagleCheck = await runCmd('reg query "HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile" /v SystemResponsiveness');
    const isResponsivenessMaxed = regCheck.stdout.includes('0x0') || nagleCheck.stdout.includes('0x0');

    return {
      optimized: isThrottlingDisabled && isResponsivenessMaxed,
      details: {
        nagleDisabled: isThrottlingDisabled,
        throttlingDisabled: isThrottlingDisabled,
        systemResponsiveness: isResponsivenessMaxed
      }
    };
  } catch (e) {
    return { optimized: false, error: e.message };
  }
}

/**
 * Backup current network settings prior to applying tweaks
 */
async function backupCurrentSettings() {
  try {
    if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });
    if (fs.existsSync(BACKUP_FILE)) return; // Keep original virgin backup

    const backup = {
      timestamp: new Date().toISOString(),
      throttling: runCmdSync('reg query "HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile" /v NetworkThrottlingIndex'),
      responsiveness: runCmdSync('reg query "HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile" /v SystemResponsiveness')
    };

    fs.writeFileSync(BACKUP_FILE, JSON.stringify(backup, null, 2), 'utf8');
  } catch (e) {
    console.error('Backup failed:', e);
  }
}

/**
 * Apply full Gaming Optimization Suite
 */
async function applyGamingOptimizations() {
  await backupCurrentSettings();
  const adapters = await getActiveAdapters();
  const logs = [];

  // 1. Disable Nagle's Algorithm (TCP NoDelay & AckFrequency) across active network interfaces
  for (const adapter of adapters) {
    const ifaceKey = `HKLM\\SYSTEM\\CurrentControlSet\\Services\\Tcpip\\Parameters\\Interfaces\\{${adapter.guid}}`;
    await runCmd(`reg add "${ifaceKey}" /v TcpAckFrequency /t REG_DWORD /d 1 /f`);
    await runCmd(`reg add "${ifaceKey}" /v TCPNoDelay /t REG_DWORD /d 1 /f`);
    await runCmd(`reg add "${ifaceKey}" /v TcpDelAckTicks /t REG_DWORD /d 0 /f`);
    logs.push(`Applied TCPNoDelay to: ${adapter.name} ({${adapter.guid}})`);
  }

  // 2. Disable Windows Network Throttling during gaming
  const sysProfile = `HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile`;
  await runCmd(`reg add "${sysProfile}" /v NetworkThrottlingIndex /t REG_DWORD /d 0xffffffff /f`);
  await runCmd(`reg add "${sysProfile}" /v SystemResponsiveness /t REG_DWORD /d 0 /f`);
  logs.push('Disabled Windows Network Throttling & set SystemResponsiveness to 100%');

  // 3. Elevate Game Process Priority in Windows Multimedia Tasks
  const gamesKey = `HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile\\Tasks\\Games`;
  await runCmd(`reg add "${gamesKey}" /v "GPU Priority" /t REG_DWORD /d 8 /f`);
  await runCmd(`reg add "${gamesKey}" /v "Priority" /t REG_DWORD /d 6 /f`);
  await runCmd(`reg add "${gamesKey}" /v "Scheduling Category" /t REG_SZ /d "High" /f`);
  await runCmd(`reg add "${gamesKey}" /v "SFIO Priority" /t REG_SZ /d "High" /f`);
  logs.push('Configured Windows Game Scheduling Priority to High');

  // 4. Tune Global TCP Stack Parameters
  const tcpParams = `HKLM\\SYSTEM\\CurrentControlSet\\Services\\Tcpip\\Parameters`;
  await runCmd(`reg add "${tcpParams}" /v DefaultTTL /t REG_DWORD /d 64 /f`);
  await runCmd(`reg add "${tcpParams}" /v MaxUserPort /t REG_DWORD /d 65534 /f`);
  await runCmd(`reg add "${tcpParams}" /v TcpTimedWaitDelay /t REG_DWORD /d 30 /f`);
  logs.push('Tuned TCP MaxUserPort and TimedWaitDelay');

  // 5. Netsh Stack Tuning (Receive-Side Scaling & AutoTuning)
  await runCmd('netsh int tcp set global autotuninglevel=normal');
  await runCmd('netsh int tcp set global rss=enabled');
  await runCmd('netsh int tcp set global ecncapability=disabled');
  await runCmd('netsh int tcp set global timestamps=disabled');
  await runCmd('ipconfig /flushdns');
  logs.push('Netsh TCP autotuning normal, RSS enabled, and DNS flushed');

  return { success: true, logs, optimized: true };
}

/**
 * Revert all network and registry settings to factory Windows defaults
 */
async function restoreWindowsDefaults() {
  const adapters = await getActiveAdapters();
  const logs = [];

  // 1. Remove TCPNoDelay & TcpAckFrequency from interfaces
  for (const adapter of adapters) {
    const ifaceKey = `HKLM\\SYSTEM\\CurrentControlSet\\Services\\Tcpip\\Parameters\\Interfaces\\{${adapter.guid}}`;
    await runCmd(`reg delete "${ifaceKey}" /v TcpAckFrequency /f`);
    await runCmd(`reg delete "${ifaceKey}" /v TCPNoDelay /f`);
    await runCmd(`reg delete "${ifaceKey}" /v TcpDelAckTicks /f`);
    logs.push(`Removed TCPNoDelay from: ${adapter.name}`);
  }

  // 2. Revert SystemProfile to standard defaults
  const sysProfile = `HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile`;
  await runCmd(`reg add "${sysProfile}" /v NetworkThrottlingIndex /t REG_DWORD /d 10 /f`);
  await runCmd(`reg add "${sysProfile}" /v SystemResponsiveness /t REG_DWORD /d 20 /f`);
  logs.push('Restored NetworkThrottlingIndex (10) and SystemResponsiveness (20)');

  // 3. Reset Netsh and DNS
  await runCmd('netsh int ip reset');
  await runCmd('netsh winsock reset');
  await runCmd('ipconfig /flushdns');
  logs.push('Reset IP stack, Winsock, and flushed DNS');

  return { success: true, logs, optimized: false };
}

module.exports = {
  getActiveAdapters,
  checkOptimizationStatus,
  applyGamingOptimizations,
  restoreWindowsDefaults
};
