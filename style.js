       (function () {
        const slider = document.getElementById('mangaSlider');
        const pages = document.querySelectorAll('.manga-page');
        const pageIndicator = document.getElementById('pageIndicator');
        const swipeHint = document.getElementById('swipeHint');

        let currentPage = 0;
        const totalPages = pages.length;

        // スワイプ・ドラッグ用の変数
        let startX = 0;
        let currentTranslate = 0;
        let prevTranslate = 0;
        let isDragging = false;
        let animating = false;

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

        // キーボード（右開き：左キー＝次へ・右キー＝戻る）
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') nextPage();
            if (e.key === 'ArrowRight') prevPage();
        });

        // ─── ドラッグハンドラー ───
        function dragStart(e) {
            if (animating) return;
            isDragging = true;
            startX = e.clientX;
            slider.setPointerCapture(e.pointerId);
            slider.style.transition = 'none';

            // スワイプヒント消去
            swipeHint.classList.add('hidden');
        }

        function drag(e) {
            if (!isDragging) return;
            e.preventDefault();
            const diff = e.clientX - startX;
            currentTranslate = prevTranslate + diff;
            slider.style.transform = `translateX(${currentTranslate}px)`;
        }

        function dragEnd(e) {
            if (!isDragging) return;
            isDragging = false;

            const movedBy = currentTranslate - prevTranslate;
            const threshold = 40; // スワイプ判定の閾値(px)

            /*
             * 右開き本のロジック：
             *   画面を右から左へスワイプ(movedBy < 0) → 次のページ(currentPage++)
             *   画面を左から右へスワイプ(movedBy > 0) → 前のページ(currentPage--)
             */
            if (movedBy < -threshold && currentPage < totalPages - 1) {
                currentPage++;
                animateTurn('next');
            } else if (movedBy > threshold && currentPage > 0) {
                currentPage--;
                animateTurn('prev');
            } else {
                // 閾値に達しなかった場合：現在ページに戻る
                goToPage(currentPage);
            }
        }

        // ─── ページめくりアニメーション ───
        function animateTurn(direction) {
            animating = true;
            const page = pages[currentPage];

            // めくりエフェクトクラス付与
            if (direction === 'next') {
                // 前のページのシャドーを見せる
                const prevPage = pages[currentPage - 1];
                if (prevPage) {
                    prevPage.classList.add('turning-out');
                }
            }
            page.classList.add('turning-in');

            // アニメーション完了後にクリーンアップ
            setTimeout(() => {
                pages.forEach(p => {
                    p.classList.remove('turning-out');
                    p.classList.remove('turning-in');
                });
                animating = false;
            }, 500);

            // スライド位置を正規化
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

        // ─── 初期化 ───
        updateSliderPosition();
        updateIndicator();
    })();