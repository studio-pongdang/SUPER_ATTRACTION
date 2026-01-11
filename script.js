window.addEventListener('load', () => {
    const wrapper = document.getElementById('intro-wrapper');
    const hero = document.getElementById('hero');
    const nav = document.getElementById('main-nav');

    // [수정] 인트로 시퀀스 (3배 빠른 한국인 속도 버전)
    async function runSequence() {
        const sequences = ['seq-1', 'seq-2', 'seq-3'];
        // 초기 대기 시간 (접속하자마자 너무 빠르면 놀라니까 아주 살짝 대기)
        await new Promise(r => setTimeout(r, 100));

        for (let id of sequences) {
            const el = document.getElementById(id);
            if (!el) continue;

            // 1. 나타나기
            el.style.visibility = 'visible';
            el.style.opacity = '1';
            el.style.transform = 'translate(-50%, -60%)';

            // [핵심 1] 텍스트 보여주는 시간: 1300 -> 400 (0.4초)
            await new Promise(r => setTimeout(r, 400));

            // 2. 사라지기
            el.style.opacity = '0';
            el.style.transform = 'translate(-50%, -70%)';

            // [핵심 2] 다음 글자 대기 시간: 500 -> 100 (0.1초)
            await new Promise(r => setTimeout(r, 100));
        }

        // 셔터 개방
        wrapper.classList.add('open');

        // 본문 콘텐츠 활성화
        setTimeout(() => {
            hero.classList.add('active');
            nav.classList.add('active');
            document.body.style.overflowY = 'auto';

            // 메모리 해제 및 껍데기 삭제
            setTimeout(() => wrapper.remove(), 1500);

            // [핵심 3] 셔터 열리기 전 대기: 900 -> 200 (0.2초)
        }, 200);
    }

    runSequence();
});

// [복구] 내비게이션 Smooth Scroll 인터랙션
document.querySelectorAll('.nav-menu a').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetSection = document.querySelector(targetId);

        if (targetSection) {
            window.scrollTo({
                top: targetSection.offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// 커서 및 전역 호버 인터랙션
const cursor = document.querySelector('.cursor');
document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
});

document.querySelectorAll('a, .char-card, .media-item').forEach(el => {
    el.addEventListener('mouseenter', () => {
        cursor.style.transform = 'scale(5)';
        cursor.style.backgroundColor = 'var(--main-color)';
    });
    el.addEventListener('mouseleave', () => {
        cursor.style.transform = 'scale(1)';
    });
});

// GSAP 플러그인 등록 (반드시 필요)
gsap.registerPlugin(ScrollTrigger);

window.addEventListener('load', () => {

    // [기존 인트로 시퀀스 로직은 여기 위에 유지...]

    // Universe 가로 스크롤 (Pinning) 수정본
    const panels = gsap.utils.toArray(".pin-panel");

    gsap.to(panels, {
        xPercent: -100 * (panels.length - 1), // 3개면 -200% 이동
        ease: "none",
        scrollTrigger: {
            trigger: "#universe-pin-wrapper",
            pin: true, // 화면 고정
            scrub: 1, // 1초 지연을 주어 부드럽게 (숫자가 클수록 더 느긋하게 따라옴)
            start: "top top", // 섹션 맨 위가 화면 맨 위에 닿을 때 시작
            end: "+=3000",

            // [핵심 수정] 스크롤 길이를 강제로 늘려서 천천히 넘어가게 함
            // "+=3000"은 3000px만큼 스크롤해야 끝난다는 뜻입니다.
            // 너무 빠르면 이 숫자를 4000, 5000으로 늘리세요.
            end: "+=3000",
        }
    });
    // [추가 코드] 진행 바 차오르는 애니메이션
    gsap.to(".progress-fill-bar", {
        width: "100%", // 100%까지 채우기
        ease: "none",
        scrollTrigger: {
            trigger: "#universe-pin-wrapper",
            start: "top top",
            end: "+=3000", // ★중요: 위와 똑같이 3000으로 맞춰주세요
            scrub: 1
        }
    });

    /* [BGM Control Logic: First Interaction Sync] */
    const bgmAudio = document.getElementById('bgm-audio');
    const bgmBtn = document.getElementById('bgm-toggle');

    bgmAudio.volume = 1.0;

    // [핵심] 음악 재생을 시도하는 함수
    function playMusic() {
        bgmAudio.play().then(() => {
            // 재생 성공 시
            bgmBtn.classList.add('playing');

            // 성공했으니 감시 장치들 해제 (메모리 절약)
            document.removeEventListener('click', playMusic);
            document.removeEventListener('scroll', playMusic);
            document.removeEventListener('wheel', playMusic);
            document.removeEventListener('keydown', playMusic);
            document.removeEventListener('touchstart', playMusic);
        }).catch(error => {
            // 브라우저가 막으면? -> 다음 인터랙션을 기다림 (조용히 넘어감)
            console.log("브라우저 정책상 대기 중...");
        });
    }

    // 1. 로딩 끝나면 일단 한번 찔러보기 (운 좋으면 재생됨)
    window.addEventListener('load', () => {
        setTimeout(() => {
            playMusic();
        }, 800);
    });

    // 2. 만약 막혔다면? -> 사용자가 "뭐라도 하는 순간" 재생 시작
    // (클릭, 스크롤, 휠, 키보드, 터치 등 모든 동작을 감시)
    document.addEventListener('click', playMusic);
    document.addEventListener('scroll', playMusic);
    document.addEventListener('wheel', playMusic);
    document.addEventListener('keydown', playMusic);
    document.addEventListener('touchstart', playMusic);


    // 3. 우측 하단 버튼 기능 (수동 조작용)
    bgmBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        if (bgmAudio.paused) {
            bgmAudio.play();
            bgmBtn.classList.add('playing');
        } else {
            bgmAudio.pause();
            bgmBtn.classList.remove('playing');
        }
    });
});

