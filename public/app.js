let questions = {};
let currentQuestionId = 'Q1';
let answers = {};
let questionHistory = [];
let totalSteps = 0;
let isTransitioning = false;

const container = document.getElementById('surveyContainer');
const resultArea = document.getElementById('resultArea');
const resultSummary = document.getElementById('resultSummary');
const resetBtn = document.getElementById('resetBtn');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');

// ============ SHORT MEDIA FILENAME MAPPING ============
const mediaMap = {
    // ===== DESTINATIONS (Q1) =====
    'Secluded Beach': 'beach',
    'Mountain': 'mountain',
    'City Penthouse': 'city',
    'Luxury Spa Retreat': 'spa',
    'European Beach Club': 'beachclub',
    'Masquerade Ball': 'masquerade',

    // ===== BEACH (Q2_Beach) =====
    'Undress you slowly and kissing every inch of skin as I reveal it.': 'undress-slowly',
    'Push you down onto the sand pin your wrists above your head and take you right there hard and fast.': 'push-down-sand',
    'Lay you down and let me take control—I want to worship YOUR body first.': 'lay-down-control',
    'Carry you into the warm water and do you against the waves.': 'carry-water',

    // ===== BEACH (Q3_Beach) =====
    'You float on your back and I hold you slowly making love to you in the water while you stare at the stars.': 'float-stars',
    'you get on your knees in the shallow water and take me in your mouth (BJ) while the waves crash around us.': 'knees-shallow',
    'I push You up against the rocks and have me way with you—you love when I\'m aggressive.': 'push-rocks',
    'We get out dry off and I lay you down on the blanket and tease you forever before I finally enter you.': 'lay-blanket',

    // ===== BEACH (Q4_Beach) =====
    'Freeze and stay completely still holding our breath while I stay inside You—the danger makes it so much hotter.': 'freeze-danger',
    'Cover your mouth with me hand and keep going even faster and harder.': 'cover-mouth',
    'Pull away laugh and then drag you into the water to hide—and finish you there.': 'pull-away',
    'Ignore them completely. you want me to keep going and make you moan even louder—you want them to HEAR.': 'ignore-louder',

    // ===== BEACH (Q5_Beach) =====
    'You make love to me slowly and gently as the sun dips into the ocean—romantic passionate unforgettable.': 'sunset-love',
    'We do it one last time in the water then collapse on the sand breathless and laughing.': 'last-water',
    'I give you a full body massage with coconut oil under the stars and then we fall asleep naked on the blanket.': 'coconut-massage',
    'I take you from behind on all fours in the sand with the waves crashing at our feet.': 'behind-sand',

    // ===== MOUNTAIN (Q2_Mountain) =====
    'For Me to kiss your neck while I unzip your coat then push it off your shoulders and let it fall.': 'kiss-neck',
    'To push you against the wooden door lift you up and have you wrap your legs around me.': 'wooden-door',
    'To take your hand and lead you to the bedroom without saying a single word.': 'lead-bedroom',
    'To build a fire first while I watch you then come warm you up with my body.': 'build-fire',

    // ===== MOUNTAIN (Q3_Mountain) =====
    'You want me to trace your body with my fingers until you are trembling then slowly enter you from behind while we watch the fire.': 'trace-fire',
    'you want to push me onto my back climb on top and ride me while the firelight dances on our skin.': 'ride-fire',
    'you want me to sit against the headboard and have you sit in my lap facing you so we can kiss deeply the whole time.': 'lap-kiss',
    'you want me to warm you up by kissing every inch of your feet or legs or stomach... everywhere.': 'kiss-everywhere',

    // ===== MOUNTAIN (Q4_Mountain) =====
    'Wake you up by going down on you before you even open your eyes.': 'wake-down',
    'Make you a hot coffee and bring it to you in bed then slowly kiss your neck until we can\'t resist.': 'coffee-kiss',
    'Push you onto the bed straddle you and tell you you\'re not allowed to move until I say so.': 'straddle-control',
    'Put on nothing but a thick sweater sit in my lap by the fire and kiss you forever before we even think about sex.': 'sweater-fire',

    // ===== MOUNTAIN (Q5_Mountain) =====
    'Skin to skin facing each other legs intertwined slow and deep while we whisper.': 'skin-whisper',
    'i spoon you from behind wrap my arms around you and take you slowly while you close your eyes.': 'spoon-slow',
    'We take turns—one of us on top then the other—to \'generate body heat\'... a lot.': 'body-heat',
    'We just kiss and touch all night building up the tension until sunrise then we EXPLODE.': 'tension-sunrise',

    // ===== CITY (Q2_City) =====
    'Press you against the floor-to-ceiling window kiss you deeply and let the whole city watch.': 'window-watch',
    'Throw you on the giant bed and rip your clothes off like you can\'t wait another second.': 'rip-clothes',
    'Pour us both a drink stand with me at the window and kiss you slowly while the city buzzes below.': 'drink-window',
    'Get on your knees in front of me right there by the window and make me BJ.': 'knees-bj',

    // ===== CITY (Q3_City) =====
    'Take you against the window with your hands pressed against the glass.': 'hands-glass',
    'Use that silk tie on your wrists and have complete control over you.': 'silk-tie',
    'Order room service and answer the door completely naked under your robe.': 'room-service',
    'Put on some music dance with me slowly and then make love to me on the floor.': 'music-floor',

    // ===== CITY (Q4_City) =====
    'I push you against the door still fully dressed and kiss you like I am starving.': 'door-starving',
    'You tell me to take off YOUR clothes slowly—you want to be worshipped first.': 'worshipped',
    'i make you stand against the window and you get on your knees in front of me.': 'stand-window',
    'I lead You to the bed push you down and ride me while still wearing that stunning dress.': 'ride-dress',

    // ===== CITY (Q5_City) =====
    'i blindfold you and have me way with you—you want to feel everything without seeing it.': 'blindfold',
    'We take a bubble bath together in that giant tub then move to the bed then back to the window.': 'bubble-bath',
    'We order champagne put on slow music and you dance with me naked by the window.': 'champagne',
    'i tell you to get on your knees and i use you however i want—then we switch roles.': 'switch-roles',

    // ===== SPA (Q2_Spa) =====
    'your are shy at first but you love it. you want to hold my hand and just watch them.': 'shy-watch',
    'you are intrigued and you whisper to me that we should try to outdo them.': 'intrigued',
    'It turns you on and you want to find a more private spot and do the same thing with you.': 'private-spot',
    'It makes you nervous but you love the exhibitionism of it—you would want me to touch you right there in the water.': 'exhibitionism',

    // ===== SPA (Q3_Spa) =====
    'you want Us to make love on the massage beds without caring if someone might enter suddenly.': 'massage-beds',
    'you want me to undress you and prepare you for the massage even the massauses were there.': 'prepare-massage',
    'you want us to take shower together there naked.': 'shower-together',
    'you will wait until we are alone then do what we want.': 'alone-time',

    // ===== SPA (Q4_Spa_Male) =====
    'Yes please. you close your eyes and let him take you there.': 'male-yes',
    'you say yes but you ask if I can be the one to finish You off while he watches.': 'male-finish',
    'You say yes—and then You ask if You can return the favor for HIM.': 'male-return',
    'You say no—You only want My hands on You not anyone else\'s.': 'male-no',

    // ===== SPA (Q4_Spa_Female) =====
    'you kiss her. you want to taste her lips while her hands keep working on you.': 'female-kiss',
    'you take her hand and guide it lower. you want HER to finish you.': 'female-guide',
    'you stop her and ask me to join in—you want BOTH of us touching you at the same time.': 'female-both',
    'It\'s too much. you pull away and say \'you only want your boyfriend\'s hands.\'': 'female-too-much',

    // ===== BEACH CLUB (Q2_BeachClub) =====
    'I look at you for permission. If you nod, I dance with her, but I keep my eyes on you.': 'permission-dance',
    'I grab your hand and pull you into the dance WITH me and her.': 'grab-dance',
    'I turn her down and pull you closer—I only want to dance with you.': 'turn-down',
    'I dance with her—grinding, touching—because I know it drives you wild to watch.': 'grinding',

    // ===== BEACH CLUB (Q3_BeachClub) =====
    'You dance with him—close sensual—while I look at you the whole time.': 'sensual-dance',
    'you let him dance with you, and you whisper in his ear that my boyfriend is watching.': 'whisper-watch',
    'you dance with him then you pull him close and kiss him—because you know that\'s YOUR fantasy.': 'kiss-him',
    'you politely decline and come back to me. you only want ME.': 'decline',

    // ===== BEACH CLUB (Q4_BeachClub_Kiss) =====
    'Your hands are in his hair. You are kissing him back just as passionately.': 'hands-hair',
    'Your eyes are OPEN and You are looking directly at me while he kisses me.': 'eyes-open',
    'Your hand reaches back to find YOU—I want to touch you while he kisses me.': 'reaches-back',
    'I pull back after a few seconds. A little kiss is fun but You don\'t want to go too far.': 'pull-back',

    // ===== BEACH CLUB (Q5_BeachClub_Watch) =====
    'Your are jealous but in a hot way. You march over and pull Me away from her to kiss Me.': 'jealous',
    'You sit back and enjoy the show. It turns You on to see Me desired.': 'enjoy-show',
    'You come over and join in—You start kissing HER while I watch.': 'join-kiss',
    'You are actually angry. you don\'t want to share me at all.': 'angry',

    // ===== MASQUERADE (Q2_Masquerade) =====
    'you want to watch them—let\'s find a spot nearby and observe.': 'watch-observe',
    'you want to find our OWN corner and do the same thing.': 'own-corner',
    'you are shocked but intrigued—you want to see if they invite us to join.': 'shocked-intrigued',
    'you pull me close and whisper, \'Let\'s find a room of our own.\'': 'room-own',

    // ===== MASQUERADE (Q3_Masquerade) =====
    'YES. Take her hand and lead her up looking back at me with a wicked smile.': 'yes-lead',
    'YES but you want to set ground rules first—you are in control.': 'yes-rules',
    'Maybe. you want to see how she kisses ME first before you decide.': 'maybe-kiss',
    'No. you are not interested in sharing tonight.': 'no-sharing',

    // ===== MASQUERADE (Q4_Masquerade_FFM) =====
    'you want me to kiss her while you watch—then you join in.': 'ffm-watch',
    'you want her on her knees for me and you on your knees for ME as well.': 'ffm-knees',
    'you want to take her while I take you from behind—a perfect triangle.': 'ffm-triangle',
    'you want us both on you—one at your mouth one at you down there you know.': 'ffm-both',

    // ===== MASQUERADE (Q5_Masquerade_WatchHim) =====
    'He kisses you touches you and you let him—while I sit back and watch touching myself.': 'watch-him',
    'He kisses you, but you stop him and say, \'Only my boyfriend can have me—but you can watch.\'': 'watch-only',
    'He touches you but you whisper \'The only way this happens is if my boyfriend joins in too.\'': 'join-too',
    'You say yes to everything. He takes you and I watch—and it\'s the hottest thing you\'ve ever done.': 'yes-everything',

    // ===== MASQUERADE (Q6_Masquerade_WatchHer) =====
    'Watching touching yourself loving every second of the show.': 'watch-her',
    'Coming over to join—us don\'t want to just watch you want to be involved.': 'join-involved',
    'Getting possessive—you push her aside and take her place.': 'possessive',
    'You whisper \'When she leaves you\'re MINE for the rest of the night.\'': 'whisper-mine',

    // ===== FINAL ROUNDS =====
    'The beach the spa and the threesome.': 'beach-spa-threesome',
    'The mountains the masquerade ball and watching you with another girl.': 'mountain-masquerade',
    'The city penthouse the beach club and the nude massage.': 'city-beachclub',
    'The spa the beach club and dancing with strangers.': 'spa-beachclub',

    'The nude massage with a happy ending.': 'happy-ending',
    'Dancing and kissing someone else while I watch.': 'dancing-kissing',
    'A threesome with another girl.': 'threesome-girl',
    'Being completely naked and intimate in a public/semi-public place.': 'public-naked',

    '7—you are excited but nervous. you want me to kiss you slowly.': 'excited-7',
    '9—you want me RIGHT NOW. Take you to the bedroom.': 'right-now-9',
    '10—you are dripping and you are not waiting another second. Take you right here.': 'dripping-10',
    '8—you want me to whisper in your ear what i am going to do to you.': 'whisper-8',

    'I carrying You to the bedroom and making love to You slowly all night.': 'carry-bedroom',
    'I am taking control and having My way with you right here right now.': 'taking-control',
    'Us talking about all of this while you touch me under the table.': 'under-table',
    'Us falling asleep naked tangled up in each other no words needed.': 'tangled-asleep'
};

