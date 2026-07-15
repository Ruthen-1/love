// ==========================================
// Global Variables
// ==========================================
let messages = [];
let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
let openedEnvelopes = JSON.parse(localStorage.getItem('openedEnvelopes') || '[]');
let memories = JSON.parse(localStorage.getItem('memories') || '[]');
let soundEnabled = localStorage.getItem('soundEnabled') !== 'false';
let darkMode = localStorage.getItem('darkMode') === 'true';
let currentMessage = null;
let currentCategory = null;

// ==========================================
// Sound Generator
// ==========================================
let audioContext = null;

function getAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    return audioContext;
}

function playEnvelopeSound() {
    if (!soundEnabled) return;
    try {
        const ctx = getAudioContext();
        const now = ctx.currentTime;
        
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(600, now);
        osc1.frequency.exponentialRampToValueAtTime(300, now + 0.3);
        gain1.gain.setValueAtTime(0, now);
        gain1.gain.linearRampToValueAtTime(0.3, now + 0.05);
        gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc1.start(now);
        osc1.stop(now + 0.3);
    } catch (e) {
        console.log('Sound error:', e);
    }
}

// ==========================================
// Initialization
// ==========================================
document.addEventListener('DOMContentLoaded', async function() {
    console.log('✅ التطبيق بدأ');
    
    try {
        const response = await fetch('messages.json');
        const data = await response.json();
        messages = data.messages || data;
        console.log('✅ تم تحميل', messages.length, 'رسالة');
    } catch (error) {
        console.log('❌ فشل تحميل messages.json');
        messages = getFallbackMessages();
    }
    
    applyTheme();
    updateStats();
    updateFavCount();
    updateCategoryCounts();
    updateSoundButton();
    console.log('✅ التهيئة انتهت');
});

// ==========================================
// Fallback Messages
// ==========================================
function getFallbackMessages() {
    const msgs = [];
    const colors = ['blue', 'green', 'pink', 'orange'];
    const titles = {
        blue: ['للقلب المتعب', 'للحزن', 'للأيام الصعبة', 'للضغط'],
        green: ['للراحة', 'للأمل', 'للامتنان', 'لبداية جديدة'],
        pink: ['للحب', 'للاشتياق', 'للذكريات', 'للقلب'],
        orange: ['للقوة', 'للإنجاز', 'للحماس', 'للنجاح']
    };
    
    let id = 1;
    colors.forEach(function(color) {
        for (let i = 0; i < 4; i++) {
            msgs.push({
                id: id,
                color: color,
                title: titles[color][i],
                content: 'رسالة احتياطية 🤍',
                number: i + 1
            });
            id++;
        }
    });
    return msgs;
}

// ==========================================
// Navigation
// ==========================================
function showHome() {
    hideAllScreens();
    document.getElementById('homeScreen').classList.add('active');
    updateStats();
    updateCategoryCounts();
    updateNavButtons('home');
}

function showEnvelopes(category) {
    currentCategory = category;
    hideAllScreens();
    document.getElementById('envelopesScreen').classList.add('active');
    
    const titles = {
        blue: '💙 إذا كان يومك ثقيل',
        green: '💚 إذا ودك تهدأ',
        pink: '💗 إذا اشتقت',
        orange: '🧡 إذا احتجت دفعة قوة'
    };
    
    document.getElementById('categoryTitle').textContent = titles[category];
    document.getElementById('categoryColor').style.background = getCategoryColor(category);
    
    renderEnvelopes();
}

function navigateTo(screen) {
    hideAllScreens();
    
    if (screen === 'home') {
        showHome();
    } else if (screen === 'favorites') {
        document.getElementById('favoritesScreen').classList.add('active');
        renderFavorites();
        updateNavButtons('favorites');
    } else if (screen === 'memories') {
        document.getElementById('memoriesScreen').classList.add('active');
        renderMemories();
        updateNavButtons('memories');
    } else if (screen === 'about') {
        document.getElementById('aboutScreen').classList.add('active');
        updateNavButtons('about');
    }
}

function hideAllScreens() {
    document.querySelectorAll('.screen').forEach(function(s) {
        s.classList.remove('active');
    });
    const modal = document.getElementById('messageModal');
    if (modal) modal.classList.remove('active');
}

function updateNavButtons(active) {
    document.querySelectorAll('.nav-btn').forEach(function(btn) {
        btn.classList.remove('active');
    });
}

