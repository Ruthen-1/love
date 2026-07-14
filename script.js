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
let searchTimeout = null;

// ==========================================
// Sound Generator (بدون ملفات صوتية)
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
        
        // صوت فتح الظرف
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
        
        // صوت خروج الورقة
        setTimeout(() => {
            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.connect(gain2);
            gain2.connect(ctx.destination);
            
            osc2.type = 'triangle';
            osc2.frequency.setValueAtTime(800, now);
            osc2.frequency.exponentialRampToValueAtTime(400, now + 0.2);
            
            gain2.gain.setValueAtTime(0, now);
            gain2.gain.linearRampToValueAtTime(0.15, now + 0.05);
            gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
            
            osc2.start(now);
            osc2.stop(now + 0.2);
        }, 400);
        
    } catch (e) {
        console.log('Sound error:', e);
    }
}

// ==========================================
// Initialization
// ==========================================
document.addEventListener('DOMContentLoaded', async () => {
    await loadMessages();
    applyTheme();
    updateSoundButton();
    updateStats();
    updateFavCount();
    
    if (window.matchMedia('(display-mode: standalone)').matches) {
        console.log('App running in standalone mode');
    }
});

// ==========================================
// Data Loading
// ==========================================
async function loadMessages() {
    try {
        const response = await fetch('messages.json');
        if (!response.ok) throw new Error('Failed to load messages');
        messages = await response.json();
        messages = messages.messages || messages;
        updateCategoryCounts();
    } catch (error) {
        console.error('Error loading messages:', error);
        messages = getFallbackMessages();
        updateCategoryCounts();
    }
}

function getFallbackMessages() {
    return [
        { id: 1, color: 'blue', title: 'للقلب المتعب', content: 'خذ نفساً عميقاً... أنت أقوى مما تظن 🤍', number: 1 },
        { id: 2, color: 'blue', title: 'للأيام الصعبة', content: 'كل شيء سيمر... ثق بالله 🤍', number: 2 },
        { id: 3, color: 'blue', title: 'تحت الضغط', content: 'الضغط يصنع الماس... وأنت جوهرة 🤍', number: 3 },
        { id: 4, color: 'green', title: 'للراحة', content: 'استمتع بلحظتك... خذ كوب شاهي وارتاح 🤍', number: 1 },
        { id: 5, color: 'green', title: 'للأمل', content: 'بكرة أجمل... ثق بذلك 🤍', number: 2 },
        { id: 6, color: 'green', title: 'للامتنان', content: 'توقف قليلاً... وانظر للنعم حولك 🤍', number: 3 },
        { id: 7, color: 'pink', title: 'للحب', content: 'أنت محبوب أكثر مما تتخيل 🤍', number: 1 },
        { id: 8, color: 'pink', title: 'للاشتياق', content: 'الشوق يعني أن هناك من يستحق 🤍', number: 2 },
        { id: 9, color: 'pink', title: 'للذكريات', content: 'الذكريات الجميلة كنوز لا تفنى 🤍', number: 3 },
        { id: 10, color: 'orange', title: 'للقوة', content: 'أنت قدها... آمن بنفسك 🤍', number: 1 },
        { id: 11, color: 'orange', title: 'للإنجاز', content: 'كل خطوة توصلك لحلمك... كمل 🤍', number: 2 },
        { id: 12, color: 'orange', title: 'للتفاؤل', content: 'الحياة تستحق الابتسامة... ابتسم 🤍', number: 3 }
    ];
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
    
    const categoryTitles = {
        blue: '💙 إذا كان يومك ثقيل',
        green: '💚 إذا ودك تهدأ',
        pink: '🩷 إذا اشتقت',
        orange: '🧡 إذا احتجت دفعة قوة'
    };
    
    document.getElementById('categoryTitle').textContent = categoryTitles[category];
    document.getElementById('categoryColor').style.background = getCategoryColor(category);
    
    renderEnvelopes();
}

function navigateTo(screen) {
    hideAllScreens();
    
    switch(screen) {
        case 'home':
            showHome();
            break;
        case 'favorites':
            document.getElementById('favoritesScreen').classList.add('active');
            renderFavorites();
            updateNavButtons('favorites');
            break;
        case 'memories':
            document.getElementById('memoriesScreen').classList.add('active');
            renderMemories();
            updateNavButtons('memories');
            break;
        case 'about':
            document.getElementById('aboutScreen').classList.add('active');
            updateNavButtons('about');
            break;
    }
}

