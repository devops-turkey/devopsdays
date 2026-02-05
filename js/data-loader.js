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
});

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
                    <img class="img-fluid" src="${speaker.image}" alt="${speaker.name}" onerror="this.src='/images/speakers/blank-speaker.png';">
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
                            <img src="${speaker.image}" alt="${speaker.name}" class="img-fluid" onerror="this.src='/images/speakers/blank-speaker.png';">
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
    const companyText = organizer.company ? `<b>@${organizer.company}</b>` : '';
    
    return `
        <div class="col-lg-3 col-md-6 wow fadeInUp" data-wow-duration="1.5s" data-wow-delay="400ms">
            <div class="ts-speaker white-text">
                <div class="speaker-img">
                    <img class="img-fluid" src="${organizer.image}" alt="${organizer.name}">
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
    return speaker ? speaker.image : null;
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
 * Mobile schedule HTML
 */
function renderMobileSchedule(tracks) {
    let html = '';
    
    // Track 1'deki shared session'ları al
    const sharedSessions = tracks[0].sessions.filter(s => s.shared);
    
    tracks.forEach((track, index) => {
        const isActive = index === 0 ? 'show active' : '';
        const trackId = `track${index + 1}`;
        
        html += `<div class="tab-pane fade ${isActive}" id="${trackId}" role="tabpanel">`;
        
        if (index === 0) {
            // Track 1: Tüm session'lar zaten mevcut
            track.sessions.forEach(session => {
                html += createScheduleItem(session);
            });
        } else {
            // Track 2: Shared session'ları ve track'e özel session'ları birleştir
            const allSessions = [];
            
            // Shared session'ları ekle - önemli olanlar için "Main Stage" notu
            sharedSessions.forEach(s => {
                allSessions.push({ 
                    ...s, 
                    // Keynote, Ignite, Open Space ve speaker içeren session'larda Main Stage göster
                    isMainStage: s.speaker || s.type === 'Keynote' || s.type === 'Ignite Talks' || s.type === 'Open Space'
                });
            });
            
            // Track 2'ye özel session'ları ekle
            track.sessions.forEach(s => {
                allSessions.push(s);
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
                html += createScheduleItem(session);
            });
        }
        
        html += '</div>';
    });
    
    return html;
}

/**
 * Desktop schedule HTML (yan yana görünüm)
 */
function renderDesktopSchedule(tracks) {
    if (tracks.length < 2) return '';
    
    const track1 = tracks[0];
    const track2 = tracks[1];
    
    // Track 2 session'larını time'a göre map'le (hızlı erişim için)
    const track2ByTime = {};
    track2.sessions.forEach(session => {
        track2ByTime[session.time] = session;
    });
    
    let html = '';
    
    // Track 1'deki tüm session'ları işle
    for (let i = 0; i < track1.sessions.length; i++) {
        const session1 = track1.sessions[i];
        const session2 = track2ByTime[session1.time]; // Aynı saatte Track 2 session'ı var mı?
        
        html += `<div class="schedule-listing">
            <div class="schedule-slot-time">
                <span>${session1.time}</span>
                ${session1.type === 'Ignite Talks' ? 'Ignite' : ''}
            </div>
            <div class="schedule-slot-info-container">`;
        
        if (session1.shared) {
            // Ortak session - Track 1 alanında göster, Track 2 boş
            html += createDesktopSlotInfo(session1, false);
            html += `<div class="schedule-slot-info empty-slot"></div>`;
        } else {
            // Track'e özel session'lar - yan yana
            html += createDesktopSlotInfo(session1, false);
            if (session2) {
                html += createDesktopSlotInfo(session2, false);
            }
        }
        
        html += `</div></div>`;
    }
    
    return html;
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
function createScheduleItem(session) {
    const title = session.speaker || session.title;
    let description = session.description || '';
    
    // Note varsa ekle
    if (session.note) {
        description += ` <strong>${session.note}</strong>`;
    }
    
    // Main Stage notu ekle (Track 2'de shared session'lar için)
    if (session.isMainStage) {
        description += description ? ' ' : '';
        description += '<em style="color: #ffd700;">(Main Stage)</em>';
    }
    
    // Ignite talks için - speakers.yaml'dan otomatik çek
    if (session.type === 'Ignite Talks') {
        const igniteSpeakers = getIgniteSpeakersForSchedule();
        description = igniteSpeakers
            .map(s => `<strong>${s.name}</strong> — ${s.talk}`)
            .join('<br>');
        if (session.isMainStage) {
            description += '<br><em style="color: #ffd700;">(Main Stage)</em>';
        }
    }
    
    // Speaker varsa tıklanabilir yap
    const popupId = session.speaker ? getSpeakerPopupId(session.speaker) : null;
    const titleHtml = popupId 
        ? `<a href="#${popupId}" class="ts-image-popup" data-effect="mfp-zoom-in" style="text-decoration: none; color: inherit;"><h3 class="schedule-slot-title" style="cursor: pointer;">${title}</h3></a>`
        : `<h3 class="schedule-slot-title">${title}</h3>`;
    
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
function createDesktopSlotInfo(session, isShared = false) {
    const title = session.speaker || session.title;
    let description = session.description || '';
    const sharedClass = isShared ? ' shared-slot' : '';
    
    // Note varsa ekle
    if (session.note) {
        description += ` <strong>${session.note}</strong>`;
    }
    
    // Ignite talks için - speakers.yaml'dan otomatik çek
    if (session.type === 'Ignite Talks') {
        const igniteSpeakers = getIgniteSpeakersForSchedule();
        return `
            <div class="schedule-slot-info${sharedClass}">
                <div class="schedule-slot-info-content">
                    ${igniteSpeakers.map(s => 
                        `<p class="schedule-slot" style="white-space: nowrap;">${s.name} - ${s.talk}</p>`
                    ).join('')}
                </div>
            </div>`;
    }
    
    // Speaker varsa fotoğraf göster ve tıklanabilir yap
    const speakerImage = session.speaker ? getSpeakerImage(session.speaker) : null;
    const popupId = session.speaker ? getSpeakerPopupId(session.speaker) : null;
    
    if (session.speaker && speakerImage && popupId) {
        return `
            <div class="schedule-slot-info${sharedClass}">
                <a href="#${popupId}" class="ts-image-popup" data-effect="mfp-zoom-in">
                    <img class="schedule-slot-speakers" src="${speakerImage}" alt="${session.speaker}" style="cursor: pointer;">
                </a>
                <div class="schedule-slot-info-content">
                    <a href="#${popupId}" class="ts-image-popup" data-effect="mfp-zoom-in" style="text-decoration: none; color: inherit;">
                        <h3 class="schedule-slot-title" style="cursor: pointer;">${title}</h3>
                    </a>
                    <p>${description}</p>
                </div>
            </div>`;
    }
    
    if (session.speaker && speakerImage) {
        return `
            <div class="schedule-slot-info${sharedClass}">
                <img class="schedule-slot-speakers" src="${speakerImage}" alt="${session.speaker}">
                <div class="schedule-slot-info-content">
                    <h3 class="schedule-slot-title">${title}</h3>
                    <p>${description}</p>
                </div>
            </div>`;
    }
    
    return `
        <div class="schedule-slot-info${sharedClass}">
            <div class="schedule-slot-info-content">
                <h3 class="schedule-slot-title">${title}</h3>
                ${description ? `<p>${description}</p>` : ''}
            </div>
        </div>`;
}