// ==========================================
// Render Envelopes
// ==========================================
function renderEnvelopes(filter) {
    filter = filter || '';
    const container = document.getElementById('envelopesContainer');
    if (!container) return;
    
    const categoryMessages = messages.filter(function(msg) {
        return msg.color === currentCategory && 
               (filter === '' || msg.title.includes(filter) || msg.content.includes(filter));
    });
    
    if (categoryMessages.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-envelope"></i><p>لا توجد رسائل</p></div>';
        return;
    }
    
    container.innerHTML = '';
    
    categoryMessages.forEach(function(msg) {
        const card = document.createElement('div');
        card.className = 'envelope-card ' + msg.color;
        card.style.cursor = 'pointer';
        
        const isOpened = openedEnvelopes.includes(msg.id);
        
        card.innerHTML = `
            ${isOpened ? '<div class="opened-badge"><i class="fas fa-check"></i></div>' : ''}
            <span class="envelope-icon">✉️</span>
            <h3>${msg.title}</h3>
            <p>ظرف رقم ${msg.number}</p>
        `;
        
        card.addEventListener('click', function() {
            openMessage(msg.id);
        });
        
        container.appendChild(card);
    });
}

// ==========================================
// Open Message (إصلاح الجوال)
// ==========================================
function openMessage(messageId) {
    const message = messages.find(function(msg) {
        return msg.id === messageId;
    });
    
    if (!message) return;
    
    currentMessage = message;
    
    const modal = document.getElementById('messageModal');
    modal.classList.add('active');
    
    document.getElementById('messageTitle').textContent = message.title;
    document.getElementById('messageContent').textContent = message.content;
    
    if (soundEnabled) {
        playEnvelopeSound();
    }
    
    const envelopeAnim = document.getElementById('envelopeAnimation');
    if (envelopeAnim) {
        if (window.innerWidth > 768) {
            envelopeAnim.classList.remove('opened');
            setTimeout(function() {
                envelopeAnim.classList.add('opened');
            }, 300);
        }
    }
    
    if (!openedEnvelopes.includes(messageId)) {
        openedEnvelopes.push(messageId);
        localStorage.setItem('openedEnvelopes', JSON.stringify(openedEnvelopes));
        addToMemories(message);
        updateStats();
        updateCategoryCounts();
        
        if (document.getElementById('envelopesScreen').classList.contains('active')) {
            renderEnvelopes();
        }
    }
}

function closeMessage() {
    const modal = document.getElementById('messageModal');
    const envelope = document.getElementById('envelopeAnimation');
    if (envelope) envelope.classList.remove('opened');
    setTimeout(function() {
        modal.classList.remove('active');
        currentMessage = null;
    }, 300);
}

// ==========================================
// Favorites
// ==========================================
function toggleFavorite(messageId) {
    if (!messageId) return;
    
    const index = favorites.indexOf(messageId);
    
    if (index > -1) {
        favorites.splice(index, 1);
        showToast('تم إزالة الرسالة من المفضلة');
    } else {
        favorites.push(messageId);
        showToast('تم إضافة الرسالة إلى المفضلة ❤️');
    }
    
    localStorage.setItem('favorites', JSON.stringify(favorites));
    updateFavCount();
    
    if (document.getElementById('favoritesScreen').classList.contains('active')) {
        renderFavorites();
    }
}

function renderFavorites() {
    const container = document.getElementById('favoritesContainer');
    const emptyState = document.getElementById('emptyFavorites');
    if (!container) return;
    
    const favMessages = messages.filter(function(msg) {
        return favorites.includes(msg.id);
    });
    
    if (favMessages.length === 0) {
        container.innerHTML = '';
        if (emptyState) emptyState.style.display = 'block';
        return;
    }
    
    if (emptyState) emptyState.style.display = 'none';
    
    container.innerHTML = '';
    
    favMessages.forEach(function(msg) {
        const div = document.createElement('div');
        div.className = 'message-item';
        div.style.cssText = 'border-right:4px solid ' + getCategoryColor(msg.color) + '; cursor:pointer;';
        div.innerHTML = '<h3>' + msg.title + '</h3><p>' + msg.content.substring(0, 100) + '...</p>';
        div.addEventListener('click', function() { openMessage(msg.id); });
        container.appendChild(div);
    });
}

// ==========================================
// Memories
// ==========================================
function addToMemories(message) {
    const memory = {
        messageId: message.id,
        title: message.title,
        content: message.content.substring(0, 50) + '...',
        color: message.color,
        date: new Date().toLocaleString('ar-SA')
    };
    
    memories.unshift(memory);
    if (memories.length > 20) memories = memories.slice(0, 20);
    localStorage.setItem('memories', JSON.stringify(memories));
}

