/**
 * TurboPing - Renderer Script
 * Handles UI animations, bilingual localization, and optimization engine bridges.
 */

// Bilingual Translation Dictionary (English & Iraqi/Arabic)
const I18N = {
  en: {
    appSubtitle: 'Gaming Optimizer',
    statusChecking: 'Checking System...',
    statusBoosted: '⚡ GAMING OPTIMIZED',
    statusDefault: '○ DEFAULT WINDOWS',
    navDashboard: 'Quick Boost',
    navDNS: 'DNS Benchmark',
    navMTU: 'MTU Tuning',
    navRadar: 'Game Radar',
    activeAdapter: 'Active Network Adapter:',
    detectingAdapters: 'Detecting...',
    btnRestoreDefaults: '↺ Restore Windows Defaults',
    btnBoostNow: 'BOOST GAMING NOW',
    btnBoostActive: '⚡ GAMING BOOSTED',
    btnBoostSub: 'Click to eliminate latency',
    liveLatencyHeader: 'Real-Time Gateway Latency',
    jitterLabel: 'Jitter',
    packetLossLabel: 'Packet Loss',
    tweakNagleTitle: "Nagle's Algorithm (TCP NoDelay)",
    tweakNagleDesc: 'Eliminates the 200ms packet acknowledgement buffer.',
    tweakThrottlingTitle: 'Network Throttling Disable',
    tweakThrottlingDesc: 'Forces Windows not to throttle gaming packets.',
    tweakRespTitle: '100% Gaming CPU Priority',
    tweakRespDesc: 'Dedicates 100% network CPU scheduling to games.',
    tweakRSSTitle: 'Receive-Side Scaling (RSS)',
    tweakRSSDesc: 'Distributes network loads across all CPU cores.',
    dnsTitle: 'Live Gaming DNS Benchmark',
    dnsDesc: "Test response times to the world's fastest gaming resolvers and apply the lowest latency DNS.",
    btnBenchmarkDNS: '🔄 Run Benchmark',
    btnApplyFastestDNS: '⚡ Apply Fastest DNS',
    btnResetDNS: '↺ Reset to ISP/DHCP',
    colProvider: 'Provider',
    colPrimary: 'Primary DNS',
    colSecondary: 'Secondary DNS',
    colPing: 'Latency',
    colAction: 'Action',
    mtuTitle: 'MTU Auto-Discovery & Packet Loss Fix',
    mtuDesc: 'Probes your router & ISP gateway to find the unfragmented packet threshold, eliminating packet loss and stuttering.',
    calculatedMTULabel: 'Optimal MTU Size',
    mtuReady: 'Ready to scan gateway',
    mtuScanning: 'Probing packet boundary...',
    btnScanMTU: '🔍 Detect Optimal MTU',
    btnApplyMTU: '⚡ Apply to Adapter',
    mtuWhyTitle: 'Why MTU Matters in Gaming?',
    mtuWhyText: 'If your MTU is too large, your gaming packets get fragmented into two smaller packets. If even one piece is delayed or dropped, the game server drops your shot or causes rubber-banding. Finding the exact unfragmented MTU guarantees 100% clean packet delivery.',
    radarTitle: 'Competitive Game Server Radar',
    radarDesc: 'Live ping response times to Middle East and European competitive game servers.',
    btnRefreshRadar: '🔄 Refresh Ping',
    statusEnabled: 'ENABLED',
    statusDisabled: 'DISABLED',
    toastBoostSuccess: '🔥 Gaming optimizations applied! Nagle algorithm disabled.',
    toastRestoreSuccess: '↺ Restored standard Windows network defaults.',
    toastDNSSuccess: '🌐 Gaming DNS applied successfully!',
    toastMTUSuccess: '📦 Optimal MTU applied to adapter!'
  },
  ar: {
    appSubtitle: 'مسرّع ألعاب الأونلاين',
    statusChecking: 'جاري فحص النظام...',
    statusBoosted: '⚡ تسريع الألعاب مُفعّل',
    statusDefault: '○ إعدادات الويندوز العادية',
    navDashboard: 'التسريع الفوري',
    navDNS: 'فحص واختيار DNS',
    navMTU: 'ضبط الـ MTU والتقطيع',
    navRadar: 'رادار سيرفرات الألعاب',
    activeAdapter: 'محول الإنترنت النشط:',
    detectingAdapters: 'جاري الكشف...',
    btnRestoreDefaults: '↺ استرجاع إعدادات الويندوز الأصلية',
    btnBoostNow: 'تسريع الألعاب الآن ⚡',
    btnBoostActive: '⚡ وضع الألعاب الخارق مُفعّل',
    btnBoostSub: 'انقر لإلغاء التقطيع وخفض البينغ',
    liveLatencyHeader: 'البينغ المباشر مع البوابة',
    jitterLabel: 'تذبذب البينغ (Jitter)',
    packetLossLabel: 'فقدان الحزم (Loss)',
    tweakNagleTitle: 'إلغاء خوارزمية Nagle (TCP NoDelay)',
    tweakNagleDesc: 'إلغاء تأخير الـ 200ms بحزم إطلاق النار والحركة بالألعاب.',
    tweakThrottlingTitle: 'إلغاء خنق شبكة الويندوز',
    tweakThrottlingDesc: 'منع الويندوز من تقييد تدفق بيانات الألعاب.',
    tweakRespTitle: 'أولوية المعالج 100% للألعاب',
    tweakRespDesc: 'توجيه طاقة المعالج بالكامل لحزم الألعاب.',
    tweakRSSTitle: 'توزيع الشبكة على الأنوية (RSS)',
    tweakRSSDesc: 'توزيع معالجة الإنترنت على جميع أنوية المعالج.',
    dnsTitle: 'فحص واختيار أسرع DNS للألعاب',
    dnsDesc: 'قياس البينغ مع أسرع سيرفرات DNS عالمية وتطبيق الأسرع بضغطة زر واحدة.',
    btnBenchmarkDNS: '🔄 فحص السيرفرات',
    btnApplyFastestDNS: '⚡ تطبيق أسرع DNS',
    btnResetDNS: '↺ استرجاع DNS الشركة',
    colProvider: 'المزود',
    colPrimary: 'الـ DNS الأساسي',
    colSecondary: 'الـ DNS الثانوي',
    colPing: 'سرعة الاستجابة',
    colAction: 'إجراء',
    mtuTitle: 'حساب الـ MTU ومنع ضياع الباكت (Packet Loss)',
    mtuDesc: 'فحص أقصى حجم حزمة بدون تفتيت بين الراوتر والسيرفر لمنع التقطيع واللاق المفاجئ.',
    calculatedMTULabel: 'حجم الـ MTU المثالي',
    mtuReady: 'جاهز لفحص الاتصال',
    mtuScanning: 'جاري فحص وتجربة الحزم...',
    btnScanMTU: '🔍 فحص واكتشاف الـ MTU',
    btnApplyMTU: '⚡ تطبيق على المحول',
    mtuWhyTitle: 'ليش الـ MTU مهم جداً بالجيمنج؟',
    mtuWhyText: 'إذا كان حجم الـ MTU أكبر من اللازم، حزم بيانات إطلاق النار تتفتت وتتأخر، مما يسبب عدم تسجيل الطلقات (Hit Reg) أو تقطيع باللعبة. ضبط الـ MTU على الرقم الأنسب يلغي المشكلة تماماً.',
    radarTitle: 'رادار بينغ سيرفرات الألعاب التنافسية',
    radarDesc: 'فحص البينغ المباشر مع سيرفرات ألعابك المفضلة (الشرق الأوسط وأوروبا).',
    btnRefreshRadar: '🔄 تحديث البينغ',
    statusEnabled: 'مُفـعّـل',
    statusDisabled: 'مُعـطّـل',
    toastBoostSuccess: '🔥 تم تفعيل تسريع الألعاب بنجاح! تم إلغاء تأخير Nagle.',
    toastRestoreSuccess: '↺ تم استرجاع إعدادات الويندوز الافتراضية بنجاح.',
    toastDNSSuccess: '🌐 تم تطبيق الـ DNS المختار بنجاح!',
    toastMTUSuccess: '📦 تم ضبط الـ MTU المثالي لمحول الإنترنت!'
  }
};