function hideAllScreens() {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('messageModal').classList.remove('active');
}

function updateNavButtons(activeScreen) {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        const onclick = btn.getAttribute('onclick') || '';
        const match = onclick.match(/'([^']+)'/);
        if (match && match[1] === activeScreen) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// ==========================================
// Envelopes Rendering
// ==========================================
function renderEnvelopes(filter = '') {
    const container = document.getElementById('envelopesContainer');
    if (!container) return;
    
    const categoryMessages = messages.filter(msg => 
        msg.color === currentCategory && 
        (filter === '' || msg.title.includes(filter) || msg.content.includes(filter))
    );
    
    if (categoryMessages.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-envelope"></i><p>لا توجد رسائل</p></div>';
        return;
    }
    
    container.innerHTML = categoryMessages.map(msg => {
        const isOpened = openedEnvelopes.includes(msg.id);
        return `
            <div class="envelope-card ${msg.color}" onclick="openMessage(${msg.id})">
                ${isOpened ? '<div class="opened-badge"><i class="fas fa-check"></i></div>' : ''}
                <span class="envelope-icon">✉️</span>
                <h3>${msg.title}</h3>
                <p>ظرف رقم ${msg.number}</p>
            </div>
        `;
    }).join('');
}

// ==========================================
// Message Opening
// ==========================================
function openMessage(messageId) {
    const message = messages.find(msg => msg.id === messageId);
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
    envelopeAnim.classList.remove('opened');
    
    setTimeout(() => {
        envelopeAnim.classList.add('opened');
    }, 300);
    
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
    
    updateFavoriteButton(messageId);
}

function closeMessage() {
    const modal = document.getElementById('messageModal');
    const envelope = document.getElementById('envelopeAnimation');
    envelope.classList.remove('opened');
    
    setTimeout(() => {
        modal.classList.remove('active');
        currentMessage = null;
    }, 300);
}

function updateFavoriteButton(messageId) {
    const actionBtns = document.querySelectorAll('.action-btn');
    actionBtns.forEach(btn => {
        const icon = btn.querySelector('i');
        if (icon && icon.classList.contains('fa-bookmark')) {
            const span = btn.querySelector('span');
            if (favorites.includes(messageId)) {
                icon.style.color = '#ff4757';
                if (span) span.textContent = 'محفوظ';
            } else {
                icon.style.color = '';
                if (span) span.textContent = 'حفظ';
            }
        }
    });
}

// ==========================================
// Favorites Management
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
    updateFavoriteButton(messageId);
    updateFavCount();
    
    if (document.getElementById('favoritesScreen').classList.contains('active')) {
        renderFavorites();
    }
}

function renderFavorites() {
    const container = document.getElementById('favoritesContainer');
    const emptyState = document.getElementById('emptyFavorites');
    
    if (!container) return;
    
    const favMessages = messages.filter(msg => favorites.includes(msg.id));
    
    if (favMessages.length === 0) {
        container.innerHTML = '';
        if (emptyState) emptyState.style.display = 'block';
        return;
    }
    
    if (emptyState) emptyState.style.display = 'none';
    
    container.innerHTML = favMessages.map(msg => {
        const categoryColor = getCategoryColor(msg.color);
        return `
            <div class="message-item" onclick="openMessage(${msg.id})" style="border-right: 4px solid ${categoryColor}">
                <div class="message-header">
                    <span>${msg.color === 'blue' ? '💙' : msg.color === 'green' ? '💚' : msg.color === 'pink' ? '🩷' : '🧡'}</span>
                    <button class="icon-btn" onclick="event.stopPropagation(); toggleFavorite(${msg.id})" style="color: #ff4757; width:30px;height:30px;font-size:14px;">
                        <i class="fas fa-bookmark"></i>
                    </button>
                </div>
                <h3>${msg.title}</h3>
                <p>${msg.content.substring(0, 100)}...</p>
            </div>
        `;
    }).join('');
}

// ==========================================
// Memories Management
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
    
    if (memories.length > 20) {
        memories = memories.slice(0, 20);
    }
    
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
    
    container.innerHTML = memories.map(memory => {
        const categoryColor = getCategoryColor(memory.color);
        return `
            <div class="message-item" onclick="openMessage(${memory.messageId})" style="border-right: 4px solid ${categoryColor}">
                <div class="message-header">
                    <span>${memory.color === 'blue' ? '💙' : memory.color === 'green' ? '💚' : memory.color === 'pink' ? '🩷' : '🧡'}</span>
                    <span class="message-date">${memory.date}</span>
                </div>
                <h3>${memory.title}</h3>
                <p>${memory.content}</p>
            </div>
        `;
    }).join('');
}