function renderMemories() {
    const container = document.getElementById('memoriesContainer');
    const emptyState = document.getElementById('emptyMemories');
    if (!container) return;
    
    if (memories.length === 0) {
        container.innerHTML = '';
        if (emptyState) emptyState.style.display = 'block';
        return;
    }
    
    if (emptyState) emptyState.style.display = 'none';
    container.innerHTML = '';
    
    memories.forEach(function(memory) {
        const div = document.createElement('div');
        div.className = 'message-item';
        div.style.cssText = 'border-right:4px solid ' + getCategoryColor(memory.color) + '; cursor:pointer;';
        div.innerHTML = '<div class="message-header"><span class="message-date">' + memory.date + '</span></div><h3>' + memory.title + '</h3><p>' + memory.content + '</p>';
        div.addEventListener('click', function() { openMessage(memory.messageId); });
        container.appendChild(div);
    });
}

// ==========================================
// Share
// ==========================================
function shareMessage() {
    if (!currentMessage) return;
    
    const text = '📨 ' + currentMessage.title + '\n\n' + currentMessage.content + '\n\n- من تطبيق "افتحني إذا احتجتني 🤍"';
    
    if (navigator.share) {
        navigator.share({ title: currentMessage.title, text: text }).catch(function() {});
    } else {
        navigator.clipboard.writeText(text).then(function() {
            showToast('تم نسخ الرسالة 📋');
        });
    }
}

// ==========================================
// Search
// ==========================================
function searchMessages() {
    const query = document.getElementById('searchInput').value.trim();
    const clearBtn = document.getElementById('clearSearch');
    
    if (query.length > 0) {
        clearBtn.style.display = 'block';
    } else {
        clearBtn.style.display = 'none';
    }
    
    if (document.getElementById('envelopesScreen').classList.contains('active')) {
        renderEnvelopes(query);
    }
}

function clearSearch() {
    document.getElementById('searchInput').value = '';
    document.getElementById('clearSearch').style.display = 'none';
    if (document.getElementById('envelopesScreen').classList.contains('active')) {
        renderEnvelopes();
    }
}

// ==========================================
// Sound
// ==========================================
function toggleSound() {
    soundEnabled = !soundEnabled;
    localStorage.setItem('soundEnabled', soundEnabled);
    updateSoundButton();
    showToast(soundEnabled ? 'تم تشغيل الصوت 🔊' : 'تم إيقاف الصوت 🔇');
}

function updateSoundButton() {
    const btn = document.getElementById('soundToggle');
    if (!btn) return;
    const icon = btn.querySelector('i');
    if (soundEnabled) {
        icon.className = 'fas fa-volume-up';
    } else {
        icon.className = 'fas fa-volume-mute';
    }
}

// ==========================================
// Dark Mode
// ==========================================
function toggleDarkMode() {
    darkMode = !darkMode;
    localStorage.setItem('darkMode', darkMode);
    applyTheme();
    showToast(darkMode ? 'تم تفعيل الوضع الليلي 🌙' : 'تم تفعيل الوضع النهاري ☀️');
}

function applyTheme() {
    if (darkMode) {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        document.documentElement.removeAttribute('data-theme');
    }
    
    const btn = document.getElementById('darkModeToggle');
    if (btn) {
        const icon = btn.querySelector('i');
        if (darkMode) {
            icon.className = 'fas fa-sun';
        } else {
            icon.className = 'fas fa-moon';
        }
    }
}

// ==========================================
// Stats
// ==========================================
function updateStats() {
    const el = document.getElementById('openedCount');
    if (el) el.textContent = openedEnvelopes.length;
}

function updateFavCount() {
    const el = document.getElementById('favCount');
    if (el) el.textContent = favorites.length;
}

function updateCategoryCounts(messagesList) {
    const msgs = messagesList || messages;
    
    const counts = {
        blue: msgs.filter(function(m) { return m.color === 'blue'; }).length,
        green: msgs.filter(function(m) { return m.color === 'green'; }).length,
        pink: msgs.filter(function(m) { return m.color === 'pink'; }).length,
        orange: msgs.filter(function(m) { return m.color === 'orange'; }).length
    };
    
    ['blue', 'green', 'pink', 'orange'].forEach(function(color) {
        const el = document.getElementById(color + 'Count');
        if (el) el.textContent = counts[color];
    });
}

// ==========================================
// Utilities
// ==========================================
function getCategoryColor(category) {
    const colors = { blue: '#1565c0', green: '#2e7d32', pink: '#c2185b', orange: '#e65100' };
    return colors[category] || '#333';
}

function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(function() {
        toast.classList.remove('show');
    }, 2000);
}

// ==========================================
// Keyboard
// ==========================================
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeMessage();
});

console.log('✅ ملف JavaScript جاهز');