/* [Media Section Logic: Speed Up & Reset] */

const filterBtns = document.querySelectorAll('.filter-btn');
const mediaItems = document.querySelectorAll('.media-item');
const sliderContainer = document.querySelector('.media-slider');
const resetBtn = document.getElementById('reset-filter'); // 리셋 버튼

// [기능 1] 가로 스크롤 변환 + 속도 부스트 (Speed Up!)
if (sliderContainer) {
    sliderContainer.addEventListener("wheel", (evt) => {
        evt.preventDefault();

        // [핵심] * 3을 곱해서 스크롤 속도를 3배 빠르게!
        // (너무 빠르면 2, 더 빠르게 원하면 4로 수정하세요)
        sliderContainer.scrollLeft += evt.deltaY * 3;
    });
}

// [기능 2] 리셋 버튼 기능 (현재 탭의 처음으로 되감기)
if (resetBtn) {
    resetBtn.addEventListener('click', () => {
        // 1. 현재 활성화된(불 들어온) 버튼을 찾습니다.
        const activeBtn = document.querySelector('.filter-btn.active');

        // 2. 그 버튼을 다시 클릭하게 만듭니다.
        // (그러면 필터링 로직이 다시 돌면서 스크롤이 0으로 가고, 애니메이션도 새로고침 됩니다)
        if (activeBtn) {
            activeBtn.click();
        } else {
            // 혹시라도 활성 버튼이 없으면 스크롤만 맨 앞으로
            if (sliderContainer) sliderContainer.scrollTo({ left: 0, behavior: 'smooth' });
        }

        // 3. 아이콘 빙글 돌리기 효과 (유지)
        gsap.fromTo(resetBtn, { rotation: 0 }, { rotation: 360, duration: 0.5 });
    });
}

// [기능 3] 필터링 로직 (기존과 동일)
filterBtns.forEach(btn => {
    // 리셋 버튼은 필터 로직에서 제외 (위에서 따로 처리함)
    if (btn.id === 'reset-filter') return;

    btn.addEventListener('click', () => {
        // 스타일 변경
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        // 리셋 버튼에는 active 효과 굳이 안 줘도 됨 (취향 차이)
        if (resetBtn) resetBtn.classList.remove('active');

        const filterValue = btn.getAttribute('data-filter');

        // 스크롤 맨 앞으로 초기화
        if (sliderContainer) {
            sliderContainer.scrollTo({ left: 0, behavior: 'smooth' });
        }

        // 이미지 필터링
        mediaItems.forEach(item => {
            if (filterValue === 'all' || item.classList.contains(filterValue)) {
                item.style.display = "block";
                gsap.to(item, {
                    opacity: 1, scale: 1, duration: 0.4, overwrite: true
                });
            } else {
                gsap.to(item, {
                    opacity: 0, scale: 0.8, duration: 0.3, overwrite: true,
                    onComplete: () => { item.style.display = "none"; }
                });
            }
        });
    });
});