// ==========================================
// Search Functionality
// ==========================================
function searchMessages() {
    const query = document.getElementById('searchInput').value.trim();
    const clearBtn = document.getElementById('clearSearch');
    
    if (query.length > 0) {
        clearBtn.style.display = 'block';
    } else {
        clearBtn.style.display = 'none';
    }
    
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        performSearch(query);
    }, 300);
}

function performSearch(query) {
    if (query.length === 0) {
        if (document.getElementById('envelopesScreen').classList.contains('active')) {
            renderEnvelopes();
        }
        return;
    }
    
    const results = messages.filter(msg => 
        msg.title.includes(query) || 
        msg.content.includes(query)
    );
    
    if (document.getElementById('homeScreen').classList.contains('active')) {
        updateCategoryCounts(results);
    } else if (document.getElementById('envelopesScreen').classList.contains('active')) {
        renderEnvelopes(query);
    }
}

function clearSearch() {
    document.getElementById('searchInput').value = '';
    document.getElementById('clearSearch').style.display = 'none';
    performSearch('');
}

// ==========================================
// Share Functionality
// ==========================================
async function shareMessage() {
    if (!currentMessage) return;
    
    const shareText = `📨 ${currentMessage.title}\n\n${currentMessage.content}\n\n- من تطبيق "افتحني إذا احتجتني 🤍"`;
    
    if (navigator.share) {
        try {
            await navigator.share({
                title: currentMessage.title,
                text: shareText
            });
        } catch (err) {
            console.log('Share cancelled');
        }
    } else {
        try {
            await navigator.clipboard.writeText(shareText);
            showToast('تم نسخ الرسالة إلى الحافظة 📋');
        } catch (err) {
            showToast('تعذر نسخ الرسالة');
        }
    }
}

// ==========================================
// Sound Management
// ==========================================
function toggleSound() {
    soundEnabled = !soundEnabled;
    localStorage.setItem('soundEnabled', soundEnabled);
    updateSoundButton();
    
    if (soundEnabled) {
        showToast('تم تشغيل الصوت 🔊');
    } else {
        showToast('تم إيقاف الصوت 🔇');
    }
}

function updateSoundButton() {
    const btn = document.getElementById('soundToggle');
    if (!btn) return;
    
    const icon = btn.querySelector('i');
    if (soundEnabled) {
        icon.classList.remove('fa-volume-mute');
        icon.classList.add('fa-volume-up');
    } else {
        icon.classList.remove('fa-volume-up');
        icon.classList.add('fa-volume-mute');
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
    
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        const icon = darkModeToggle.querySelector('i');
        if (darkMode) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    }
}

// ==========================================
// Stats & Counters
// ==========================================
function updateStats() {
    const openedCount = document.getElementById('openedCount');
    if (openedCount) {
        openedCount.textContent = openedEnvelopes.length;
    }
}

function updateFavCount() {
    const favCount = document.getElementById('favCount');
    if (favCount) {
        favCount.textContent = favorites.length;
    }
}

function updateCategoryCounts(filteredMessages = null) {
    const msgs = filteredMessages || messages;
    
    const counts = {
        blue: msgs.filter(m => m.color === 'blue').length,
        green: msgs.filter(m => m.color === 'green').length,
        pink: msgs.filter(m => m.color === 'pink').length,
        orange: msgs.filter(m => m.color === 'orange').length
    };
    
    Object.keys(counts).forEach(color => {
        const countElement = document.getElementById(`${color}Count`);
        if (countElement) {
            countElement.textContent = counts[color];
        }
    });
}

// ==========================================
// Utilities
// ==========================================
function getCategoryColor(category) {
    const colors = {
        blue: '#1565c0',
        green: '#2e7d32',
        pink: '#c2185b',
        orange: '#e65100'
    };
    return colors[category] || '#333';
}

function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}

// ==========================================
// Keyboard Navigation
// ==========================================
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeMessage();
    }
});

// ==========================================
// PWA Installation
// ==========================================
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    showToast('يمكنك تثبيت التطبيق على هاتفك 📱');
});

// ==========================================
// Service Worker Registration
// ==========================================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(registration => {
            console.log('ServiceWorker registered');
        }).catch(err => {
            console.log('ServiceWorker failed:', err);
        });
    });
}