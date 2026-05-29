document.addEventListener('DOMContentLoaded', () => {
    const timetable = document.getElementById('timetable');
    const addLessonButton = document.getElementById('addLesson');
    const saveDataButton = document.getElementById('saveData');
    const lessonModal = document.getElementById('lessonModal');
    const closeBtn = document.querySelector('.close');
    const daySelect = document.getElementById('day');
    const periodSelect = document.getElementById('period');
    const subjectInput = document.getElementById('subject');
    const locationInput = document.getElementById('location');
    const instructorInput = document.getElementById('instructor');
    const materialsInput = document.getElementById('materials');
    const isSubstituteSelect = document.getElementById('isSubstitute');
    const lessonForm = document.getElementById('lessonForm');
    const modalTitle = document.getElementById('modal-title');

    let timetableData = {
        monday: { 1: {}, 2: {}, 3: {}, 4: {} },
        tuesday: { 1: {}, 2: {}, 3: {}, 4: {} },
        wednesday: { 1: {}, 2: {}, 3: {}, 4: {} },
        thursday: { 1: {}, 2: {}, 3: {}, 4: {} },
        friday: { 1: {}, 2: {}, 3: {}, 4: {} }
    };

    function renderTimetable() {
        timetable.innerHTML = '';
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
        const periods = [1, 2, 3, 4];

        days.forEach(day => {
            const dayElement = document.createElement('div');
            dayElement.classList.add('timetable-header');
            dayElement.textContent = getDayName(day);
            timetable.appendChild(dayElement);

            periods.forEach(period => {
                const cell = document.createElement('div');
                cell.classList.add('timetable-cell');
                cell.dataset.day = day;
                cell.dataset.period = period;

                const lessonData = timetableData[day][period];
                if (Object.keys(lessonData).length > 0) {
                    cell.innerHTML = `
                        <p>${lessonData.subject}</p>
                        <p><small>場所: ${lessonData.location}</small></p>
                        <p><small>担当: ${lessonData.instructor}</small></p>
                        <p><small>持ち物: ${lessonData.materials}</small></p>
                    `;
                } else {
                    cell.textContent = '空';
                }

                timetable.appendChild(cell);
            });
        });

        // テーブルの固定ヘッダーを設定
        const headers = document.querySelectorAll('.timetable-header');
        headers.forEach(header => {
            header.style.zIndex = 1;
            header.style.position = 'sticky';
            header.style.top = '0';
        });
    }

    function getDayName(day) {
        switch (day) {
            case 'monday': return '月曜日';
            case 'tuesday': return '火曜日';
            case 'wednesday': return '水曜日';
            case 'thursday': return '木曜日';
            case 'friday': return '金曜日';
        }
    }

    function openModal() {
        lessonModal.style.display = 'block';
        subjectInput.value = '';
        locationInput.value = '';
        instructorInput.value = '';
        materialsInput.value = '';
        isSubstituteSelect.value = 'normal';
    }

    function closeModal() {
        lessonModal.style.display = 'none';
    }

    addLessonButton.addEventListener('click', openModal);
    closeBtn.addEventListener('click', closeModal);
    window.addEventListener('click', event => {
        if (event.target === lessonModal) {
            closeModal();
        }
    });

    lessonForm.addEventListener('submit', event => {
        event.preventDefault();

        const day = daySelect.value;
        const period = parseInt(periodSelect.value, 10);

        timetableData[day][period] = {
            subject: subjectInput.value,
            location: locationInput.value,
            instructor: instructorInput.value,
            materials: materialsInput.value,
            isSubstitute: isSubstituteSelect.value
        };

        renderTimetable();
        closeModal();
    });

    // セルをクリックして編集できるようにする
    timetable.addEventListener('click', event => {
        const cell = event.target.closest('.timetable-cell');
        if (cell) {
            const day = cell.dataset.day;
            const period = cell.dataset.period;

            const lessonData = timetableData[day][period];
            subjectInput.value = lessonData.subject || '';
            locationInput.value = lessonData.location || '';
            instructorInput.value = lessonData.instructor || '';
            materialsInput.value = lessonData.materials || '';
            isSubstituteSelect.value = lessonData.isSubstitute || 'normal';

            // モーダルのタイトルを更新
            modalTitle.textContent = `${getDayName(day)} ${period}コマ目`;

            openModal();
        }
    });

    renderTimetable();
});