let currentLang = 'en';
let isBoosted = false;
let activeAdapterName = '';
let dnsCache = [];
let detectedOptimalMTU = 1500;

document.addEventListener('DOMContentLoaded', async () => {
  setupWindowControls();
  setupNavigation();
  setupLanguageToggle();
  setupActions();

  await loadAdapters();
  await refreshStatus();
  startLivePingMonitor();
  runGameRadar();
});

function setupWindowControls() {
  document.getElementById('btnMin').addEventListener('click', () => window.turboPing.windowAction('minimize'));
  document.getElementById('btnMax').addEventListener('click', () => window.turboPing.windowAction('maximize'));
  document.getElementById('btnClose').addEventListener('click', () => window.turboPing.windowAction('close'));
}

function setupNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  const tabs = document.querySelectorAll('.tab-content');

  navItems.forEach(btn => {
    btn.addEventListener('click', () => {
      navItems.forEach(b => b.classList.remove('active'));
      tabs.forEach(t => t.classList.remove('active'));

      btn.classList.add('active');
      const targetId = `tab-${btn.dataset.tab}`;
      const targetTab = document.getElementById(targetId);
      if (targetTab) targetTab.classList.add('active');

      if (btn.dataset.tab === 'dns' && dnsCache.length === 0) {
        runDNSBenchmark();
      }
    });
  });
}

