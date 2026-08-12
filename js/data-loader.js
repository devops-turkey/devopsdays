/**
 * DevOpsDays Istanbul - Data Loader
 * Bu dosya speakers.yaml ve organizers.yaml dosyalarını okuyup
 * HTML'e render eder.
 */

// YAML dosyalarını yükle ve render et
document.addEventListener('DOMContentLoaded', function() {
    loadSpeakers();
    loadOrganizers();
    loadSchedule();
    loadSponsors();
});

/**
 * Resolve image path: if only a filename is given, prepend /images/speakers/
 */
function resolveImagePath(image) {
    if (!image) return '/images/speakers/blank-speaker.png';
    if (image.startsWith('/') || image.startsWith('http')) return image;
    return `/images/speakers/${image}`;
}

/**
 * Resolve sponsor image path: if only a filename is given, prepend /images/sponsors/
 */
function resolveSponsorImagePath(image) {
    if (!image) return '';
    if (image.startsWith('/') || image.startsWith('http')) return image;
    return `/images/sponsors/${image}`;
}


async function loadSponsors() {
    try {
        const response = await fetch('data/sponsors.yaml');
        const yamlText = await response.text();
        const data = jsyaml.load(yamlText);

        if (data.enabled === false) {
            renderComingSoon('sponsors-coming-soon', 'Sponsors will be announced soon. Stay tuned!');
            return;
        }

        const tiers = (data.tiers || []).filter(t => t.enabled !== false);

        renderSponsors(tiers, 'sponsors-container');
    } catch (error) {
        console.error('Sponsors yüklenirken hata oluştu:', error);
    }
}

function renderSponsors(tiers, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    let html = '';
    tiers.forEach((tier, index) => {
        const width = tier.width;
        const typeClass = tier.type ? ` sponsors-tier-strip--${tier.type}` : '';

        html += `<div class="row sponsors-wrap sponsors-tier-block" style="padding-top: 40px; justify-content: center; flex-wrap: wrap;">
            <div class="col-lg-12 sponsors-tier-strip-wrap" style="margin-bottom: 0;">
                <div class="sponsors-tier-strip${typeClass}">
                    <h3 class="sponsors-tier-strip-title">${tier.name}</h3>
                </div>
            </div>
            <div class="col-lg-12" style="padding: 0 15px;"><hr style="border-color: rgba(255,255,255,0.15); margin: 8px 0 30px;"></div>`;

        (tier.sponsors || []).forEach(sponsor => {
            const image = resolveSponsorImagePath(sponsor.image);
            html += `
            <div style="flex: 0 0 auto; padding: 0 15px; display: flex; align-items: center; justify-content: center;">
                <a href="${sponsor.url}" class="sponsors-logo" target="_blank" rel="noopener noreferrer">
                    <img src="${image}" alt="${sponsor.name}" style="width: ${width}px; max-width: 100%;">
                </a>
            </div>`;
        });

        html += '</div>';
    });

    container.innerHTML = html;
}

/**
 * "Coming Soon" placeholder mesajını ilgili container'a render et
 */
function renderComingSoon(containerId, message) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = `
        <div class="col-lg-8 mx-auto text-center" style="padding: 10px 0;">
            <p style="color: #fff; font-size: 18px;">${message}</p>
        </div>`;
}

/**
 * Magnific Popup'ı tüm speaker kartları için başlat
 */
function initPopups() {
    if (typeof $ !== 'undefined' && typeof $.fn.magnificPopup !== 'undefined') {
        $('.ts-image-popup').magnificPopup({
            type: 'inline',
            fixedContentPos: true,
            fixedBgPos: true,
            closeBtnInside: true,
            preloader: false,
            midClick: true,
            removalDelay: 300,
            mainClass: 'mfp-fade'
        });
    }
}

/**
 * Speakers verilerini yükle ve render et
 */