// ============ GET MEDIA FILENAME ============
function getMediaName(optionText) {
    if (mediaMap[optionText]) {
        return mediaMap[optionText];
    }
    return optionText
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 40);
}

// ============ CHECK IF MEDIA EXISTS ============
async function mediaExists(mediaName) {
    const imagePath = `/media/images/${mediaName}.jpg`;
    const videoPath = `/media/videos/${mediaName}.mp4`;

    try {
        // Check image
        const imageResponse = await fetch(imagePath, { method: 'HEAD' });
        if (imageResponse.ok) return true;

        // Check video
        const videoResponse = await fetch(videoPath, { method: 'HEAD' });
        if (videoResponse.ok) return true;

        return false;
    } catch {
        return false;
    }
}

// ============ CHECK IF VIDEO EXISTS ============
async function videoExists(mediaName) {
    const videoPath = `/media/videos/${mediaName}.mp4`;
    try {
        const response = await fetch(videoPath, { method: 'HEAD' });
        return response.ok;
    } catch {
        return false;
    }
}

async function loadQuestions() {
    try {
        const response = await fetch('/api/questions');
        questions = await response.json();

        if (Object.keys(questions).length === 0) {
            container.innerHTML = '<p>No questions found. Please check questions.txt</p>';
            return;
        }

        renderQuestion('Q1');
    } catch (error) {
        console.error('Error loading questions:', error);
        container.innerHTML = '<p>Error loading survey. Please refresh.</p>';
    }
}