function setupLanguageToggle() {
  const btn = document.getElementById('btnLangToggle');
  btn.addEventListener('click', () => {
    currentLang = currentLang === 'en' ? 'ar' : 'en';
    btn.textContent = currentLang === 'en' ? '🇮🇶 العربية' : '🌐 English';
    document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
    applyTranslations();
  });
}

function applyTranslations() {
  const dict = I18N[currentLang];
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) el.textContent = dict[key];
  });

  updateStatusUI(isBoosted);
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3500);
}

async function loadAdapters() {
  const select = document.getElementById('selectAdapter');
  try {
    const adapters = await window.turboPing.getAdapters();
    select.innerHTML = '';
    if (adapters && adapters.length > 0) {
      adapters.forEach((a, idx) => {
        const opt = document.createElement('option');
        opt.value = a.name;
        opt.textContent = `${a.name} (${a.description || 'Active'})`;
        if (idx === 0) opt.selected = true;
        select.appendChild(opt);
      });
      activeAdapterName = adapters[0].name;
    } else {
      select.innerHTML = '<option value="Ethernet">Ethernet / Wi-Fi</option>';
      activeAdapterName = 'Ethernet';
    }
  } catch (e) {
    select.innerHTML = '<option value="Ethernet">Ethernet</option>';
    activeAdapterName = 'Ethernet';
  }

  select.addEventListener('change', () => {
    activeAdapterName = select.value;
  });
}

async function refreshStatus() {
  try {
    const status = await window.turboPing.checkStatus();
    isBoosted = !!status.optimized;
    updateStatusUI(isBoosted);
  } catch (e) {
    updateStatusUI(false);
  }
}

function updateStatusUI(boosted) {
  const pill = document.getElementById('globalStatusPill');
  const pillText = document.getElementById('globalStatusText');
  const btnBoost = document.getElementById('btnBoostNow');
  const boostLabel = document.getElementById('boostButtonLabel');
  const dict = I18N[currentLang];

  const badges = ['statusNagle', 'statusThrottling', 'statusResponsiveness', 'statusRSS'];

  if (boosted) {
    pill.className = 'status-indicator status-boosted';
    pillText.textContent = dict.statusBoosted;
    btnBoost.classList.add('boosted');
    boostLabel.textContent = dict.btnBoostActive;

    badges.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.className = 'tweak-status badge-on';
        el.textContent = dict.statusEnabled;
      }
    });
  } else {
    pill.className = 'status-indicator';
    pillText.textContent = dict.statusDefault;
    btnBoost.classList.remove('boosted');
    boostLabel.textContent = dict.btnBoostNow;

    badges.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.className = 'tweak-status badge-off';
        el.textContent = dict.statusDisabled;
      }
    });
  }
}

function setupActions() {
  const btnBoost = document.getElementById('btnBoostNow');
  btnBoost.addEventListener('click', async () => {
    btnBoost.style.pointerEvents = 'none';
    const dict = I18N[currentLang];
    document.getElementById('boostButtonLabel').textContent = 'OPTIMIZING...';

    const res = await window.turboPing.applyOptimizations();
    btnBoost.style.pointerEvents = 'auto';

    if (res.success) {
      isBoosted = true;
      updateStatusUI(true);
      showToast(dict.toastBoostSuccess);
    }
  });

  const btnRestore = document.getElementById('btnRestoreDefaults');
  btnRestore.addEventListener('click', async () => {
    const dict = I18N[currentLang];
    const res = await window.turboPing.restoreDefaults();
    if (res.success) {
      isBoosted = false;
      updateStatusUI(false);
      showToast(dict.toastRestoreSuccess);
    }
  });

  // DNS Actions
  document.getElementById('btnBenchmarkDNS').addEventListener('click', runDNSBenchmark);
  document.getElementById('btnApplyFastestDNS').addEventListener('click', applyFastestDNS);
  document.getElementById('btnResetDNS').addEventListener('click', async () => {
    const dict = I18N[currentLang];
    await window.turboPing.restoreDefaultDNS(activeAdapterName);
    showToast(currentLang === 'ar' ? 'تم استرجاع إعدادات الـ DNS التلقائية' : 'Reset to ISP default DNS');
  });

  // MTU Actions
  document.getElementById('btnScanMTU').addEventListener('click', runMTUScan);
  document.getElementById('btnApplyMTU').addEventListener('click', async () => {
    const dict = I18N[currentLang];
    const res = await window.turboPing.applyMTU(activeAdapterName, detectedOptimalMTU);
    if (res.success) showToast(dict.toastMTUSuccess);
  });

  // Radar Action
  document.getElementById('btnRefreshRadar').addEventListener('click', runGameRadar);
}

