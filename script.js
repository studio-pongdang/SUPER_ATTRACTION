/* ==========================================================================
   [SUPER ATTRACTION] MAIN SCRIPT (FIXED VERSION)
   - 수정 사항: 오디오 태그 탐색 시점을 '로드 완료 후'로 변경하여 에러 방지
   ========================================================================== */

// 1. GSAP 플러그인 등록
gsap.registerPlugin(ScrollTrigger);

// 2. 음악 재생 상태 변수
let isMusicStarted = false;

/* ==========================================================================
   [CORE 1] BGM 엔진 (DOM 로드 후 탐색하도록 수정됨)
   ========================================================================== */
function setupBGM() {
    // ★ 수정: 함수가 실행될 때(페이지 로드 후) 태그를 찾도록 변경
    const bgmAudio = document.getElementById('bgm-audio');
    const bgmBtn = document.getElementById('bgm-toggle');

    if (!bgmAudio) {
        console.error("❌ [AUDIO] 오디오 태그를 찾을 수 없습니다. (ID: bgm-audio 확인 필요)");
        return;
    }

    // 초기 볼륨 설정
    bgmAudio.volume = 0.5;

    // 재생 시도 함수
    const tryPlay = () => {
        if (isMusicStarted) return;

        bgmAudio.play().then(() => {
            console.log("🎵 [AUDIO] 재생 성공!");
            isMusicStarted = true;
            if (bgmBtn) bgmBtn.classList.add('playing');
            removeInteractionListeners();
        }).catch(error => {
            console.warn("⚠️ [AUDIO] 자동 재생 차단됨. 사용자 클릭 대기 중...");
        });
    };

    // 사용자 상호작용 감지
    const interactionEvents = ['click', 'keydown', 'touchstart', 'scroll'];
    const triggerAudio = () => tryPlay();

    interactionEvents.forEach(event => {
        document.addEventListener(event, triggerAudio, { once: true });
    });

    function removeInteractionListeners() {
        interactionEvents.forEach(event => {
            document.removeEventListener(event, triggerAudio);
        });
    }

    // 버튼 클릭 제어
    if (bgmBtn) {
        bgmBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (bgmAudio.paused) {
                bgmAudio.play();
                bgmBtn.classList.add('playing');
                isMusicStarted = true;
            } else {
                bgmAudio.pause();
                bgmBtn.classList.remove('playing');
            }
        });
    }

    // 1초 후 자동 시도
    setTimeout(tryPlay, 1000);
}

/* ==========================================================================
   [CORE 2] 인트로 시퀀스
   ========================================================================== */
async function runIntroSequence() {
    const wrapper = document.getElementById('intro-wrapper');
    const hero = document.getElementById('hero');
    const nav = document.getElementById('main-nav');
    const sequences = ['seq-1', 'seq-2', 'seq-3'];

    await new Promise(r => setTimeout(r, 200));

    for (let id of sequences) {
        const el = document.getElementById(id);
        if (!el) continue;
        el.style.visibility = 'visible';
        el.style.opacity = '0';
        requestAnimationFrame(() => { el.style.opacity = '1'; });
        await new Promise(r => setTimeout(r, 600));
        el.style.opacity = '0';
        await new Promise(r => setTimeout(r, 200));
        el.style.visibility = 'hidden';
    }

    if (wrapper) wrapper.classList.add('open');
    setTimeout(() => {
        if (hero) hero.classList.add('active');
        if (nav) nav.classList.add('active');
        document.body.classList.remove('is-loading');
        document.body.style.overflowY = 'auto';
        setTimeout(() => { if (wrapper) wrapper.remove(); }, 1500);
    }, 200);
}

/* ==========================================================================
   [CORE 3] 유니버스 가로 스크롤
   ========================================================================== */
function setupUniverseScroll() {
    const track = document.querySelector(".horizontal-scroll-track");
    if (!track) return;

    gsap.to(track, {
        x: () => -(track.scrollWidth - window.innerWidth),
        ease: "none",
        scrollTrigger: {
            trigger: "#universe-pin-wrapper",
            pin: true,
            scrub: 1,
            start: "top top",
            end: () => "+=" + track.scrollWidth,
            invalidateOnRefresh: true
        }
    });
}

/* ==========================================================================
   [CORE 4] 오피스 상태 업데이트
   ========================================================================== */
