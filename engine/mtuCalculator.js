/**
 * TurboPing - MTU Auto-Discovery & Packet Loss Optimizer Engine
 * Discovers unfragmented MTU boundary to eliminate packet loss.
 */

const { exec } = require('child_process');

function pingWithSize(target, size) {
  return new Promise((resolve) => {
    // -f: Do not fragment, -l: packet buffer size, -n 1: 1 probe, -w 800: timeout
    exec(`ping ${target} -f -l ${size} -n 1 -w 800`, { windowsHide: true }, (err, stdout) => {
      if (err || !stdout) return resolve(false);
      // If packet needs to be fragmented, Windows outputs: "Packet needs to be fragmented but DF set."
      if (stdout.includes('Packet needs to be fragmented') || stdout.includes('fragmented')) {
        return resolve(false);
      }
      if (stdout.includes('Reply from') || stdout.includes('bytes=')) {
        return resolve(true);
      }
      resolve(false);
    });
  });
}

/**
 * Auto-detect optimal unfragmented MTU
 */
async function findOptimalMTU(target = '1.1.1.1') {
  // Test common sizes: 1472 (+28=1500), 1464 (+28=1492), 1452 (+28=1480), etc.
  const testSizes = [1472, 1464, 1452, 1440, 1432, 1420, 1400];

  for (const size of testSizes) {
    const success = await pingWithSize(target, size);
    if (success) {
      const optimalMTU = size + 28;
      return {
        optimalMTU,
        packetSize: size,
        status: 'Optimal (No Fragmentation)'
      };
    }
  }

  // Fallback to standard 1500 if ping is blocked by firewall
  return {
    optimalMTU: 1500,
    packetSize: 1472,
    status: 'Standard Fallback (1500)'
  };
}

/**
 * Apply MTU to specified adapter
 */
function applyMTU(adapterName, mtuValue) {
  return new Promise((resolve) => {
    const cmd = `netsh interface ipv4 set subinterface "${adapterName}" mtu=${mtuValue} store=persistent`;
    exec(cmd, { windowsHide: true }, (err) => {
      if (err) resolve({ success: false, error: err.message });
      else resolve({ success: true, mtu: mtuValue });
    });
  });
}

/**
 * Get current MTU of active adapters
 */
function getCurrentMTU(adapterName) {
  return new Promise((resolve) => {
    exec(`netsh interface ipv4 show subinterfaces`, { windowsHide: true }, (err, stdout) => {
      if (err || !stdout) return resolve({ mtu: 1500 });
      const lines = stdout.split('\r\n');
      for (const line of lines) {
        if (line.includes(adapterName)) {
          const parts = line.trim().split(/\s+/);
          const mtu = parseInt(parts[0], 10);
          if (!isNaN(mtu)) return resolve({ mtu });
        }
      }
      resolve({ mtu: 1500 });
    });
  });
}

module.exports = {
  findOptimalMTU,
  applyMTU,
  getCurrentMTU
};