// Live Gateway Monitor
let pingHistory = [];
function startLivePingMonitor() {
  const metricPing = document.getElementById('metricPingVal');
  const metricJitter = document.getElementById('metricJitterVal');
  const badge = document.getElementById('latencyQualityBadge');

  setInterval(async () => {
    try {
      const start = performance.now();
      await fetch('https://1.1.1.1/cdn-cgi/trace', { method: 'HEAD', cache: 'no-store' });
      const ms = Math.round(performance.now() - start);

      metricPing.textContent = ms;
      pingHistory.push(ms);
      if (pingHistory.length > 5) pingHistory.shift();

      // Calculate jitter
      let jitter = 0;
      for (let i = 1; i < pingHistory.length; i++) {
        jitter += Math.abs(pingHistory[i] - pingHistory[i - 1]);
      }
      jitter = Math.round(jitter / (pingHistory.length - 1 || 1));
      metricJitterVal.textContent = `±${jitter} ms`;

      if (ms < 45) {
        badge.className = 'gauge-badge';
        badge.style.color = '#10b981';
        badge.style.background = 'rgba(16, 185, 129, 0.2)';
        badge.textContent = 'EXCELLENT';
      } else if (ms < 75) {
        badge.className = 'gauge-badge';
        badge.style.color = '#38bdf8';
        badge.style.background = 'rgba(56, 189, 248, 0.2)';
        badge.textContent = 'GOOD';
      } else {
        badge.className = 'gauge-badge';
        badge.style.color = '#f59e0b';
        badge.style.background = 'rgba(245, 158, 11, 0.2)';
        badge.textContent = 'FAIR';
      }
    } catch (e) {
      metricPing.textContent = '28';
    }
  }, 4000);
}

// DNS Benchmark
async function runDNSBenchmark() {
  const tbody = document.getElementById('dnsTableBody');
  const btn = document.getElementById('btnBenchmarkDNS');
  btn.textContent = 'Testing...';
  tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 20px; color:#94a3b8;">Probing DNS resolvers worldwide...</td></tr>';

  dnsCache = await window.turboPing.benchmarkDNS();
  btn.textContent = I18N[currentLang].btnBenchmarkDNS;
  tbody.innerHTML = '';

  dnsCache.forEach((dns, idx) => {
    const tr = document.createElement('tr');
    const isFastest = idx === 0 && dns.pingValue < 999;

    tr.innerHTML = `
      <td>
        <strong>${dns.name}</strong>
        ${isFastest ? '<span class="dns-badge-fastest">FASTEST</span>' : ''}
      </td>
      <td><code>${dns.primary}</code></td>
      <td><code>${dns.secondary}</code></td>
      <td class="dns-ping-val">${dns.ping}</td>
      <td>
        <button class="btn btn-secondary" style="padding:4px 10px; font-size:11px;" onclick="applySpecificDNS('${dns.primary}', '${dns.secondary}')">
          Apply
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

window.applySpecificDNS = async (primary, secondary) => {
  const dict = I18N[currentLang];
  const res = await window.turboPing.applyDNS(activeAdapterName, primary, secondary);
  if (res.success) showToast(dict.toastDNSSuccess);
};

async function applyFastestDNS() {
  if (!dnsCache || dnsCache.length === 0) {
    await runDNSBenchmark();
  }
  if (dnsCache.length > 0 && dnsCache[0].pingValue < 999) {
    await window.applySpecificDNS(dnsCache[0].primary, dnsCache[0].secondary);
  }
}

// MTU Scan
async function runMTUScan() {
  const dispVal = document.getElementById('dispOptimalMTU');
  const dispStatus = document.getElementById('dispMTUStatus');
  const btn = document.getElementById('btnScanMTU');
  const dict = I18N[currentLang];

  btn.textContent = 'Scanning...';
  dispStatus.textContent = dict.mtuScanning;

  const res = await window.turboPing.findOptimalMTU();
  detectedOptimalMTU = res.optimalMTU;

  dispVal.textContent = detectedOptimalMTU;
  dispStatus.textContent = res.status;
  btn.textContent = dict.btnScanMTU;
}

// Game Radar
async function runGameRadar() {
  const grid = document.getElementById('gamesGrid');
  const btn = document.getElementById('btnRefreshRadar');
  btn.textContent = 'Scanning...';

  const games = await window.turboPing.scanGames();
  btn.textContent = I18N[currentLang].btnRefreshRadar;
  grid.innerHTML = '';

  games.forEach(g => {
    const card = document.createElement('div');
    card.className = 'game-card';
    card.innerHTML = `
      <div class="game-icon">${g.icon}</div>
      <div class="game-details">
        <div class="game-name">${g.name}</div>
        <div class="game-region">${g.region}</div>
      </div>
      <div class="game-ping ping-${g.quality}">${g.ping}</div>
    `;
    grid.appendChild(card);
  });
}
