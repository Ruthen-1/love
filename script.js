let messages = [];
let favorites = JSON.parse(localStorage.getItem('fv') || '[]');
let currentCat = '';

fetch('data/messages.json')
    .then(r => r.json())
    .then(d => { messages = d.messages || d; })
    .catch(() => {
        messages = [
            {id:1,color:'blue',title:'للقلب المتعب',content:'خذ نفساً عميقاً... أنت أقوى مما تظن 🤍',number:1},
            {id:2,color:'blue',title:'للحزن',content:'الحزن زائر مؤقت... لا تجعله مقيماً في قلبك 🤍',number:2},
            {id:3,color:'green',title:'للراحة',content:'استمتع بلحظتك... خذ كوب شاهي وارتاح 🤍',number:1},
            {id:4,color:'green',title:'للأمل',content:'بكرة أجمل... ثق بذلك 🤍',number:2},
            {id:5,color:'pink',title:'للحب',content:'أنت محبوب أكثر مما تتخيل 🤍',number:1},
            {id:6,color:'pink',title:'للاشتياق',content:'الشوق يعني أن هناك من يستحق 🤍',number:2},
            {id:7,color:'orange',title:'للقوة',content:'أنت قدها... آمن بنفسك 🤍',number:1},
            {id:8,color:'orange',title:'للإنجاز',content:'كل خطوة توصلك لحلمك... كمل 🤍',number:2}
        ];
    });

function hideAll() {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
}

function goHome() {
    hideAll();
    document.getElementById('home').classList.add('active');
}

function goEnvelopes(cat) {
    currentCat = cat;
    hideAll();
    document.getElementById('envelopes').classList.add('active');
    
    const titles = { blue: '💙 إذا كان يومك ثقيل', green: '💚 إذا ودك تهدأ', pink: '💗 إذا اشتقت', orange: '🧡 إذا احتجت قوة' };
    document.getElementById('catTitle').textContent = titles[cat];
    
    const grid = document.getElementById('envGrid');
    const catMsgs = messages.filter(m => m.color === cat);
    
    grid.innerHTML = catMsgs.map(m => `
        <div class="card" onclick="openMsg(${m.id})">
            <span>✉️</span>
            <h3>${m.title}</h3>
            <p>ظرف ${m.number}</p>
        </div>
    `).join('');
}

function openMsg(id) {
    const msg = messages.find(m => m.id === id);
    if (!msg) return;
    
    document.getElementById('msgTitle').textContent = msg.title;
    document.getElementById('msgBody').textContent = msg.content;
    document.getElementById('msgModal').classList.add('active');
}

function closeMsg() {
    document.getElementById('msgModal').classList.remove('active');
}

function goFavorites() {
    hideAll();
    document.getElementById('favorites').classList.add('active');
    
    const favMsgs = messages.filter(m => favorites.includes(m.id));
    const list = document.getElementById('favList');
    
    list.innerHTML = favMsgs.length === 0 
        ? '<div class="empty"><i class="fas fa-heart"></i><p>لا توجد رسائل مفضلة</p></div>'
        : favMsgs.map(m => `<div class="msg-item" onclick="openMsg(${m.id})"><h3>${m.title}</h3><p>${m.content.substring(0,80)}...</p></div>`).join('');
}

function goAbout() {
    hideAll();
    document.getElementById('about').classList.add('active');
}
