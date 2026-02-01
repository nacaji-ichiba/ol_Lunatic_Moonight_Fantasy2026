(function () {
        const slider = document.getElementById('mangaSlider');
        const pages = document.querySelectorAll('.manga-page');
        const pageIndicator = document.getElementById('pageIndicator');
        const swipeHint = document.getElementById('swipeHint');

        let currentPage = 0;
        const totalPages = pages.length;

        let startX = 0;
        let currentTranslate = 0;
        let prevTranslate = 0;
        let isDragging = false;

        // ─── インジケータードットの生成 ───
        for (let i = 0; i < totalPages; i++) {
            const dot = document.createElement('div');
            dot.classList.add('indicator-dot');
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', () => goToPage(i));
            pageIndicator.appendChild(dot);
        }

        // ─── イベント登録 ───
        slider.addEventListener('pointerdown', dragStart, { passive: false });
        slider.addEventListener('pointermove', drag, { passive: false });
        slider.addEventListener('pointerup', dragEnd);
        slider.addEventListener('pointercancel', dragEnd);

        // キーボード（右キー＝次へ・左キー＝戻る）
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight') nextPage();
            if (e.key === 'ArrowLeft') prevPage();
        });

        // ─── ドラッグハンドラー ───
        function dragStart(e) {
            isDragging = true;
            startX = e.clientX;
            slider.setPointerCapture(e.pointerId);
            slider.style.transition = 'none';
            swipeHint.classList.add('hidden');
        }

        function drag(e) {
            if (!isDragging) return;
            e.preventDefault();
            const diff = e.clientX - startX;
            currentTranslate = prevTranslate + diff;
            slider.style.transform = `translateX(${currentTranslate}px)`;
        }

        function dragEnd() {
            if (!isDragging) return;
            isDragging = false;

            const movedBy = currentTranslate - prevTranslate;
            const threshold = 40;

            /*
             * 左→右へ引く (movedBy > 0) → 次へ (currentPage++)
             *   スライダーは負方向へ動く → 画面は右から左へ進む
             * 右→左へ引く (movedBy < 0) → 戻る (currentPage--)
             */
            if (movedBy > threshold && currentPage < totalPages - 1) {
                currentPage++;
                animateTurn('next');
            } else if (movedBy < -threshold && currentPage > 0) {
                currentPage--;
                animateTurn('prev');
            } else {
                goToPage(currentPage);
            }
        }

        // ─── ページめくりアニメーション ───
        function animateTurn(direction) {
            // currentPage は既に新しい値
            const newIdx = currentPage;
            const oldIdx = direction === 'next' ? currentPage - 1 : currentPage + 1;

            if (pages[newIdx]) pages[newIdx].classList.add('turning-in');
            if (pages[oldIdx]) pages[oldIdx].classList.add('turning-out');

            setTimeout(() => {
                pages.forEach(p => {
                    p.classList.remove('turning-out');
                    p.classList.remove('turning-in');
                });
            }, 500);

            goToPage(currentPage);
        }

        // ─── ページ遷移 ───
        function nextPage() {
            if (currentPage < totalPages - 1) {
                currentPage++;
                animateTurn('next');
            }
        }

        function prevPage() {
            if (currentPage > 0) {
                currentPage--;
                animateTurn('prev');
            }
        }

        function goToPage(index) {
            currentPage = index;
            updateSliderPosition();
            updateIndicator();
        }

        // ─── スライダー位置更新 ───
        function updateSliderPosition() {
            // DOM順とcurrentPageが同じ。負方向にスライドすることで次へ進む。
            const offset = -currentPage * window.innerWidth;
            prevTranslate = offset;
            currentTranslate = offset;
            slider.style.transition = 'transform 0.45s cubic-bezier(0.4, 0, 0.2, 1)';
            slider.style.transform = `translateX(${offset}px)`;
        }

        // ─── インジケーター更新 ───
        function updateIndicator() {
            document.querySelectorAll('.indicator-dot').forEach((dot, i) => {
                dot.classList.toggle('active', i === currentPage);
            });
        }

        // ─── リサイズ対応 ───
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                slider.style.transition = 'none';
                updateSliderPosition();
            }, 100);
        });

        // ─── 画像保護 ───
        // 右クリックメニュー抑制
        document.addEventListener('contextmenu', (e) => {
            if (e.target.tagName === 'IMG') e.preventDefault();
        });
        // ドラッグ抑制
        document.addEventListener('dragstart', (e) => {
            if (e.target.tagName === 'IMG') e.preventDefault();
        });
        // モバイル長押し保存抑制
        document.addEventListener('touchstart', (e) => {
            if (e.target.tagName === 'IMG') {
                e.target.addEventListener('touchmove', (ev) => ev.preventDefault(), { once: true, passive: false });
                e.target.addEventListener('touchend', (ev) => ev.preventDefault(), { once: true, passive: false });
            }
        }, { passive: true });

        // ─── 初期化 ───
        updateSliderPosition();
        updateIndicator();
    })();