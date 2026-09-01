import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";

import {
    getFirestore,
    collection,
    addDoc,
    serverTimestamp,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";


// ======================================================
// FIREBASE
// ======================================================

const firebaseConfig = {
    apiKey: "AIzaSyCIg18qZgVOtZzW0pBSEYg88WAsmzp53G0",
    authDomain: "ani-albumu.firebaseapp.com",
    projectId: "ani-albumu",
    storageBucket: "ani-albumu.firebasestorage.app",
    messagingSenderId: "118536956079",
    appId: "1:118536956079:web:af1583d69dd711bc5a8c5a",
    measurementId: "G-DM1LNLVMQ2"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


// ======================================================
// CLOUDINARY
// ======================================================

const CLOUD_NAME = "uh6pc05a";
const UPLOAD_PRESET = "ani_albumu";


// ======================================================
// AYARLAR
// ======================================================

const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Video maksimum 12 saniye
const MAX_VIDEO_DURATION = 12;


// ======================================================
// GALERİ
// ======================================================

const gallery = document.getElementById("gallery");

let photos = [];
let memories = [];

let currentPhoto = 0;

const cardsPerPage = 3;

let currentPage = 0;


// ======================================================
// TARİH
// ======================================================

function formatDate(timestamp) {

    if (!timestamp) {
        return "Yeni anı";
    }

    try {

        const date = timestamp.toDate();

        return date.toLocaleDateString(
            "tr-TR",
            {
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );

    } catch (error) {

        return "Yeni anı";

    }
}


// ======================================================
// ANILARI FIREBASE'DEN GETİR
// ======================================================

async function loadMemories() {

    try {

        const snapshot = await getDocs(
            collection(db, "anilar")
        );

        memories = [];
        photos = [];

        snapshot.forEach((doc) => {

            const memory = doc.data();

            if (!memory.photoUrl) {
                return;
            }

            memories.push(memory);

            photos.push({
                url: memory.photoUrl,
                type: memory.type || "image"
            });

        });

        currentPage = 0;
        currentPhoto = 0;

        renderGallery();

    } catch (error) {

        console.error(
            "Anılar yüklenirken hata:",
            error
        );

        gallery.innerHTML = `
            <p>
                Anılar yüklenirken bir hata oluştu.
            </p>
        `;

    }

}


// ======================================================
// GALERİYİ OLUŞTUR
// ======================================================

function renderGallery() {

    gallery.innerHTML = "";

    if (memories.length === 0) {

        gallery.innerHTML = `
            <p>
                Henüz paylaşılmış bir anı yok.
            </p>
        `;

        updateGalleryControls();

        return;
    }


    // TELEFON
    // Tüm anılar yatay kaydırılır

    if (window.innerWidth <= 700) {

        memories.forEach(
            (memory, index) => {

                createMemoryCard(
                    memory,
                    index
                );

            }
        );

    }

    // BİLGİSAYAR
    // Aynı anda 3 anı

    else {

        const start =
            currentPage * cardsPerPage;

        const end =
            start + cardsPerPage;

        const pageMemories =
            memories.slice(start, end);

        pageMemories.forEach(
            (memory, localIndex) => {

                const realIndex =
                    start + localIndex;

                createMemoryCard(
                    memory,
                    realIndex
                );

            }
        );

    }

    updateGalleryControls();

}


// ======================================================
// ANI KARTI
// ======================================================

function createMemoryCard(
    memory,
    index
) {

    const card =
        document.createElement("div");

    card.className =
        "photo-card";


    const safeName =
        memory.name ||
        "İsimsiz";


    const safeMessage =
        memory.message ||
        "";


    const mediaType =
        memory.type || "image";


    // ==================================================
    // FOTOĞRAF
    // ==================================================

    if (mediaType === "image") {

        card.innerHTML = `

            <img
                src="${memory.photoUrl}"
                alt="${safeName}"
                onclick="openLightbox(${index})"
            >

            <div class="memory-info">

                <h3>
                    ❤️ ${safeName}
                </h3>

                <p>
                    ${safeMessage}
                </p>

                <div class="memory-date">
                    ${formatDate(memory.createdAt)}
                </div>

            </div>

        `;

    }


    // ==================================================
    // VİDEO
    // ==================================================

    else if (mediaType === "video") {

        card.innerHTML = `

            <div
                class="video-wrapper"
                onclick="openLightbox(${index})"
            >

                <video
                    src="${memory.photoUrl}"
                    muted
                    loop
                    playsinline
                    preload="metadata"
                ></video>

                <div class="video-play">
                    ▶
                </div>

            </div>

            <div class="memory-info">

                <h3>
                    ❤️ ${safeName}
                </h3>

                <p>
                    ${safeMessage}
                </p>

                <div class="memory-date">
                    ${formatDate(memory.createdAt)}
                </div>

            </div>

        `;

    }


    gallery.appendChild(card);

}


// ======================================================
// GALERİ KONTROLLERİ
// ======================================================

function updateGalleryControls() {

    let controls =
        document.getElementById(
            "gallery-controls"
        );


    if (!controls) {

        controls =
            document.createElement("div");

        controls.id =
            "gallery-controls";

        controls.className =
            "gallery-controls";


        const section =
            document.querySelector(
                ".gallery-section"
            );


        if (section) {

            section.insertBefore(
                controls,
                gallery
            );

        }

    }


    // Telefonda gizle

    if (window.innerWidth <= 700) {

        controls.innerHTML = "";

        controls.style.display =
            "none";

        return;

    }


    controls.style.display =
        "flex";


    const totalPages =
        Math.ceil(
            memories.length /
            cardsPerPage
        );


    if (totalPages <= 1) {

        controls.innerHTML = "";

        controls.style.display =
            "none";

        return;

    }


    controls.innerHTML = `

        <button
            id="gallery-prev"
            class="gallery-arrow"
            type="button"
        >
            &#10094;
        </button>

        <span id="gallery-counter">
            ${currentPage + 1} / ${totalPages}
        </span>

        <button
            id="gallery-next"
            class="gallery-arrow"
            type="button"
        >
            &#10095;
        </button>

    `;


    const previousButton =
        document.getElementById(
            "gallery-prev"
        );


    const nextButton =
        document.getElementById(
            "gallery-next"
        );


    previousButton.onclick =
        previousGalleryPage;

    nextButton.onclick =
        nextGalleryPage;


    if (currentPage === 0) {

        previousButton.disabled =
            true;

    }


    if (
        currentPage >=
        totalPages - 1
    ) {

        nextButton.disabled =
            true;

    }

}


// ======================================================
// ÖNCEKİ GALERİ SAYFASI
// ======================================================

function previousGalleryPage() {

    if (currentPage <= 0) {
        return;
    }

    currentPage--;

    renderGallery();

}


// ======================================================
// SONRAKİ GALERİ SAYFASI
// ======================================================

function nextGalleryPage() {

    const totalPages =
        Math.ceil(
            memories.length /
            cardsPerPage
        );


    if (
        currentPage >=
        totalPages - 1
    ) {

        return;

    }


    currentPage++;

    renderGallery();

}


// ======================================================
// LIGHTBOX AÇ
// ======================================================

function openLightbox(index) {

    if (!photos[index]) {
        return;
    }


    currentPhoto = index;


    const lightbox =
        document.getElementById(
            "lightbox"
        );


    const image =
        document.getElementById(
            "lightbox-image"
        );


    const video =
        document.getElementById(
            "lightbox-video"
        );


    const selected =
        photos[currentPhoto];


    // Önce ikisini de gizle

    image.style.display =
        "none";

    video.style.display =
        "none";

    video.pause();


    // FOTOĞRAF

    if (selected.type === "image") {

        image.src =
            selected.url;

        image.style.display =
            "block";

    }


    // VİDEO

    else if (selected.type === "video") {

        video.src =
            selected.url;

        video.style.display =
            "block";

        video.currentTime = 0;

        video.play().catch(() => {});

    }


    lightbox.classList.add(
        "active"
    );

}


// ======================================================
// LIGHTBOX KAPAT
// ======================================================

function closeLightbox(event) {

    if (
        event &&
        event.target !== event.currentTarget
    ) {

        return;
    }


    const video =
        document.getElementById(
            "lightbox-video"
        );


    if (video) {

        video.pause();

    }


    document
        .getElementById("lightbox")
        .classList.remove(
            "active"
        );

}


// ======================================================
// SONRAKİ FOTOĞRAF / VİDEO
// ======================================================

function nextPhoto(event) {

    if (event) {
        event.stopPropagation();
    }


    if (photos.length === 0) {
        return;
    }


    currentPhoto++;


    if (
        currentPhoto >=
        photos.length
    ) {

        currentPhoto = 0;

    }


    showCurrentMedia();

}


// ======================================================
// ÖNCEKİ FOTOĞRAF / VİDEO
// ======================================================

function previousPhoto(event) {

    if (event) {
        event.stopPropagation();
    }


    if (photos.length === 0) {
        return;
    }


    currentPhoto--;


    if (currentPhoto < 0) {

        currentPhoto =
            photos.length - 1;

    }


    showCurrentMedia();

}


// ======================================================
// MEVCUT MEDYAYI GÖSTER
// ======================================================

function showCurrentMedia() {

    const image =
        document.getElementById(
            "lightbox-image"
        );


    const video =
        document.getElementById(
            "lightbox-video"
        );


    const selected =
        photos[currentPhoto];


    image.style.display =
        "none";

    video.style.display =
        "none";

    video.pause();


    if (
        selected.type ===
        "image"
    ) {

        image.src =
            selected.url;

        image.style.display =
            "block";

    }


    else if (
        selected.type ===
        "video"
    ) {

        video.src =
            selected.url;

        video.style.display =
            "block";

        video.currentTime = 0;

        video.play().catch(() => {});

    }

}


// ======================================================
// ANI FORMUNU AÇ
// ======================================================

function openMemoryForm() {

    const modal =
        document.getElementById(
            "memory-modal"
        );


    if (!modal) {

        console.error(
            "memory-modal bulunamadı."
        );

        return;

    }


    modal.classList.add(
        "active"
    );

}


// ======================================================
// ANI FORMUNU KAPAT
// ======================================================

function closeMemoryForm() {

    const modal =
        document.getElementById(
            "memory-modal"
        );


    if (!modal) {
        return;
    }


    modal.classList.remove(
        "active"
    );

}


// ======================================================
// CLOUDINARY YÜKLEME
// ======================================================

async function uploadPhoto(file) {

    const isVideo =
        file.type.startsWith(
            "video/"
        );


    const resourceType =
        isVideo
            ? "video"
            : "image";


    const url =
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`;


    const formData =
        new FormData();


    formData.append(
        "file",
        file
    );


    formData.append(
        "upload_preset",
        UPLOAD_PRESET
    );


    const response =
        await fetch(
            url,
            {
                method: "POST",
                body: formData
            }
        );


    if (!response.ok) {

        const errorText =
            await response.text();

        console.error(
            "Cloudinary hatası:",
            errorText
        );

        throw new Error(
            "Dosya yüklenemedi."
        );

    }


    const data =
        await response.json();


    if (!data.secure_url) {

        throw new Error(
            "Cloudinary dosya adresi döndürmedi."
        );

    }


    return data.secure_url;

}


// ======================================================
// VİDEO SÜRESİNİ KONTROL ET
// ======================================================

function checkVideoDuration(file) {

    return new Promise(
        (resolve, reject) => {

            const video =
                document.createElement(
                    "video"
                );


            const url =
                URL.createObjectURL(
                    file
                );


            video.preload =
                "metadata";


            video.onloadedmetadata =
                function() {

                    URL.revokeObjectURL(
                        url
                    );


                    if (
                        video.duration >
                        MAX_VIDEO_DURATION
                    ) {

                        reject(
                            new Error(
                                "Video en fazla 12 saniye olabilir."
                            )
                        );

                        return;

                    }


                    resolve();

                };


            video.onerror =
                function() {

                    URL.revokeObjectURL(
                        url
                    );


                    reject(
                        new Error(
                            "Video süresi okunamadı."
                        )
                    );

                };


            video.src =
                url;

        }
    );

}


// ======================================================
// ANI GÖNDER
// ======================================================

async function submitMemory(event) {

    event.preventDefault();


    const nameInput =
        document.getElementById(
            "name"
        );


    const messageInput =
        document.getElementById(
            "message"
        );


    const photoInput =
        document.getElementById(
            "memory-photo"
        );


    if (
        !nameInput ||
        !messageInput ||
        !photoInput
    ) {

        alert(
            "Form alanları bulunamadı."
        );

        return;

    }


    const name =
        nameInput.value.trim();


    const message =
        messageInput.value.trim();


    const file =
        photoInput.files[0];


    if (
        name === "" ||
        message === ""
    ) {

        alert(
            "Lütfen adınızı ve anınızı yazın."
        );

        return;

    }


    if (!file) {

        alert(
            "Lütfen bir fotoğraf veya video seçin."
        );

        return;

    }


    // ==================================================
    // DOSYA BOYUTU
    // ==================================================

    if (
        file.size >
        MAX_FILE_SIZE
    ) {

        alert(
            "Fotoğraf veya video en fazla 10 MB olabilir."
        );

        return;

    }


    // ==================================================
    // DOSYA TÜRÜ
    // ==================================================

    const isImage =
        file.type.startsWith(
            "image/"
        );


    const isVideo =
        file.type.startsWith(
            "video/"
        );


    if (
        !isImage &&
        !isVideo
    ) {

        alert(
            "Lütfen sadece fotoğraf veya video seçin."
        );

        return;

    }


    // ==================================================
    // VİDEO SÜRESİ
    // ==================================================

    if (isVideo) {

        try {

            await checkVideoDuration(
                file
            );

        } catch (error) {

            alert(
                error.message
            );

            return;

        }

    }


    const submitButton =
        document.querySelector(
            ".submit-button"
        );


    if (!submitButton) {

        alert(
            "Gönder butonu bulunamadı."
        );

        return;

    }


    submitButton.disabled =
        true;


    try {

        // ==================================================
        // YÜKLEME
        // ==================================================

        submitButton.textContent =
            isVideo
                ? "Video yükleniyor..."
                : "Fotoğraf yükleniyor...";


        const photoUrl =
            await uploadPhoto(
                file
            );


        // ==================================================
        // FIRESTORE
        // ==================================================

        submitButton.textContent =
            "Anı kaydediliyor...";


        await addDoc(
            collection(
                db,
                "anilar"
            ),
            {
                name: name,
                message: message,
                photoUrl: photoUrl,

                type:
                    isVideo
                        ? "video"
                        : "image",

                createdAt:
                    serverTimestamp()
            }
        );


        alert(
            "Anınız başarıyla gönderildi! ❤️"
        );


        document
            .getElementById(
                "memory-form"
            )
            .reset();


        closeMemoryForm();


        await loadMemories();


    } catch (error) {

        console.error(
            "Gönderme hatası:",
            error
        );


        alert(
            "Anınız gönderilemedi.\n\n" +
            "Hata: " +
            error.message
        );

    }


    submitButton.disabled =
        false;


    submitButton.textContent =
        "Anımı Gönder ❤️";

}


// ======================================================
// ESC TUŞU
// ======================================================

document.addEventListener(
    "keydown",
    function(event) {

        const lightbox =
            document.getElementById(
                "lightbox"
            );


        const modal =
            document.getElementById(
                "memory-modal"
            );


        if (
            event.key === "Escape" &&
            lightbox &&
            lightbox.classList.contains(
                "active"
            )
        ) {

            closeLightbox();

        }


        if (
            event.key === "Escape" &&
            modal &&
            modal.classList.contains(
                "active"
            )
        ) {

            closeMemoryForm();

        }


        if (
            event.key === "ArrowRight" &&
            lightbox &&
            lightbox.classList.contains(
                "active"
            )
        ) {

            nextPhoto(event);

        }


        if (
            event.key === "ArrowLeft" &&
            lightbox &&
            lightbox.classList.contains(
                "active"
            )
        ) {

            previousPhoto(event);

        }

    }
);


// ======================================================
// EKRAN BOYUTU
// ======================================================

window.addEventListener(
    "resize",
    function() {

        renderGallery();

    }
);


// ======================================================
// HTML BUTONLARI
// ======================================================

window.openLightbox =
    openLightbox;

window.closeLightbox =
    closeLightbox;

window.nextPhoto =
    nextPhoto;

window.previousPhoto =
    previousPhoto;

window.openMemoryForm =
    openMemoryForm;

window.closeMemoryForm =
    closeMemoryForm;

window.submitMemory =
    submitMemory;


// ======================================================
// SAYFA AÇILINCA
// ======================================================

loadMemories();
