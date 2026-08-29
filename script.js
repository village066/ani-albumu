
import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";


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

    apiKey:
        "AIzaSyCIg18qZgVOtZzW0pBSEYg88WAsmzp53G0",

    authDomain:
        "ani-albumu.firebaseapp.com",

    projectId:
        "ani-albumu",

    storageBucket:
        "ani-albumu.firebasestorage.app",

    messagingSenderId:
        "118536956079",

    appId:
        "1:118536956079:web:af1583d69dd711bc5a8c5a",

    measurementId:
        "G-DM1LNLVMQ2"

};


const app =
    initializeApp(firebaseConfig);


const db =
    getFirestore(app);



// ======================================================
// CLOUDINARY
// ======================================================

const CLOUD_NAME =
    "uh6pc05a";


const UPLOAD_PRESET =
    "ani_albumu";



// ======================================================
// GALERİ
// ======================================================

const gallery =
    document.getElementById("gallery");


let photos = [];

let memories = [];

let currentPhoto = 0;


// Bilgisayarda aynı anda 3 anı

const cardsPerPage = 3;


// Bilgisayardaki mevcut sayfa

let currentPage = 0;



// ======================================================
// TARİH
// ======================================================

function formatDate(timestamp) {

    if (!timestamp) {

        return "Yeni anı";

    }


    try {

        const date =
            timestamp.toDate();


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

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "anilar"
                )
            );


        memories = [];

        photos = [];


        snapshot.forEach(
            (doc) => {

                const memory =
                    doc.data();


                if (
                    !memory.photoUrl
                ) {

                    return;

                }


                memories.push(
                    memory
                );


                photos.push(
                    memory.photoUrl
                );

            }
        );


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


    if (
        memories.length === 0
    ) {

        gallery.innerHTML = `
            <p>
                Henüz paylaşılmış bir anı yok.
            </p>
        `;


        updateGalleryControls();


        return;

    }



    // ==================================================
    // TELEFON
    // ==================================================

    if (
        window.innerWidth <= 700
    ) {

        memories.forEach(
            (
                memory,
                index
            ) => {

                createMemoryCard(
                    memory,
                    index
                );

            }
        );

    }



    // ==================================================
    // BİLGİSAYAR
    // ==================================================

    else {

        const start =
            currentPage *
            cardsPerPage;


        const end =
            start +
            cardsPerPage;


        const pageMemories =
            memories.slice(
                start,
                end
            );


        pageMemories.forEach(
            (
                memory,
                localIndex
            ) => {

                const realIndex =
                    start +
                    localIndex;


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
// ANI KARTI OLUŞTUR
// ======================================================

function createMemoryCard(
    memory,
    index
) {

    const card =
        document.createElement(
            "div"
        );


    card.className =
        "photo-card";


    const safeName =
        memory.name ||
        "İsimsiz";


    const safeMessage =
        memory.message ||
        "";


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


    gallery.appendChild(
        card
    );

}



// ======================================================
// GALERİ KONTROLLERİ
// ======================================================

function updateGalleryControls() {

    const controls =
        document.getElementById(
            "gallery-controls"
        );


    const previousButton =
        document.getElementById(
            "gallery-prev"
        );


    const nextButton =
        document.getElementById(
            "gallery-next"
        );


    const counter =
        document.getElementById(
            "gallery-counter"
        );


    if (
        !controls ||
        !previousButton ||
        !nextButton ||
        !counter
    ) {

        return;

    }



    // TELEFONDA KONTROLLER GİZLİ

    if (
        window.innerWidth <= 700
    ) {

        controls.style.display =
            "none";

        return;

    }



    // TOPLAM SAYFA

    const totalPages =
        Math.ceil(
            memories.length /
            cardsPerPage
        );



    // Tek sayfa varsa gizle

    if (
        totalPages <= 1
    ) {

        controls.style.display =
            "none";

        return;

    }



    // Kontrolleri göster

    controls.style.display =
        "flex";



    // Sayaç

    counter.textContent =
        `${currentPage + 1} / ${totalPages}`;



    // Önceki

    previousButton.disabled =
        currentPage === 0;


    // Sonraki

    nextButton.disabled =
        currentPage >=
        totalPages - 1;



    // Buton olayları

    previousButton.onclick =
        previousGalleryPage;


    nextButton.onclick =
        nextGalleryPage;

}



// ======================================================
// ÖNCEKİ GALERİ SAYFASI
// ======================================================

function previousGalleryPage() {

    if (
        currentPage <= 0
    ) {

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
// FOTOĞRAFI BÜYÜT
// ======================================================

function openLightbox(index) {

    if (
        !photos[index]
    ) {

        return;

    }


    currentPhoto =
        index;


    const lightbox =
        document.getElementById(
            "lightbox"
        );


    const image =
        document.getElementById(
            "lightbox-image"
        );


    image.src =
        photos[currentPhoto];


    lightbox.classList.add(
        "active"
    );

}



// ======================================================
// FOTOĞRAFI KAPAT
// ======================================================

function closeLightbox(event) {

    if (
        event &&
        event.target !==
        event.currentTarget
    ) {

        return;

    }


    document
        .getElementById(
            "lightbox"
        )
        .classList.remove(
            "active"
        );

}



// ======================================================
// SONRAKİ FOTOĞRAF
// ======================================================

function nextPhoto(event) {

    if (event) {

        event.stopPropagation();

    }


    if (
        photos.length === 0
    ) {

        return;

    }


    currentPhoto++;


    if (
        currentPhoto >=
        photos.length
    ) {

        currentPhoto = 0;

    }


    document
        .getElementById(
            "lightbox-image"
        )
        .src =
        photos[currentPhoto];

}



// ======================================================
// ÖNCEKİ FOTOĞRAF
// ======================================================

function previousPhoto(event) {

    if (event) {

        event.stopPropagation();

    }


    if (
        photos.length === 0
    ) {

        return;

    }


    currentPhoto--;


    if (
        currentPhoto < 0
    ) {

        currentPhoto =
            photos.length - 1;

    }


    document
        .getElementById(
            "lightbox-image"
        )
        .src =
        photos[currentPhoto];

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
// CLOUDINARY FOTOĞRAF YÜKLE
// ======================================================

async function uploadPhoto(file) {

    const url =
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;


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


    if (
        !response.ok
    ) {

        const errorText =
            await response.text();


        console.error(
            "Cloudinary hatası:",
            errorText
        );


        throw new Error(
            "Fotoğraf yüklenemedi."
        );

    }


    const data =
        await response.json();


    if (
        !data.secure_url
    ) {

        throw new Error(
            "Cloudinary fotoğraf adresi döndürmedi."
        );

    }


    return data.secure_url;

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
            "Lütfen bir fotoğraf seçin."
        );

        return;

    }


    if (
        file.size >
        5 * 1024 * 1024
    ) {

        alert(
            "Fotoğraf en fazla 5 MB olabilir."
        );

        return;

    }


    if (
        !file.type.startsWith(
            "image/"
        )
    ) {

        alert(
            "Lütfen sadece fotoğraf seçin."
        );

        return;

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


        // FOTOĞRAF YÜKLE

        submitButton.textContent =
            "Fotoğraf yükleniyor...";


        const photoUrl =
            await uploadPhoto(
                file
            );



        // FIRESTORE'A KAYDET

        submitButton.textContent =
            "Anı kaydediliyor...";


        await addDoc(
            collection(
                db,
                "anilar"
            ),
            {

                name:
                    name,

                message:
                    message,

                photoUrl:
                    photoUrl,

                createdAt:
                    serverTimestamp()

            }
        );



        // BAŞARILI

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



        // ESC - LIGHTBOX

        if (
            event.key === "Escape" &&
            lightbox &&
            lightbox.classList.contains(
                "active"
            )
        ) {

            lightbox.classList.remove(
                "active"
            );

        }



        // ESC - FORM

        if (
            event.key === "Escape" &&
            modal &&
            modal.classList.contains(
                "active"
            )
        ) {

            closeMemoryForm();

        }



        // SAĞ OK

        if (
            event.key === "ArrowRight" &&
            lightbox &&
            lightbox.classList.contains(
                "active"
            )
        ) {

            nextPhoto(event);

        }



        // SOL OK

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
// EKRAN BOYUTU DEĞİŞİNCE
// ======================================================

window.addEventListener(
    "resize",
    function() {

        renderGallery();

    }
);



// ======================================================
// HTML BUTONLARINA ERİŞİM
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
// SAYFA AÇILINCA ANILARI GETİR
// ======================================================

loadMemories();