async function loadSpeakers() {
    try {
        const response = await fetch('data/speakers.yaml');
        const yamlText = await response.text();
        const data = jsyaml.load(yamlText);

        if (data.enabled === false) {
            renderComingSoon('speakers-coming-soon', 'Speakers will be announced soon. Stay tuned!');
            return;
        }

        const allSpeakers = data.speakers || [];
        
        // Type'a göre ayır
        const keynotes = allSpeakers.filter(s => s.type === 'keynote');
        const regulars = allSpeakers.filter(s => s.type === 'speaker');
        const ignites = allSpeakers.filter(s => s.type === 'ignite');
        
        renderKeynoteSpeakers(keynotes);
        renderSpeakers(regulars, ignites);
    } catch (error) {
        console.error('Speakers yüklenirken hata oluştu:', error);
    }
}

/**
 * Organizers verilerini yükle ve render et
 */
async function loadOrganizers() {
    try {
        const response = await fetch('data/organizers.yaml');
        const yamlText = await response.text();
        const data = jsyaml.load(yamlText);
        renderOrganizers(data.organizers || []);
    } catch (error) {
        console.error('Organizers yüklenirken hata oluştu:', error);
    }
}

/**
 * Keynote Speakers HTML oluştur
 */
function renderKeynoteSpeakers(speakers) {
    const container = document.getElementById('keynote-speakers-container');
    if (!container) return;
    
    let html = '';
    speakers.forEach((speaker, index) => {
        html += createSpeakerCard(speaker, `keynote_${index}`);
    });
    container.innerHTML = html;
    
    // Popup'ları başlat
    setTimeout(initPopups, 100);
}

/**
 * Regular ve Ignite Speakers HTML oluştur
 */
function renderSpeakers(speakers, igniteSpeakers) {
    const container = document.getElementById('speakers-container');
    if (!container) return;
    
    // Tüm speaker'ları birleştir
    const allSpeakers = [...speakers, ...igniteSpeakers];
    
    let html = '';
    allSpeakers.forEach((speaker, index) => {
        html += createSpeakerCard(speaker, `speaker_${index}`);
    });
    container.innerHTML = html;
    
    // Popup'ları başlat
    setTimeout(initPopups, 100);
}

/**
 * Speaker kartı HTML'i oluştur
 */
