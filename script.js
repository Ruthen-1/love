let messages = [];
let favorites = JSON.parse(localStorage.getItem('fv') || '[]');
let currentCat = '';

// تحميل الرسائل
fetch('messages.json')
    .then(function(r) { return r.json(); })
    .then(function(d) { 
        messages = d.messages || d;
        console.log('✅ تم تحميل ' + messages.length + ' رسالة');
    })
    .catch(function() {
        console.log('❌ استخدام رسائل احتياطية');
        messages = getFallback();
    });

function getFallback() {
    var msgs = [];
    var allColors = [];
    
    for (var i = 0; i < 20; i++) allColors.push('blue');
    for (var i = 0; i < 12; i++) allColors.push('green');
    for (var i = 0; i < 20; i++) allColors.push('pink');
    for (var i = 0; i < 12; i++) allColors.push('orange');
    
    for (var i = 0; i < allColors.length; i++) {
        msgs.push({
            id: i+1,
            color: allColors[i],
            title: 'رسالة ' + (i+1),
            content: 'هذه رسالة احتياطية. تأكد من وجود ملف messages.json 🤍',
            number: i+1
        });
    }
    return msgs;
}

function hideAll() {
    var pages = document.querySelectorAll('.page');
    for (var i = 0; i < pages.length; i++) {
        pages[i].classList.remove('active');
    }
}

function goHome() {
    hideAll();
    document.getElementById('home').classList.add('active');
}

function goEnvelopes(cat) {
    currentCat = cat;
    hideAll();
    document.getElementById('envelopes').classList.add('active');
    
    var titles = {
        blue: '💙 إذا كان يومك ثقيل',
        green: '💚 إذا ودك تهدأ',
        pink: '💗 إذا اشتقت',
        orange: '🧡 إذا احتجت قوة'
    };
    document.getElementById('catTitle').textContent = titles[cat];
    
    var catMsgs = messages.filter(function(m) { return m.color === cat; });
    
    var html = '';
    for (var i = 0; i < catMsgs.length; i++) {
        var m = catMsgs[i];
        html += '<div class="card" onclick="openMsg(' + m.id + ')"><span>✉️</span><h3>' + m.title + '</h3><p>ظرف ' + m.number + '</p></div>';
    }
    document.getElementById('envGrid').innerHTML = html;
}

function openMsg(id) {
    var msg = null;
    for (var i = 0; i < messages.length; i++) {
        if (messages[i].id === id) { msg = messages[i]; break; }
    }
    if (!msg) return;
    
    document.getElementById('msgTitle').textContent = msg.title;
    document.getElementById('msgBody').textContent = msg.content;
    
    var isFav = favorites.indexOf(id) !== -1;
    var btnsDiv = document.querySelector('.modal-btns');
    btnsDiv.innerHTML = 
        '<button onclick="toggleFav(' + id + ')" style="background:#fff; border:1px solid #ddd;">' +
        (isFav ? '❤️' : '🤍') +
        '</button>' +
        '<button onclick="closeMsg()">إغلاق ✕</button>';
    
    document.getElementById('msgModal').classList.add('active');
}

function toggleFav(id) {
    var idx = favorites.indexOf(id);
    if (idx === -1) {
        favorites.push(id);
    } else {
        favorites.splice(idx, 1);
    }
    localStorage.setItem('fv', JSON.stringify(favorites));
    
    var isFav = favorites.indexOf(id) !== -1;
    var btnsDiv = document.querySelector('.modal-btns');
    btnsDiv.innerHTML = 
        '<button onclick="toggleFav(' + id + ')" style="background:#fff; border:1px solid #ddd;">' +
        (isFav ? '❤️' : '🤍') +
        '</button>' +
        '<button onclick="closeMsg()">إغلاق ✕</button>';
}

function closeMsg() {
    document.getElementById('msgModal').classList.remove('active');
}

function goFavorites() {
    hideAll();
    document.getElementById('favorites').classList.add('active');
    
    var favMsgs = messages.filter(function(m) { return favorites.indexOf(m.id) !== -1; });
    
    var html = '';
    if (favMsgs.length === 0) {
        html = '<div class="empty"><i class="fas fa-heart"></i><p>لا توجد رسائل مفضلة</p></div>';
    } else {
        for (var i = 0; i < favMsgs.length; i++) {
            var m = favMsgs[i];
            html += '<div class="msg-item" onclick="openMsg(' + m.id + ')"><h3>' + m.title + '</h3><p>' + m.content.substring(0,80) + '...</p></div>';
        }
    }
    document.getElementById('favList').innerHTML = html;
}

function goAbout() {
    hideAll();
    document.getElementById('about').classList.add('active');
}