// ============ SHOW TRANSITION SCREEN ============
function showTransition(selectedOption, questionId, onComplete) {
    isTransitioning = true;

    const mediaName = getMediaName(selectedOption);
    const imagePath = `/media/images/${mediaName}.jpg`;
    const videoPath = `/media/videos/${mediaName}.mp4`;

    container.innerHTML = `
        <div class="transition-screen" style="
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 400px;
            padding: 2rem;
            text-align: center;
            background: linear-gradient(145deg, #f7f0fc 0%, #e9def0 100%);
            border-radius: 28px;
            margin: 1.2rem 0;
        ">
            <div style="font-size: 1.2rem; color: #7e4a9e; font-weight: 600; margin-bottom: 1rem;">
                ✨ You chose:
            </div>
            <div style="font-size: 1.3rem; color: #2d1b3d; font-weight: 700; margin-bottom: 1.5rem; max-width: 80%;">
                "${selectedOption}"
            </div>
            <div style="
                width: 100%;
                max-width: 500px;
                border-radius: 20px;
                overflow: hidden;
                box-shadow: 0 8px 30px rgba(0,0,0,0.15);
                background: #000;
                position: relative;
            ">
                <video id="transitionVideo" src="${videoPath}" 
                       style="width: 100%; max-height: 350px; object-fit: cover; display: none;"
                       autoplay muted playsinline
                       onerror="this.style.display='none'; document.getElementById('transitionImage').style.display='block';">
                </video>
                <img id="transitionImage" src="${imagePath}" 
                     style="width: 100%; max-height: 350px; object-fit: cover; display: none;"
                     onerror="this.style.display='none'; document.querySelector('.transition-fallback').style.display='flex';">
                <div class="transition-fallback" style="
                    display: none;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 3rem;
                    background: linear-gradient(145deg, #f7f0fc, #e9def0);
                    min-height: 250px;
                ">
                    <span style="font-size: 4rem; margin-bottom: 1rem;">🎨</span>
                    <span style="color: #5e4a6b; font-weight: 600;">No media available</span>
                    <span style="color: #888; font-size: 0.9rem; margin-top: 0.5rem;">But it's still a great choice! 💖</span>
                </div>
            </div>
            <div style="margin-top: 1.5rem; font-size: 0.9rem; color: #888;">
                <span class="transition-timer">⏳ 3</span> seconds
            </div>
            <button class="btn-primary" id="skipTransitionBtn" style="margin-top: 1rem; font-size: 0.9rem; padding: 0.5rem 1.5rem;">
                Skip ➜
            </button>
        </div>
    `;

    const video = document.getElementById('transitionVideo');
    const img = document.getElementById('transitionImage');

    // Check if video exists
    fetch(videoPath, { method: 'HEAD' })
        .then(response => {
            if (response.ok) {
                video.style.display = 'block';
                video.play().catch(() => {
                    video.style.display = 'none';
                    img.style.display = 'block';
                });
            } else {
                img.style.display = 'block';
            }
        })
        .catch(() => {
            img.style.display = 'block';
        });

    let seconds = 3;
    const timerElement = document.querySelector('.transition-timer');
    let duration = 3000;

    video.addEventListener('loadedmetadata', function () {
        duration = Math.min(this.duration * 1000, 10000);
        const displaySeconds = Math.ceil(duration / 1000);
        if (timerElement) {
            timerElement.textContent = `⏳ ${displaySeconds}`;
        }
    });

    video.addEventListener('ended', function () {
        if (isTransitioning) {
            clearInterval(timerInterval);
            isTransitioning = false;
            onComplete();
        }
    });

    const timerInterval = setInterval(() => {
        seconds--;
        if (timerElement) {
            timerElement.textContent = `⏳ ${seconds}`;
        }
        if (seconds <= 0) {
            clearInterval(timerInterval);
            if (isTransitioning) {
                isTransitioning = false;
                onComplete();
            }
        }
    }, 1000);

    document.getElementById('skipTransitionBtn').addEventListener('click', function () {
        clearInterval(timerInterval);
        if (isTransitioning) {
            isTransitioning = false;
            onComplete();
        }
    });
}