/* [Comment Section: Tab Switching] */
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // 1. 모든 버튼과 내용 비활성화
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));

        // 2. 클릭한 버튼 활성화
        btn.classList.add('active');

        // 3. 연결된 내용 보여주기
        const targetId = btn.getAttribute('data-tab'); // story, qna, message
        const targetContent = document.getElementById(`tab-${targetId}`);
        if (targetContent) {
            targetContent.classList.add('active');
        }
    });
});

/* [Real-time Office Mode: Dynamic Quotes] */
function updateOfficeStatus() {
    const now = new Date();
    const hour = now.getHours(); // 0 ~ 23

    // 캐릭터별 멘트 데이터베이스 (세계관 반영 완료)
    let quotes = {
        minju: "",
        yukyeong: "",
        chaeeun: ""
    };

    // 1. 출근 & 오전 업무 (08:00 ~ 11:59)
    if (hour >= 8 && hour < 12) {
        quotes.minju = "좋은 아침입니다. 금주 해외 리그 리뷰 일정 체크했습니다.";
        quotes.yukyeong = "으아... 대표님... 샷 추가 아메리카노 수혈이 시급해요...";
        quotes.chaeeun = "안녕하세요. 오늘 촬영 소스 백업 다 해놨어요.";
    }
    // 2. 점심시간 (12:00 ~ 12:59)
    else if (hour >= 12 && hour < 13) {
        quotes.minju = "식사는 하셨습니까? 저는 간단하게 샌드위치 먹으려고요.";
        quotes.yukyeong = "대박! 오늘 구내식당 메뉴 미쳤는데요? 빨리 가요!!";
        quotes.chaeeun = "편의점 다녀올게요. 삼각김밥이나 먹을까...";
    }
    // 3. 오후 업무 (13:00 ~ 18:59)
    else if (hour >= 13 && hour < 19) {
        quotes.minju = "(타자 치는 중)...아, 죄송합니다. 전술 분석 글 쓰는데 집중하느라.";
        quotes.yukyeong = "썸네일 이거 어때요? 폰트가 좀 킹받나? 다시 해볼게요!";
        quotes.chaeeun = "지금 렌더링 돌리는 중이니까 제 컴 건들지 마세요. 터져요.";
    }
    // 4. 야근 타임 (19:00 ~ 21:59)
    else if (hour >= 19 && hour < 22) {
        quotes.minju = "먼저 들어가세요. 저는 이 파트까지만 마무리하고 가겠습니다.";
        quotes.yukyeong = "대표니임... 저 오늘 집에는 갈 수 있는 거죠? 네? ㅠㅠ";
        quotes.chaeeun = "야근 확정임? 그럼 저녁 법카로 마라탕 시켜주세요.";
    }
    // 5. 퇴근 & 심야 (22:00 ~ 07:59)
    else {
        quotes.minju = "[부재중] (도르트문트 경기 라이브 보는 중일 확률 99%)";
        quotes.yukyeong = "[퇴근] 넷플릭스 보는 중! 낼 봐요 대표님~👋";
        quotes.chaeeun = "[OFF] 연락X. 내일 아침에 얘기하죠.";
    }

    // 멘트 적용하기 (HTML 구조에 맞춰 텍스트 교체)
    // 1. 김민주
    const minjuQuote = document.querySelector('#char-minju .char-quote');
    if (minjuQuote) minjuQuote.innerText = `"${quotes.minju}"`;

    // 2. 채유경 (#char-yukyeong ID가 있는지 확인 필요)
    // 만약 ID가 없다면 querySelector로 순서를 찾거나 ID를 추가해야 합니다.
    // 여기서는 가장 안전하게 클래스 내비게이션으로 찾겠습니다.
    const cards = document.querySelectorAll('.char-card');
    if (cards.length >= 3) {
        // cards[0] = 민주, cards[1] = 유경, cards[2] = 채은
        cards[0].querySelector('.char-quote').innerHTML = `"${quotes.minju}"`;
        cards[1].querySelector('.char-quote').innerHTML = `"${quotes.yukyeong}"`;
        cards[2].querySelector('.char-quote').innerHTML = `"${quotes.chaeeun}"`;
    }
}

// 페이지 로드 시 실행 + 1분마다 갱신 (시간 바뀌면 멘트도 바뀌게)
window.addEventListener('load', updateOfficeStatus);
setInterval(updateOfficeStatus, 60000);