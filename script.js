// 時間割データの管理
let timetableData = JSON.parse(localStorage.getItem('timetableData')) || {};
let currentWeek = 'A'; // A週 or B週

// データの初期化
function initializeData() {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    const periods = [1, 2, 3, 4];
    
    days.forEach(day => {
        if (!timetableData[day]) {
            timetableData[day] = {};
            periods.forEach(period => {
                timetableData[day][period] = {
                    subject: '',
                    location: '',
                    instructor: '',
                    materials: '',
                    isSubstitute: 'normal'
                };
            });
        }
    });
    
    saveData();
}

// データの保存
function saveData() {
    localStorage.setItem('timetableData', JSON.stringify(timetableData));
}

// 時間割テーブルの描画
function renderTimetable() {
    const timetableElement = document.getElementById('timetable');
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    const periods = [1, 2, 3, 4];
    
    // ヘッダーの作成
    timetableElement.innerHTML = `
        <div class="timetable-header">時間</div>
        <div class="timetable-header">月曜日</div>
        <div class="timetable-header">火曜日</div>
        <div class="timetable-header">水曜日</div>
        <div class="timetable-header">木曜日</div>
        <div class="timetable-header">金曜日</div>
    `;
    
    // 各コマのデータを描画
    periods.forEach(period => {
        // コマ番号
        timetableElement.innerHTML += `<div class="timetable-header">${period}コマ目</div>`;
        
        days.forEach(day => {
            const lesson = timetableData[day][period];
            let cellClass = 'timetable-cell';
            
            if (lesson.isSubstitute === 'substitute') {
                cellClass += ' substitute';
            } else if (lesson.isSubstitute === 'holiday') {
                cellClass += ' holiday';
            }
            
            let content = '';
            if (lesson.subject) {
                content = `
                    <div><strong>${lesson.subject}</strong></div>
                    <div>${lesson.location}</div>
                    <div>${lesson.instructor}</div>
                    <div>${lesson.materials}</div>
                `;
            } else {
                content = '<div class="empty-cell">授業なし</div>';
            }
            
            if (lesson.isSubstitute === 'substitute') {
                content += '<div style="color: #856404; font-weight: bold;">補講</div>';
            } else if (lesson.isSubstitute === 'holiday') {
                content += '<div style="color: #721c24; font-weight: bold;">休講</div>';
            }
            
            timetableElement.innerHTML += `<div class="${cellClass}" data-day="${day}" data-period="${period}">${content}</div>`;
        });
    });
}

// モーダルの表示
function showModal() {
    document.getElementById('lessonModal').style.display = 'block';
}

// モーダルの非表示
function hideModal() {
    document.getElementById('lessonModal').style.display = 'none';
}

// 授業情報の入力フォームを表示
function showLessonForm(day, period) {
    const lesson = timetableData[day][period];
    
    document.getElementById('lessonId').value = `${day}-${period}`;
    document.getElementById('day').value = day;
    document.getElementById('period').value = period;
    document.getElementById('subject').value = lesson.subject || '';
    document.getElementById('location').value = lesson.location || '';
    document.getElementById('instructor').value = lesson.instructor || '';
    document.getElementById('materials').value = lesson.materials || '';
    document.getElementById('isSubstitute').value = lesson.isSubstitute || 'normal';
    
    showModal();
}

// フォームの送信処理
document.getElementById('lessonForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const id = document.getElementById('lessonId').value;
    const [day, period] = id.split('-');
    
    timetableData[day][period] = {
        subject: document.getElementById('subject').value,
        location: document.getElementById('location').value,
        instructor: document.getElementById('instructor').value,
        materials: document.getElementById('materials').value,
        isSubstitute: document.getElementById('isSubstitute').value
    };
    
    saveData();
    renderTimetable();
    hideModal();
});

// ボタンのイベントリスナー
document.getElementById('addLesson').addEventListener('click', function() {
    showLessonForm('monday', 1);
});

document.getElementById('saveData').addEventListener('click', function() {
    saveData();
    alert('データが保存されました');
});

// A週/ B週の切り替え
document.getElementById('weekA').addEventListener('click', function() {
    currentWeek = 'A';
    this.classList.add('active');
    document.getElementById('weekB').classList.remove('active');
    renderTimetable();
});

document.getElementById('weekB').addEventListener('click', function() {
    currentWeek = 'B';
    this.classList.add('active');
    document.getElementById('weekA').classList.remove('active');
    renderTimetable();
});

// モーダルの閉じるボタン
document.querySelector('.close').addEventListener('click', hideModal);

// モーダル外をクリックして閉じる
window.addEventListener('click', function(event) {
    const modal = document.getElementById('lessonModal');
    if (event.target === modal) {
        hideModal();
    }
});

// 初期化
initializeData();
renderTimetable();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/timetable-app/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}