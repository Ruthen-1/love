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
    var colors = ['blue','blue','blue','blue','blue','blue','blue','blue','blue','blue','blue','blue','blue','blue','blue','blue','blue','blue','blue','blue'];
    var greens = ['green','green','green','green','green','green','green','green','green','green','green','green'];
    var pinks = ['pink','pink','pink','pink','pink','pink','pink','pink','pink','pink','pink','pink','pink','pink','pink','pink','pink','pink','pink','pink'];
    var oranges = ['orange','orange','orange','orange','orange','orange','orange','orange','orange','orange','orange','orange'];
    
    var all = colors.concat(greens).concat(pinks).concat(oranges);
    
    for (var i = 0; i < all.length; i++) {
        msgs.push({
            id: i+1,
            color: all[i],
            title: 'رسالة ' + (i+1),
            content: 'هذه رسالة احتياطية. تأكد من وجود ملف messages.json في نفس المجلد. 🤍',
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
    document.getElementById('msgModal').classList.add('active');
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
