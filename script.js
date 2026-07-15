let messages = [];
let favorites = JSON.parse(localStorage.getItem('faves') || '[]');
let opened = JSON.parse(localStorage.getItem('opened') || '[]');
let soundOn = localStorage.getItem('sound') !== 'false';
let darkOn = localStorage.getItem('dark') === 'true';
let currentMsg = null;
let currentCat = null;

// تحميل البيانات
fetch('data/messages.json')
    .then(r => r.json())
    .then(d => {
        messages = d.messages || d;
        updateCounts();
    })
    .catch(() => {
        messages = [
            {id:1,color:'blue',title:'للقلب المتعب',content:'خذ نفساً عميقاً... 🤍',number:1},
            {id:2,color:'blue',title:'للحزن',content:'الحزن زائر مؤقت 🤍',number:2},
            {id:3,color:'green',title:'للراحة',content:'استمتع بلحظتك 🤍',number:1},
            {id:4,color:'green',title:'للأمل',content:'بكرة أجمل 🤍',number:2},
            {id:5,color:'pink',title:'للحب',content:'أنت محبوب 🤍',number:1},
            {id:6,color:'pink',title:'للاشتياق',content:'الشوق نعمة 🤍',number:2},
            {id:7,color:'orange',title:'للقوة',content:'أنت قدها 🤍',number:1},
            {id:8,color:'orange',title:'للإنجاز',content:'كمل ما توقف 🤍',number:2}
        ];
        updateCounts();
    });

function updateCounts() {
    ['blue','green','pink','orange'].forEach(c => {
        const el = document.getElementById(c+'Count');
        if(el) el.textContent = messages.filter(m => m.color === c).length;
    });
}

function showHome() {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('homeScreen').classList.add('active');
    updateCounts();
}

function showEnvelopes(cat) {
    currentCat = cat;
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('envelopesScreen').classList.add('active');
    document.getElementById('categoryTitle').textContent = 
        cat === 'blue' ? '💙 إذا كان يومك ثقيل' :
        cat === 'green' ? '💚 إذا ودك تهدأ' :
        cat === 'pink' ? '💗 إذا اشتقت' : '🧡 إذا احتجت قوة';
    
    const container = document.getElementById('envelopesContainer');
    const catMsgs = messages.filter(m => m.color === cat);
    
    container.innerHTML = catMsgs.map(m => `
        <div class="env-card" onclick="openMsg(${m.id})">
            <span class="env-icon">✉️</span>
            <h3>${m.title}</h3>
            <p>ظرف ${m.number}</p>
        </div>
    `).join('');
}

function openMsg(id) {
    const msg = messages.find(m => m.id === id);
    if(!msg) return;
    currentMsg = msg;
    
    document.getElementById('messageTitle').textContent = msg.title;
    document.getElementById('messageContent').textContent = msg.content;
    document.getElementById('messageModal').classList.add('active');
    
    if(!opened.includes(id)) {
        opened.push(id);
        localStorage.setItem('opened', JSON.stringify(opened));
    }
}

function closeMessage() {
    document.getElementById('messageModal').classList.remove('active');
    currentMsg = null;
}

function navigateTo(page) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    if(page === 'home') showHome();
    else if(page === 'favorites') {
        document.getElementById('favoritesScreen').classList.add('active');
        const favMsgs = messages.filter(m => favorites.includes(m.id));
        document.getElementById('favoritesContainer').innerHTML = favMsgs.length === 0 
            ? '<div class="empty-state"><i class="fas fa-heart"></i><p>لا توجد رسائل مفضلة</p></div>'
            : favMsgs.map(m => `<div class="msg-item" onclick="openMsg(${m.id})"><h3>${m.title}</h3><p>${m.content.substring(0,80)}...</p></div>`).join('');
    }
    else if(page === 'about') document.getElementById('aboutScreen').classList.add('active');
    
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
}

function toggleSound() {
    soundOn = !soundOn;
    localStorage.setItem('sound', soundOn);
    const icon = document.querySelector('#soundToggle i, .header-btns .icon-btn:nth-child(2) i');
    if(icon) icon.className = soundOn ? 'fas fa-volume-up' : 'fas fa-volume-mute';
}

function toggleDarkMode() {
    darkOn = !darkOn;
    localStorage.setItem('dark', darkOn);
    document.body.style.background = darkOn 
        ? 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)'
        : 'linear-gradient(135deg, #667eea, #764ba2)';
}

function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2000);
}