function renderQuestion(questionId) {
    if (isTransitioning) return;

    const question = questions[questionId];
    if (!question) {
        submitAnswers();
        return;
    }

    const step = questionHistory.length;
    totalSteps = Math.max(totalSteps, step + 1);
    progressFill.style.width = `${Math.min((step / 20) * 100, 100)}%`;
    progressText.textContent = `Question ${step + 1}`;

    const uniqueId = `q_${questionId}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

    let html = `<div class="question-box" data-question-id="${questionId}" data-unique-id="${uniqueId}">
        <div class="question-text">🌸 ${question.question}</div>
        <div class="options-grid">`;

    const hasOther = question.hasOther === true;
    const regularOptions = hasOther ? question.options.slice(0, -1) : question.options;
    const otherOption = hasOther ? question.options[question.options.length - 1] : null;

    regularOptions.forEach((opt, index) => {
        const mediaName = getMediaName(opt);
        const imagePath = `/media/images/${mediaName}.jpg`;
        const videoPath = `/media/videos/${mediaName}.mp4`;
        const optionId = `${uniqueId}_opt_${index}`;

        html += `
            <div class="option-item" data-value="${opt}" data-option-id="${optionId}">
                <input type="radio" name="${uniqueId}_radio" id="${optionId}" value="${opt}">
                <label for="${optionId}">${opt}</label>
                <div class="media-preview">
                    <img src="${imagePath}" alt="${opt}" loading="lazy" onerror="this.style.display='none'">
                    <video src="${videoPath}" muted loop playsinline onerror="this.style.display='none'"></video>
                </div>
            </div>
        `;
    });

    if (hasOther && otherOption) {
        const otherIndex = regularOptions.length;
        const otherId = `${uniqueId}_other`;
        html += `
            <div class="option-item other-option" data-value="other" data-option-id="${otherId}">
                <input type="radio" name="${uniqueId}_radio" id="${otherId}" value="Other">
                <label for="${otherId}" style="font-weight: 700; color: #7e4a9e;">${otherOption}</label>
            </div>
        `;
    }

    html += `</div>`;

    if (hasOther) {
        const textareaId = `${uniqueId}_textarea`;
        const charCountId = `${uniqueId}_charcount`;
        const wordCountId = `${uniqueId}_wordcount`;

        html += `
            <div class="other-textarea-container" id="${uniqueId}_container" style="display: none; margin-top: 1rem; padding: 0.5rem 0;">
                <label for="${textareaId}" style="font-weight: 600; color: #2d1b3d; display: block; margin-bottom: 0.5rem;">✏️ Type your custom answer below:</label>
                <textarea id="${textareaId}" class="other-textarea" placeholder="Write your answer here... (be as detailed as you want)" style="width: 100%; padding: 16px 20px; border-radius: 16px; border: 2px solid #7e4a9e; font-family: 'Quicksand', sans-serif; font-size: 1rem; outline: none; resize: vertical; min-height: 100px; max-height: 400px; line-height: 1.8; background: #faf8fc; transition: border-color 0.2s, box-shadow 0.2s; color: #2d1b3d;"></textarea>
                <div style="display: flex; justify-content: space-between; margin-top: 0.5rem; font-size: 0.85rem; color: #888;">
                    <span id="${charCountId}">0 characters</span>
                    <span id="${wordCountId}">0 words</span>
                </div>
            </div>
        `;
    }

    html += `
        <div class="flex-row">
            ${questionHistory.length > 0 ? `<button class="btn-secondary" id="prevBtn_${uniqueId}">← Back</button>` : ''}
            <button class="btn-primary" id="nextBtn_${uniqueId}">Next →</button>
        </div>
    </div>`;
    container.innerHTML = html;

    setupQuestionEvents(questionId, uniqueId);
}

function setupQuestionEvents(questionId, uniqueId) {
    const otherRadio = document.querySelector(`#${uniqueId}_other`);
    const otherTextareaContainer = document.getElementById(`${uniqueId}_container`);
    const otherTextarea = document.getElementById(`${uniqueId}_textarea`);
    const charCount = document.getElementById(`${uniqueId}_charcount`);
    const wordCount = document.getElementById(`${uniqueId}_wordcount`);
    const otherOptionItem = document.querySelector(`#${uniqueId}_other`)?.closest('.option-item');
    const nextBtn = document.getElementById(`nextBtn_${uniqueId}`);
    const prevBtn = document.getElementById(`prevBtn_${uniqueId}`);

    if (otherRadio && otherTextareaContainer && otherTextarea) {
        otherRadio.addEventListener('change', function () {
            if (this.checked) {
                otherTextareaContainer.style.display = 'block';
                setTimeout(() => {
                    otherTextarea.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    otherTextarea.focus();
                }, 100);
                document.querySelectorAll(`[data-unique-id="${uniqueId}"] .option-item`).forEach(el => {
                    el.style.borderColor = 'transparent';
                    el.style.background = '';
                });
                if (otherOptionItem) {
                    otherOptionItem.style.borderColor = '#7e4a9e';
                    otherOptionItem.style.background = '#f0e6f8';
                }
                this.value = 'Other';
            } else {
                otherTextareaContainer.style.display = 'none';
                otherTextarea.value = '';
                updateCharCount(otherTextarea, charCount, wordCount);
                if (otherOptionItem) {
                    otherOptionItem.style.borderColor = 'transparent';
                    otherOptionItem.style.background = '';
                }
            }
        });

        otherTextarea.addEventListener('input', function () {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 400) + 'px';
            updateCharCount(this, charCount, wordCount);
            if (this.value.trim()) {
                otherRadio.value = this.value.trim();
            } else {
                otherRadio.value = 'Other';
            }
        });

        if (otherOptionItem) {
            otherOptionItem.addEventListener('click', function (e) {
                if (e.target.tagName !== 'TEXTAREA') {
                    otherRadio.checked = true;
                    otherTextareaContainer.style.display = 'block';
                    setTimeout(() => {
                        otherTextarea.focus();
                    }, 100);
                    document.querySelectorAll(`[data-unique-id="${uniqueId}"] .option-item`).forEach(el => {
                        el.style.borderColor = 'transparent';
                        el.style.background = '';
                    });
                    this.style.borderColor = '#7e4a9e';
                    this.style.background = '#f0e6f8';
                    const event = new Event('change');
                    otherRadio.dispatchEvent(event);
                }
            });
            otherTextarea.addEventListener('click', function (e) {
                e.stopPropagation();
            });
        }
    }

    document.querySelectorAll(`[data-unique-id="${uniqueId}"] .option-item:not(.other-option)`).forEach(item => {
        item.addEventListener('click', function () {
            const radio = this.querySelector('input[type="radio"]');
            if (radio) {
                radio.checked = true;
                document.querySelectorAll(`[data-unique-id="${uniqueId}"] .option-item`).forEach(el => {
                    el.style.borderColor = 'transparent';
                    el.style.background = '';
                });
                this.style.borderColor = '#7e4a9e';
                this.style.background = '#ede4f7';
                if (otherTextareaContainer) {
                    otherTextareaContainer.style.display = 'none';
                    if (otherTextarea) {
                        otherTextarea.value = '';
                        updateCharCount(otherTextarea, charCount, wordCount);
                    }
                    if (otherRadio) {
                        otherRadio.value = 'Other';
                    }
                }
            }
        });
    });

    if (nextBtn) {
        nextBtn.addEventListener('click', async function () {
            if (isTransitioning) return;

            const selectedRadio = document.querySelector(`input[name="${uniqueId}_radio"]:checked`);
            if (!selectedRadio) {
                alert('Please pick one option ✨');
                return;
            }

            let answer = selectedRadio.value;

            if (answer === 'Other' || answer === 'other') {
                const otherTextarea = document.getElementById(`${uniqueId}_textarea`);
                if (otherTextarea && otherTextarea.value.trim()) {
                    answer = otherTextarea.value.trim();
                } else {
                    alert('Please type your answer in the text box below ✍️');
                    if (otherTextarea) {
                        otherTextarea.focus();
                    }
                    return;
                }
            }

            answers[questionId] = answer;
            questionHistory.push(questionId);

            if (questionId === 'Q3_Spa') {
                const genderQuestion = {
                    id: 'Q4_Spa_Choice',
                    question: 'Now, for the massage... which gender do you prefer?',
                    options: ['MALE Masseuse', 'FEMALE Masseuse', 'Both', 'Just you', 'Other'],
                    hasOther: true
                };
                questions['Q4_Spa_Choice'] = genderQuestion;
                currentQuestionId = 'Q4_Spa_Choice';

                // Check if media exists before showing transition
                const mediaName = getMediaName(answer);
                const hasMedia = await mediaExists(mediaName);

                if (hasMedia) {
                    showTransition(answer, questionId, () => {
                        renderQuestion('Q4_Spa_Choice');
                    });
                } else {
                    renderQuestion('Q4_Spa_Choice');
                }
                return;
            }

            try {
                const response = await fetch('/api/next-question', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        currentQuestionId: questionId,
                        selectedAnswer: answer
                    })
                });
                const data = await response.json();

                const goToNext = () => {
                    if (data.isLast || !data.nextQuestion) {
                        submitAnswers();
                    } else {
                        currentQuestionId = data.nextQuestion.id;
                        renderQuestion(currentQuestionId);
                    }
                };

                // Check if media exists before showing transition
                const mediaName = getMediaName(answer);
                const hasMedia = await mediaExists(mediaName);

                if (hasMedia) {
                    showTransition(answer, questionId, goToNext);
                } else {
                    goToNext();
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Something went wrong. Please try again.');
            }
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', function () {
            if (questionHistory.length > 0) {
                const prevId = questionHistory.pop();
                delete answers[prevId];
                const lastId = questionHistory[questionHistory.length - 1] || 'Q1';
                currentQuestionId = lastId;
                renderQuestion(lastId);
            }
        });
    }
}