function updateOfficeStatus() {
    const now = new Date();
    const hour = now.getHours();
    let quotes = { minju: "", yukyeong: "", chaeeun: "" };

    if (hour >= 8 && hour < 12) {
        quotes.minju = "좋은 아침입니다. 금주 해외 리그 리뷰 일정 체크했습니다.";
        quotes.yukyeong = "으아... 대표님... 샷 추가 아메리카노 수혈이 시급해요...";
        quotes.chaeeun = "안녕하세요. 오늘 촬영 소스 백업 다 해놨어요.";
    } else if (hour >= 12 && hour < 13) {
        quotes.minju = "식사는 하셨습니까? 저는 간단하게 샌드위치 먹으려고요.";
        quotes.yukyeong = "대박! 오늘 구내식당 메뉴 미쳤는데요? 빨리 가요!!";
        quotes.chaeeun = "편의점 다녀올게요. 삼각김밥이나 먹을까...";
    } else if (hour >= 13 && hour < 19) {
        quotes.minju = "(타자 치는 중)...아, 죄송합니다. 전술 분석 글 쓰는데 집중하느라.";
        quotes.yukyeong = "썸네일 이거 어때요? 폰트가 좀 킹받나? 다시 해볼게요!";
        quotes.chaeeun = "지금 렌더링 돌리는 중이니까 제 컴 건들지 마세요. 터져요.";
    } else if (hour >= 19 && hour < 22) {
        quotes.minju = "먼저 들어가세요. 저는 이 파트까지만 마무리하고 가겠습니다.";
        quotes.yukyeong = "대표니임... 저 오늘 집에는 갈 수 있는 거죠? 네? ㅠㅠ";
        quotes.chaeeun = "야근 확정임? 그럼 저녁 법카로 마라탕 시켜주세요.";
    } else {
        quotes.minju = "[부재중] (도르트문트 경기 라이브 보는 중일 확률 99%)";
        quotes.yukyeong = "[퇴근] 넷플릭스 보는 중! 낼 봐요 대표님~👋";
        quotes.chaeeun = "[OFF] 연락X. 내일 아침에 얘기하죠.";
    }

    const updateText = (id, text) => {
        const el = document.querySelector(`#card-${id} .char-quote`);
        if (el) el.innerText = `"${text}"`;
    };

    updateText('minju', quotes.minju);
    updateText('yukyeong', quotes.yukyeong);
    updateText('chaeeun', quotes.chaeeun);
}

/* ==========================================================================
   [CORE 5] 미디어 갤러리 시스템
   ========================================================================== */
function setupGallery() {
    const slider = document.querySelector('.media-slider');
    if (!slider) return;

    let htmlCode = '';
    for (let i = 1; i <= 82; i++) {
        let charClass = '';
        let charName = '';
        let fileExt = '.png';

        if (i <= 26) { charClass = 'minju'; charName = '김민주'; }
        else if (i <= 52) { charClass = 'yukyeong'; charName = '채유경'; }
        else if (i <= 78) { charClass = 'chaeeun'; charName = '이채은'; }
        else {
            charClass = 'thumb'; charName = '썸네일';
            if (i <= 81) fileExt = '.jpg';
            else if (i === 82) fileExt = '.gif';
        }

        htmlCode += `
            <div class="media-item ${charClass}">
                <div class="media-overlay"><span>${charName} #${i}</span></div>
                <img src="images/${i}${fileExt}" alt="${charName}" loading="lazy">
            </div>
        `;
    }
    slider.innerHTML = htmlCode;

    const filterBtns = document.querySelectorAll('.filter-btn');
    const mediaItems = document.querySelectorAll('.media-item');
    const gallerySection = document.getElementById('gallery');
    const resetBtn = document.getElementById('reset-filter');

    filterBtns.forEach(btn => {
        if (btn.id === 'reset-filter') return;

        btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            if (resetBtn) resetBtn.classList.remove('active');

            const filterValue = btn.getAttribute('data-filter');

            mediaItems.forEach(item => {
                if (filterValue === 'all' || item.classList.contains(filterValue)) {
                    item.style.setProperty('display', 'block', 'important');
                } else {
                    item.style.setProperty('display', 'none', 'important');
                }
            });

            if (gallerySection) {
                const sectionTop = gallerySection.offsetTop;
                const currentScroll = window.pageYOffset;
                if (currentScroll > sectionTop) {
                    window.scrollTo({ top: sectionTop - 80, behavior: 'auto' });
                }
            }
        });
    });

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            const minjuBtn = document.querySelector('.filter-btn[data-filter="minju"]');
            if (minjuBtn) minjuBtn.click();
            gsap.fromTo(resetBtn, { rotation: 0 }, { rotation: 360, duration: 0.5 });
        });
    }

    const firstBtn = document.querySelector('.filter-btn[data-filter="minju"]');
    if (firstBtn) firstBtn.click();
}

/* ==========================================================================
   [CORE 6] 기타 인터랙션
   ========================================================================== */
function setupInteractions() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            const targetId = btn.getAttribute('data-tab');
            const targetContent = document.getElementById(`tab-${targetId}`);
            if (targetContent) targetContent.classList.add('active');
        });
    });

    document.querySelectorAll('.nav-menu a').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                window.scrollTo({ top: targetSection.offsetTop, behavior: 'smooth' });
            }
        });
    });

    const cursor = document.querySelector('.cursor');
    if (cursor) {
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        });
        document.querySelectorAll('a, button, .char-card, .media-item').forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursor.style.transform = 'scale(4)';
                cursor.style.backgroundColor = 'rgba(207, 255, 4, 0.8)';
            });
            el.addEventListener('mouseleave', () => {
                cursor.style.transform = 'scale(1)';
                cursor.style.backgroundColor = 'var(--main-color)';
            });
        });
    }
}

/* ==========================================================================
   [MASTER] 통합 실행
   ========================================================================== */
window.addEventListener('load', () => {
    console.log("🚀 [SYSTEM] PV SITE 초기화 시작...");

    // 오디오 태그가 확실히 로드된 후 실행되도록 여기서 호출
    runIntroSequence();
    setupUniverseScroll();
    setupGallery();
    setupInteractions();

    // ★ BGM 설정 (이제 에러 안 남!)
    setupBGM();

    updateOfficeStatus();
    setInterval(updateOfficeStatus, 60000);
});