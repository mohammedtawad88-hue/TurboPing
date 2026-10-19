/**
 * TurboPing - Game Server Ping Radar
 * Real-time latency monitors for popular competitive games.
 */

const { exec } = require('child_process');

const GAME_SERVERS = [
  {
    id: 'eafc_me',
    name: 'EA Sports FC 24/25',
    region: 'Middle East / Dubai',
    ip: 'ea.com',
    icon: '⚽'
  },
  {
    id: 'pubg_me',
    name: 'PUBG: Battlegrounds',
    region: 'Middle East Edge',
    ip: 'pubg.com',
    icon: '🪖'
  },
  {
    id: 'cs2_steam',
    name: 'Counter-Strike 2 / Steam',
    region: 'Valve Gaming Cluster',
    ip: 'steampowered.com',
    icon: '💣'
  },
  {
    id: 'fortnite_me',
    name: 'Fortnite (Epic Games)',
    region: 'Middle East Edge',
    ip: 'status.epicgames.com',
    icon: '⚡'
  },
  {
    id: 'warzone_cod',
    name: 'Call of Duty: Warzone',
    region: 'Battle.net Cluster',
    ip: 'battle.net',
    icon: '🛡️'
  },
  {
    id: 'valorant_riot',
    name: 'Valorant (Riot Games)',
    region: 'Riot Direct Cluster',
    ip: 'riotgames.com',
    icon: '🎯'
  },
  {
    id: 'discord_voice',
    name: 'Discord Gaming Voice',
    region: 'Low-Latency Gateway',
    ip: 'discord.com',
    icon: '🎙️'
  }
];

function pingTarget(ip) {
  return new Promise((resolve) => {
    exec(`ping -n 1 -w 1000 ${ip}`, { windowsHide: true }, (err, stdout) => {
      if (err || !stdout) return resolve(999);
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
 * Scan all game servers for live ping status
 */
async function scanGameServers() {
  const promises = GAME_SERVERS.map(async (game) => {
    const ms = await pingTarget(game.ip);
    let quality = 'poor';
    if (ms < 45) quality = 'excellent';
    else if (ms < 75) quality = 'good';
    else if (ms < 110) quality = 'fair';

    return {
      ...game,
      ping: ms >= 999 ? 'Timeout' : `${ms} ms`,
      pingValue: ms,
      quality
    };
  });

  return Promise.all(promises);
}

module.exports = {
  GAME_SERVERS,
  scanGameServers
};
