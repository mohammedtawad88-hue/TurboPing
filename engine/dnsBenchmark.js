/**
 * TurboPing - Live Gaming DNS Benchmark & Switcher Engine
 */

const { exec } = require('child_process');
const net = require('net');

const GAMING_DNS_SERVERS = [
  {
    id: 'cloudflare',
    name: 'Cloudflare Gaming',
    primary: '1.1.1.1',
    secondary: '1.0.0.1',
    description: 'Fastest global resolver, optimized for gaming routes.'
  },
  {
    id: 'google',
    name: 'Google Public DNS',
    primary: '8.8.8.8',
    secondary: '8.8.4.4',
    description: 'Extensive worldwide network, highly reliable.'
  },
  {
    id: 'quad9',
    name: 'Quad9 DNS',
    primary: '9.9.9.9',
    secondary: '149.112.112.112',
    description: 'Low-latency routing with real-time threat blocking.'
  },
  {
    id: 'opendns',
    name: 'OpenDNS',
    primary: '208.67.222.222',
    secondary: '208.67.220.220',
    description: 'High reliability Cisco-backed DNS.'
  },
  {
    id: 'adguard',
    name: 'AdGuard Ad-Block DNS',
    primary: '94.140.14.14',
    secondary: '94.140.15.15',
    description: 'Blocks tracker ads and telemetry.'
  }
];

function pingIp(ip) {
  return new Promise((resolve) => {
    exec(`ping -n 1 -w 1000 ${ip}`, { windowsHide: true }, (err, stdout) => {
      if (err || !stdout) return resolve(999);
      // Handles both "time=3ms" and "time<1ms"
      const match = stdout.match(/time[=<](\d+)ms/i);
      if (match) {
        resolve(parseInt(match[1], 10));
      } else if (stdout.includes('time<1ms')) {
        resolve(1);
      } else {
        resolve(999);
      }
    });
  });
}

/**
 * Benchmark all DNS servers and return sorted list
 */
async function benchmarkDNS() {
  const results = [];
  for (const dns of GAMING_DNS_SERVERS) {
    // Run 2 probes and take average
    const p1 = await pingIp(dns.primary);
    const p2 = await pingIp(dns.primary);
    const avg = Math.min(p1, p2);

    results.push({
      ...dns,
      ping: avg >= 999 ? 'Timeout' : `${avg} ms`,
      pingValue: avg
    });
  }

  results.sort((a, b) => a.pingValue - b.pingValue);
  return results;
}

/**
 * Apply selected DNS to active adapter
 */
function applyDNS(adapterName, primary, secondary) {
  return new Promise((resolve) => {
    const cmd1 = `netsh interface ipv4 set dnsservers name="${adapterName}" static ${primary} primary`;
    const cmd2 = secondary ? `netsh interface ipv4 add dnsservers name="${adapterName}" ${secondary} index=2` : '';
    const flushCmd = `ipconfig /flushdns`;

    exec(`${cmd1} & ${cmd2} & ${flushCmd}`, { windowsHide: true }, (err) => {
      if (err) resolve({ success: false, error: err.message });
      else resolve({ success: true, primary, secondary });
    });
  });
}

/**
 * Reset DNS to automatic (DHCP / ISP default)
 */
function restoreDefaultDNS(adapterName) {
  return new Promise((resolve) => {
    const cmd = `netsh interface ipv4 set dnsservers name="${adapterName}" source=dhcp & ipconfig /flushdns`;
    exec(cmd, { windowsHide: true }, (err) => {
      if (err) resolve({ success: false, error: err.message });
      else resolve({ success: true });
    });
  });
}

module.exports = {
  GAMING_DNS_SERVERS,
  benchmarkDNS,
  applyDNS,
  restoreDefaultDNS
};