function updateCharCount(textarea, charCountEl, wordCountEl) {
    if (!textarea || !charCountEl || !wordCountEl) return;
    const text = textarea.value;
    const charCountNum = text.length;
    const wordCountNum = text.trim() ? text.trim().split(/\s+/).length : 0;
    charCountEl.textContent = `${charCountNum} characters`;
    wordCountEl.textContent = `${wordCountNum} words`;
}

async function submitAnswers() {
    try {
        container.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <div class="loader"></div>
                <p>Saving your answers...</p>
            </div>
        `;

        const response = await fetch('/api/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ answers })
        });
        const data = await response.json();

        if (data.success) {
            showResults(data.results);
        } else {
            alert('Error saving results. Please try again.');
        }
    } catch (error) {
        console.error('Error submitting answers:', error);
        alert('Error submitting answers. Please try again.');
    }
}

function showResults(results) {
    container.innerHTML = '';
    resultArea.classList.remove('hidden');
    progressFill.style.width = '100%';
    progressText.textContent = '✨ Survey Complete!';

    // ===== GET THE Q1 ANSWER TO PLAY THE RIGHT VIDEO =====
    const q1Answer = answers['Q1'] || '';
    const q1MediaName = getMediaName(q1Answer);
    const q1VideoPath = `/media/videos/${q1MediaName}.mp4`;
    const q1ImagePath = `/media/images/${q1MediaName}.jpg`;

    let html = `
        <div style="background: #e8f5e9; padding: 0.8rem; border-radius: 12px; margin-bottom: 1.5rem; text-align: center; font-weight: 600; color: #2e7d32;">
            ✅ Results saved successfully!
        </div>
        
        <!-- ===== DESTINATION VIDEO SECTION ===== -->
        <div style="background: linear-gradient(145deg, #f7f0fc 0%, #e9def0 100%); border-radius: 28px; padding: 2rem; margin-bottom: 1.5rem; text-align: center; border: 2px solid #b78fc9;">
            <h3 style="color: #2d1b3d; margin-bottom: 0.5rem;">🌍 Your Dream Destination</h3>
            <p style="color: #5e4a6b; margin-bottom: 1rem; font-weight: 600;">${q1Answer || 'No destination selected'}</p>
            <div style="
                width: 100%;
                max-width: 500px;
                border-radius: 20px;
                overflow: hidden;
                box-shadow: 0 8px 30px rgba(0,0,0,0.2);
                background: #000;
                margin: 0 auto;
                position: relative;
            ">
                <video id="resultVideo" src="${q1VideoPath}" 
                       style="width: 100%; max-height: 350px; object-fit: cover; display: none;"
                       controls autoplay muted playsinline
                       onerror="this.style.display='none'; document.getElementById('resultImage').style.display='block';">
                </video>
                <img id="resultImage" src="${q1ImagePath}" 
                     style="width: 100%; max-height: 350px; object-fit: cover; display: none;"
                     onerror="this.style.display='none'; document.querySelector('.result-fallback').style.display='flex';">
                <div class="result-fallback" style="
                    display: none;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 3rem;
                    background: linear-gradient(145deg, #f7f0fc, #e9def0);
                    min-height: 200px;
                ">
                    <span style="font-size: 4rem; margin-bottom: 1rem;">🎬</span>
                    <span style="color: #5e4a6b; font-weight: 600;">No media available for this destination</span>
                </div>
            </div>
            <p style="color: #888; font-size: 0.9rem; margin-top: 0.8rem;">🎥 Your destination video is playing!</p>
        </div>
    `;

    // ===== SURVEY ANSWERS SECTION =====
    html += `
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
    `;

    results.forEach((result, index) => {
        const hasImage = result.image ? true : false;
        const hasVideo = result.video ? true : false;
        const isLongAnswer = result.answer && result.answer.length > 50;

        html += `
            <div style="background: white; border-radius: 20px; padding: 1rem; box-shadow: 0 4px 8px rgba(0,0,0,0.05);">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem; flex-wrap: wrap; gap: 0.5rem;">
                    <span style="font-weight: 700; color: #2d1b3d; flex: 1;">${result.questionText}</span>
                    <span class="result-value" style="${isLongAnswer ? 'max-width: 100%; width: 100%; margin-top: 0.5rem;' : 'max-width: 60%;'} word-wrap: break-word; white-space: pre-wrap; display: block;">${result.answer}</span>
                </div>
                <div style="display: flex; gap: 1rem; flex-wrap: wrap; margin-top: 0.5rem;">
                    ${hasImage ? `<img src="${result.image}" style="max-width: 200px; max-height: 150px; object-fit: cover; border-radius: 12px;" alt="image">` : ''}
                    ${hasVideo ? `<video src="${result.video}" controls style="max-width: 200px; max-height: 150px; border-radius: 12px;"></video>` : ''}
                </div>
            </div>
        `;
    });

    html += `
        <div style="margin-top: 1rem; background: #e3d5ee; padding: 1rem; border-radius: 40px; text-align: center; font-weight: 600; color: #2d1b3d;">
            💖 Perfect plan for you two!
        </div>
        <div style="text-align: center; margin-top: 0.5rem; font-size: 0.9rem; color: #888;">
            <a href="/admin/results" target="_blank" style="color: #7e4a9e;">📊 View all results</a>
        </div>
    </div>`;

    resultSummary.innerHTML = html;

    // ===== AUTO-PLAY THE VIDEO WHEN IT LOADS =====
    setTimeout(() => {
        const video = document.getElementById('resultVideo');
        const img = document.getElementById('resultImage');

        // Check if video exists
        fetch(q1VideoPath, { method: 'HEAD' })
            .then(response => {
                if (response.ok) {
                    video.style.display = 'block';
                    video.play().catch(() => {
                        // If autoplay fails, show image instead
                        video.style.display = 'none';
                        img.style.display = 'block';
                    });
                } else {
                    img.style.display = 'block';
                }
            })
            .catch(() => {
                img.style.display = 'block';
            });
    }, 100);
}

function resetSurvey() {
    currentQuestionId = 'Q1';
    answers = {};
    questionHistory = [];
    totalSteps = 0;
    isTransitioning = false;
    resultArea.classList.add('hidden');
    resultSummary.innerHTML = '';
    progressFill.style.width = '0%';
    progressText.textContent = 'Starting...';
    renderQuestion('Q1');
}

resetBtn.addEventListener('click', resetSurvey);
loadQuestions();