function createSpeakerCard(speaker, uniqueId) {
    const popupId = `popup_${uniqueId}`;
    const speakerImage = resolveImagePath(speaker.image);
    const companyText = speaker.company ? `<b>@${speaker.company}</b>` : '';
    const isIgnite = speaker.type === 'ignite';
    const isKeynote = speaker.type === 'keynote';
    
    // Designation
    let designation = 'Speaker';
    if (isKeynote) designation = 'Keynote Speaker';
    else if (isIgnite) designation = `${speaker.title}${speaker.company ? ' @' + speaker.company : ''}`;
    
    // Social links HTML
    let socialHtml = '';
    if (speaker.social) {
        if (speaker.social.linkedin) {
            socialHtml += `<a href="${speaker.social.linkedin}" target="_blank"><i class="fa fa-linkedin"></i></a>`;
        }
        if (speaker.social.twitter) {
            socialHtml += `<a href="${speaker.social.twitter}" target="_blank"><i class="fa fa-twitter"></i></a>`;
        }
        if (speaker.social.other) {
            const icon = speaker.social.other_icon || 'fa-globe';
            socialHtml += `<a href="${speaker.social.other}" target="_blank"><i class="fa ${icon}"></i></a>`;
        }
    }
    
    // Ignite session info HTML
    let igniteHtml = '';
    if (isIgnite) {
        igniteHtml = `
            <div class="ignite-session-info" style="margin: 15px 0; padding: 12px; background: linear-gradient(45deg, rgba(255, 215, 0, 0.1), rgba(255, 237, 78, 0.1)); border-left: 4px solid #ffd700; border-radius: 4px;">
                <h4 style="color: #ffd700; margin-bottom: 8px; font-size: 16px;">⚡ Ignite Talk (5 minutes)</h4>
                <h5 style="color: #333; margin-bottom: 0; font-size: 14px;">${speaker.session_name || ''}</h5>
            </div>`;
    }
    
    // Session name HTML (for regular speakers)
    let sessionHtml = '';
    if (speaker.session_name && !isIgnite) {
        sessionHtml = `<h4 class="session-name">${speaker.session_name}</h4>`;
    }
    
    // Bio HTML - handle multiline
    const bioText = (speaker.bio || '').replace(/\n/g, '<br>');
    
    return `
        <div class="col-lg-3 col-md-6 wow fadeInUp" data-wow-duration="1.5s" data-wow-delay="400ms">
            <div class="ts-speaker white-text">
                <div class="speaker-img">
                    <img class="img-fluid" src="${speakerImage}" alt="${speaker.name}" onerror="this.src='/images/speakers/blank-speaker.png';">
                    <a href="#${popupId}" class="view-speaker ts-image-popup" data-effect="mfp-zoom-in">
                        <i class="icon icon-plus"></i>
                    </a>
                </div>
                <div class="ts-speaker-info">
                    <h3 class="ts-title" style="color: #ffffff;">${speaker.name}</h3>
                    <p>${speaker.title} ${companyText}</p>
                </div>
            </div>
            <div id="${popupId}" class="container ts-speaker-popup mfp-hide">
                <div class="row">
                    <div class="col-lg-6">
                        <div class="ts-speaker-popup-img">
                            <img src="${speakerImage}" alt="${speaker.name}" class="img-fluid" onerror="this.src='/images/speakers/blank-speaker.png';">
                        </div>
                    </div>
                    <div class="col-lg-6">
                        <div class="ts-speaker-popup-content">
                            <h3 class="ts-title">${speaker.name}</h3>
                            <span class="speakder-designation" style="color: #000000;">${designation}</span>
                            ${igniteHtml}
                            ${sessionHtml}
                            <p>${bioText}</p>
                            ${socialHtml ? `<div class="ts-speakers-social">${socialHtml}</div>` : ''}
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
}

/**
 * Organizers HTML oluştur
 */
function renderOrganizers(organizers) {
    const container = document.getElementById('organizers-container');
    if (!container) return;
    
    let html = '';
    organizers.forEach(organizer => {
        html += createOrganizerCard(organizer);
    });
    container.innerHTML = html;
}

/**
 * Organizer kartı HTML'i oluştur
 */
function createOrganizerCard(organizer) {
    const organizerImage = resolveImagePath(organizer.image);
    const companyText = organizer.company ? `<b>@${organizer.company}</b>` : '';
    
    return `
        <div class="col-lg-3 col-md-6 wow fadeInUp" data-wow-duration="1.5s" data-wow-delay="400ms">
            <div class="ts-speaker white-text">
                <div class="speaker-img">
                    <img class="img-fluid" src="${organizerImage}" alt="${organizer.name}">
                </div>
                <div class="ts-speaker-info">
                    <h3 class="ts-title" style="color: #ffffff;">${organizer.name}</h3>
                    <p>${organizer.title} ${companyText}</p>
                </div>
            </div>
        </div>`;
}

// Global speaker listesi (schedule için)
let speakersData = [];

/**
 * Schedule verilerini yükle ve render et
 */
async function loadSchedule() {
    try {
        // Önce speakers'ı yükle (fotoğraflar için)
        const speakersResponse = await fetch('data/speakers.yaml');
        const speakersYaml = await speakersResponse.text();
        const speakersObj = jsyaml.load(speakersYaml);
        speakersData = speakersObj.speakers || [];
        
        // Sonra schedule'ı yükle
        const response = await fetch('data/schedule.yaml');
        const yamlText = await response.text();
        const data = jsyaml.load(yamlText);

        if (data.enabled === false) {
            document.getElementById('schedule-full-content').style.display = 'none';
            document.getElementById('schedule-coming-soon-wrapper').style.display = '';
            renderComingSoon('schedule-coming-soon', 'Schedule will be announced soon. Stay tuned!');
            return;
        }

        document.getElementById('schedule-coming-soon-wrapper').style.display = 'none';
        document.getElementById('schedule-full-content').style.display = '';
        renderSchedule(data.tracks || []);
    } catch (error) {
        console.error('Schedule yüklenirken hata oluştu:', error);
    }
}

/**
 * Speaker adından fotoğraf URL'i bul
 */
function getSpeakerImage(speakerName) {
    const speaker = speakersData.find(s => s.name === speakerName);
    return speaker ? resolveImagePath(speaker.image) : null;
}

/**
 * Speaker adından popup ID'sini bul
 */
function getSpeakerPopupId(speakerName) {
    const allSpeakers = speakersData;
    const keynotes = allSpeakers.filter(s => s.type === 'keynote');
    const regulars = allSpeakers.filter(s => s.type === 'speaker');
    const ignites = allSpeakers.filter(s => s.type === 'ignite');

    // Keynote'larda ara
    const keynoteIndex = keynotes.findIndex(s => s.name === speakerName);
    if (keynoteIndex !== -1) return `popup_keynote_${keynoteIndex}`;

    // Regular speaker'larda ara
    const regularIndex = regulars.findIndex(s => s.name === speakerName);
    if (regularIndex !== -1) return `popup_speaker_${regularIndex}`;

    // Ignite speaker'larda ara
    const igniteIndex = ignites.findIndex(s => s.name === speakerName);
    if (igniteIndex !== -1) return `popup_speaker_${regulars.length + igniteIndex}`;

    return null;
}

/**
 * "Ad Soyad, Ad Soyad" gibi birden fazla konuşmacı içeren session.speaker
 * alanını isim listesine ayır (tek konuşmacıda tek elemanlı liste döner)
 */
function getSessionSpeakerNames(session) {
    if (!hasScheduleSpeaker(session)) return [];
    return String(session.speaker).split(',').map(n => n.trim()).filter(Boolean);
}

/**
 * session.speaker içindeki isimlerden speakers.yaml'da eşleşenleri
 * (fotoğraf + popup id ile birlikte) döner
 */
function getMatchedSpeakers(session) {
    return getSessionSpeakerNames(session)
        .map(name => ({ name, image: getSpeakerImage(name), popupId: getSpeakerPopupId(name) }))
        .filter(s => s.image && s.popupId);
}

/**
 * Schedule HTML oluştur
 */
function renderSchedule(tracks) {
    // Mobile schedule
    const mobileContainer = document.getElementById('schedule-mobile-container');
    if (mobileContainer) {
        mobileContainer.innerHTML = renderMobileSchedule(tracks);
    }
    
    // Desktop schedule
    const desktopContainer = document.getElementById('schedule-desktop-container');
    if (desktopContainer) {
        desktopContainer.innerHTML = renderDesktopSchedule(tracks);
    }
    
    // Schedule'daki popup linklerini aktif et
    setTimeout(initPopups, 200);
}

/**
 * İki dil/track paralel yürür: yalnızca type "Track Sessions" olan satırlar.
 * Diğer tüm slotlar (kayıt, keynote, mola, ignite vb.) her iki track için ortaktır.
 */
function isParallelTrackSession(session) {
    return session.type === 'Track Sessions';
}

/**
 * "H:MM - H:MM" formatındaki saat aralığını dakika cinsinden {start, end} olarak döner
 */
function parseTimeRange(timeStr) {
    const [startStr, endStr] = String(timeStr).split(' - ').map(s => s.trim());
    const toMinutes = t => {
        const [h, m] = t.split(':').map(Number);
        return h * 60 + m;
    };
    return { start: toMinutes(startStr), end: toMinutes(endStr) };
}

/**
 * Verilen başlangıç dakikasını kapsayan Track 2 session'ını bulur.
 * Track 2'deki bir session, birden fazla Track 1 slotunu kapsayan geniş bir
 * saat aralığına sahip olabilir (ör. tek bir workshop'un birden fazla slot sürmesi).
 */
function findTrack2SessionForTime(track2Sessions, startMinutes) {
    return track2Sessions.find(s => {
        const range = parseTimeRange(s.time);
        return startMinutes >= range.start && startMinutes < range.end;
    });
}

/**
 * Oturumun EN/TR etiketini belirler: track'e bağlı bir varsayılan yok,
 * her session kendi language alanını (EN/TR) açıkça belirtir
 */
function resolveLangTag(session) {
    return session.language || null;
}

/**
 * Küçük EN/TR dil etiketi HTML'i (shared/ortak satırlarda kullanılmaz)
 */
function langTagHtml(langTag) {
    if (!langTag) return '';
    const cls = langTag === 'EN' ? 'schedule-lang-tag--en' : 'schedule-lang-tag--tr';
    return ` <span class="schedule-lang-tag ${cls}">${langTag}</span>`;
}

/**
 * Mobile schedule HTML
 */
function renderMobileSchedule(tracks) {
    let html = '';
    
    // Track 1'de track-özel olmayan (ortak) session'lar — Track 2 sekmesinde de listelenir
    const sharedSessions = tracks[0].sessions.filter(s => !isParallelTrackSession(s));
    
    tracks.forEach((track, index) => {
        const isActive = index === 0 ? 'show active' : '';
        const trackId = `track${index + 1}`;
        
        html += `<div class="tab-pane fade ${isActive}" id="${trackId}" role="tabpanel">`;
        
        if (index === 0) {
            // Track 1: Tüm session'lar zaten mevcut
            track.sessions.forEach(session => {
                html += createScheduleItem(session, resolveLangTag(session));
            });
        } else {
            // Track 2: Shared session'ları ve track'e özel session'ları birleştir
            const allSessions = [];

            // Ortak program satırları: Track 2 sekmesinde ana salon (Room 1 - Farabi) — paralel Türkçe oda değil
            // Not: sadece Opening, Keynote ve Ignite Talks için "Room 1 (Farabi)" etiketi gösterilir
            const mainStageTypes = ['Opening', 'Keynote', 'Ignite Talks'];
            sharedSessions.forEach(s => {
                allSessions.push({
                    ...s,
                    isMainStage: mainStageTypes.includes(s.type),
                    langTag: resolveLangTag(s)
                });
            });

            // Track 2'ye özel session'ları ekle
            track.sessions.forEach(s => {
                allSessions.push({ ...s, langTag: resolveLangTag(s) });
            });

            // Saate göre sırala (numerik karşılaştırma)
            allSessions.sort((a, b) => {
                const timeA = a.time.split(' - ')[0];
                const timeB = b.time.split(' - ')[0];
                // "8:15" -> 8*60+15 = 495 dakika
                const [hoursA, minsA] = timeA.split(':').map(Number);
                const [hoursB, minsB] = timeB.split(':').map(Number);
                return (hoursA * 60 + minsA) - (hoursB * 60 + minsB);
            });

            allSessions.forEach(session => {
                html += createScheduleItem(session, session.langTag || null);
            });
        }
        
        html += '</div>';
    });
    
    return html;
}

/**
 * Oturum başlığı: boş speaker + eksik title durumunda "undefined" üretmez
 */
function getSessionTitle(session) {
    const speaker = session.speaker != null ? String(session.speaker).trim() : '';
    if (speaker) return speaker;
    const title = session.title != null ? String(session.title).trim() : '';
    if (title) return title;
    const type = session.type != null ? String(session.type).trim() : '';
    if (type) return type;
    return 'Session';
}

function hasScheduleSpeaker(session) {
    return session.speaker != null && String(session.speaker).trim() !== '';
}

/**
 * Desktop schedule HTML (yan yana görünüm)
 */
function renderDesktopSchedule(tracks) {
    if (tracks.length < 2) return '';

    const track1 = tracks[0];
    const track2 = tracks[1];

    let html = `<div class="schedule-listing schedule-listing--table-head" role="row">
            <div class="schedule-slot-time schedule-slot-time--head"><span>Time</span></div>
            <div class="schedule-slot-info-container">
                <div class="schedule-slot-info schedule-head-cell">
                    <h3 class="schedule-slot-title">Room 1 - Farabi</h3>
                </div>
                <div class="schedule-slot-info schedule-head-cell">
                    <h3 class="schedule-slot-title">Room 2 - Aristo</h3>
                </div>
            </div>
        </div>`;

    // Track 1'deki tüm session'ları işle
    let i = 0;
    while (i < track1.sessions.length) {
        const session1 = track1.sessions[i];

        if (isParallelTrackSession(session1)) {
            const range1 = parseTimeRange(session1.time);
            const session2 = findTrack2SessionForTime(track2.sessions, range1.start);

            // Bu Track 2 session'ı kaç ardışık Track 1 slotunu kapsıyor? (ör. uzun süren workshop)
            let span = 1;
            if (session2) {
                const range2 = parseTimeRange(session2.time);
                while (i + span < track1.sessions.length) {
                    const nextSession1 = track1.sessions[i + span];
                    if (!isParallelTrackSession(nextSession1)) break;
                    const nextStart = parseTimeRange(nextSession1.time).start;
                    if (nextStart >= range2.start && nextStart < range2.end) {
                        span++;
                    } else {
                        break;
                    }
                }
            }

            if (span > 1) {
                // Track 2 hücresi birden fazla satırı kapsıyor: birleşik (merged) hücre olarak render et
                html += createMergedTrack2Block(track1.sessions.slice(i, i + span), session2);
                i += span;
                continue;
            }

            html += `<div class="schedule-listing">
                <div class="schedule-slot-time">
                    <span>${session1.time}</span>
                    ${session1.type === 'Ignite Talks' ? 'Ignite' : ''}
                </div>
                <div class="schedule-slot-info-container">
                    ${createDesktopSlotInfo(session1, resolveLangTag(session1))}
                    ${session2 ? createDesktopSlotInfo(session2, resolveLangTag(session2)) : '<div class="schedule-slot-info empty-slot" aria-hidden="true"></div>'}
                </div>
            </div>`;
        } else {
            // Ortak program: tek geniş hücre (Track 1 / 2 ayrımı yok)
            html += `<div class="schedule-listing">
                <div class="schedule-slot-time">
                    <span>${session1.time}</span>
                    ${session1.type === 'Ignite Talks' ? 'Ignite' : ''}
                </div>
                <div class="schedule-slot-info-container schedule-slot-info-container--shared-row">
                    ${createDesktopSlotInfo(session1, resolveLangTag(session1))}
                </div>
            </div>`;
        }

        i++;
    }

    return html;
}

/**
 * Track 2'deki bir session'ın birden fazla Track 1 slotunu kapsadığı durumda
 * (ör. uzun süren workshop), tek bir CSS grid bloğu içinde birleşik hücre render eder.
 */
function createMergedTrack2Block(track1Rows, session2) {
    let cellsHtml = '';

    track1Rows.forEach((session1, idx) => {
        const rowNum = idx + 1;
        const isLast = idx === track1Rows.length - 1;
        const dividerClass = isLast ? '' : ' schedule-merged-cell--divider';

        cellsHtml += `<div class="schedule-merged-cell${dividerClass}" style="grid-row: ${rowNum}; grid-column: 1;">
            <div class="schedule-slot-time">
                <span>${session1.time}</span>
                ${session1.type === 'Ignite Talks' ? 'Ignite' : ''}
            </div>
        </div>`;
        cellsHtml += `<div class="schedule-merged-cell${dividerClass}" style="grid-row: ${rowNum}; grid-column: 2;">
            ${createDesktopSlotInfo(session1, resolveLangTag(session1))}
        </div>`;
    });

    cellsHtml += `<div class="schedule-merged-cell schedule-merged-cell--track2" style="grid-row: 1 / span ${track1Rows.length}; grid-column: 3;">
        ${createDesktopSlotInfo(session2, resolveLangTag(session2))}
    </div>`;

    return `<div class="schedule-listing schedule-merged-block">${cellsHtml}</div>`;
}

/**
 * Ignite speaker'ları speakers.yaml'dan al
 */
function getIgniteSpeakersForSchedule() {
    return speakersData
        .filter(s => s.type === 'ignite')
        .map(s => ({ name: s.name, talk: s.session_name }));
}

/**
 * Tek bir schedule item HTML'i (mobile)
 */
function createScheduleItem(session, langTag = null) {
    const title = getSessionTitle(session);
    let description = session.description || '';
    // Etiket sadece gerçek bir konuşmacısı olan oturumlarda, ismin hemen yanında gösterilir
    const tagHtml = hasScheduleSpeaker(session) ? langTagHtml(langTag) : '';

    // Note varsa ekle
    if (session.note) {
        description += ` <strong>${session.note}</strong>`;
    }

    // Room 1 (Farabi) notu ekle (Track 2'de shared session'lar için: Opening, Keynote, Ignite Talks)
    if (session.isMainStage) {
        description += description ? ' ' : '';
        description += '<em style="color: #ffd700;">(Room 1 - Farabi)</em>';
    }

    // Ignite talks için - speakers.yaml'dan otomatik çek
    if (session.type === 'Ignite Talks') {
        const igniteSpeakers = getIgniteSpeakersForSchedule();
        description = igniteSpeakers
            .map(s => `<strong>${s.name}</strong> — ${s.talk}`)
            .join('<br>');
        if (session.isMainStage) {
            description += '<br><em style="color: #ffd700;">(Room 1 - Farabi)</em>';
        }
    }

    // Speaker varsa tıklanabilir yap (birden fazla konuşmacıda ilkinin popup'ına bağlanır)
    const mobileMatchedSpeakers = getMatchedSpeakers(session);
    const popupId = mobileMatchedSpeakers.length > 0 ? mobileMatchedSpeakers[0].popupId : null;
    const titleHtml = popupId
        ? `<a href="#${popupId}" class="ts-image-popup" data-effect="mfp-zoom-in" style="text-decoration: none; color: inherit;"><h3 class="schedule-slot-title" style="cursor: pointer;">${title}${tagHtml}</h3></a>`
        : `<h3 class="schedule-slot-title">${title}${tagHtml}</h3>`;

    return `
        <div class="schedule-listing">
            <div class="schedule-slot-time">
                <span>${session.time}</span>
                ${session.type}
            </div>
            <div class="schedule-slot-info schedule-slot-info-content">
                ${titleHtml}
                <p>${description}</p>
            </div>
        </div>`;
}

/**
 * Desktop slot info HTML
 */
function createDesktopSlotInfo(session, langTag = null) {
    const title = getSessionTitle(session);
    let description = session.description || '';
    // Etiket sadece gerçek bir konuşmacısı olan oturumlarda, ismin hemen yanında gösterilir
    const tagHtml = hasScheduleSpeaker(session) ? langTagHtml(langTag) : '';

    // Note varsa ekle
    if (session.note) {
        description += ` <strong>${session.note}</strong>`;
    }

    // Ignite talks için - speakers.yaml'dan otomatik çek
    if (session.type === 'Ignite Talks') {
        const igniteSpeakers = getIgniteSpeakersForSchedule();
        return `
            <div class="schedule-slot-info">
                <div class="schedule-slot-info-content">
                    ${igniteSpeakers.map(s =>
                        `<p class="schedule-slot" style="white-space: nowrap;">${s.name} - ${s.talk}</p>`
                    ).join('')}
                </div>
            </div>`;
    }

    // Speaker(ler) varsa fotoğraf(lar) göster ve tıklanabilir yap
    const matchedSpeakers = getMatchedSpeakers(session);

    if (matchedSpeakers.length === 1) {
        const [speaker] = matchedSpeakers;
        return `
            <div class="schedule-slot-info">
                <a href="#${speaker.popupId}" class="ts-image-popup" data-effect="mfp-zoom-in">
                    <img class="schedule-slot-speakers" src="${speaker.image}" alt="${speaker.name}" style="cursor: pointer;">
                </a>
                <div class="schedule-slot-info-content">
                    <a href="#${speaker.popupId}" class="ts-image-popup" data-effect="mfp-zoom-in" style="text-decoration: none; color: inherit;">
                        <h3 class="schedule-slot-title" style="cursor: pointer;">${title}${tagHtml}</h3>
                    </a>
                    <p>${description}</p>
                </div>
            </div>`;
    }

    if (matchedSpeakers.length > 1) {
        const imagesHtml = matchedSpeakers.map(speaker => `
                <a href="#${speaker.popupId}" class="ts-image-popup" data-effect="mfp-zoom-in">
                    <img src="${speaker.image}" alt="${speaker.name}" style="cursor: pointer;">
                </a>`).join('');
        return `
            <div class="schedule-slot-info">
                <div class="schedule-slot-speakers-group">${imagesHtml}
                </div>
                <div class="schedule-slot-info-content">
                    <h3 class="schedule-slot-title">${title}${tagHtml}</h3>
                    <p>${description}</p>
                </div>
            </div>`;
    }

    return `
        <div class="schedule-slot-info">
            <div class="schedule-slot-info-content">
                <h3 class="schedule-slot-title">${title}${tagHtml}</h3>
                ${description ? `<p>${description}</p>` : ''}
            </div>
        </div>`;
}
