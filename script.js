
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";

import {
    getFirestore,
    collection,
    addDoc,
    serverTimestamp,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";


// =========================
// FIREBASE
// =========================

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


// =========================
// CLOUDINARY
// =========================

const CLOUD_NAME = "uh6pc05a";

const UPLOAD_PRESET = "ani_albumu";


// =========================
// GALERİ
// =========================

const gallery = document.getElementById("gallery");

let photos = [];

let currentPhoto = 0;


// =========================
// ANILARI FIREBASE'DEN GETİR
// =========================

function formatDate(timestamp) {

    if (!timestamp) {
        return "Yeni anı";
    }

    const date = timestamp.toDate();

    return date.toLocaleDateString(
        "tr-TR",
        {
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );
}

async function loadMemories() {

    try {

        const snapshot = await getDocs(
            collection(db, "anilar")
        );


        gallery.innerHTML = "";

        photos = [];


        if (snapshot.empty) {

            gallery.innerHTML = `
                <p>
                    Henüz paylaşılmış bir anı yok.
                </p>
            `;

            return;
        }


        snapshot.forEach((doc) => {

            const memory = doc.data();


            if (!memory.photoUrl) {
                return;
            }


            const index = photos.length;


            photos.push(memory.photoUrl);


            const card = document.createElement("div");

            card.className = "photo-card";


            card.innerHTML = `

    <img
        src="${memory.photoUrl}"
        alt="${memory.name || "Anı"}"
        onclick="openLightbox(${index})"
    >

    <div class="memory-info">

        <h3>
            ❤️ ${memory.name || "İsimsiz"}
        </h3>

        <p>
            ${memory.message || ""}
        </p>

        <div class="memory-date">
            ${formatDate(memory.createdAt)}
        </div>

    </div>

`;


            gallery.appendChild(card);

        });


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


// =========================
// FOTOĞRAFI BÜYÜT
// =========================

function openLightbox(index) {

    currentPhoto = index;


    const lightbox =
        document.getElementById("lightbox");


    const image =
        document.getElementById("lightbox-image");


    image.src = photos[currentPhoto];


    lightbox.classList.add("active");

}


// =========================
// FOTOĞRAFI KAPAT
// =========================

function closeLightbox(event) {

    if (
        event &&
        event.target !== event.currentTarget
    ) {

        return;
    }


    document
        .getElementById("lightbox")
        .classList.remove("active");

}


// =========================
// SONRAKİ FOTOĞRAF
// =========================

function nextPhoto(event) {

    event.stopPropagation();


    if (photos.length === 0) {
        return;
    }


    currentPhoto++;


    if (currentPhoto >= photos.length) {

        currentPhoto = 0;

    }


    document.getElementById(
        "lightbox-image"
    ).src = photos[currentPhoto];

}


// =========================
// ÖNCEKİ FOTOĞRAF
// =========================

function previousPhoto(event) {

    event.stopPropagation();


    if (photos.length === 0) {
        return;
    }


    currentPhoto--;


    if (currentPhoto < 0) {

        currentPhoto = photos.length - 1;

    }


    document.getElementById(
        "lightbox-image"
    ).src = photos[currentPhoto];

}


// =========================
// FORMU AÇ
// =========================

function openMemoryForm() {

    document
        .getElementById("memory-modal")
        .classList.add("active");

}


// =========================
// FORMU KAPAT
// =========================

function closeMemoryForm() {

    document
        .getElementById("memory-modal")
        .classList.remove("active");

}


// =========================
// CLOUDINARY FOTOĞRAF YÜKLEME
// =========================

async function uploadPhoto(file) {

    const url =
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;


    const formData = new FormData();


    formData.append(
        "file",
        file
    );


    formData.append(
        "upload_preset",
        UPLOAD_PRESET
    );


    const response = await fetch(
        url,
        {
            method: "POST",
            body: formData
        }
    );


    if (!response.ok) {

        throw new Error(
            "Fotoğraf yüklenemedi."
        );

    }


    const data = await response.json();


    return data.secure_url;

}


// =========================
// ANI GÖNDER
// =========================

async function submitMemory(event) {

    event.preventDefault();


    const name =
        document
            .getElementById("name")
            .value
            .trim();


    const message =
        document
            .getElementById("message")
            .value
            .trim();


    const photoInput =
        document.getElementById(
            "memory-photo"
        );


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
        !file.type.startsWith("image/")
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


    submitButton.disabled = true;


    try {

        // FOTOĞRAF YÜKLENİYOR

        submitButton.textContent =
            "Fotoğraf yükleniyor...";


        const photoUrl =
            await uploadPhoto(file);


        // FIRESTORE'A KAYDEDİLİYOR

        submitButton.textContent =
            "Anı kaydediliyor...";


        await addDoc(
            collection(db, "anilar"),
            {

                name: name,

                message: message,

                photoUrl: photoUrl,

                createdAt:
                    serverTimestamp()

            }
        );


        alert(
            "Anınız başarıyla gönderildi! ❤️"
        );


        document
            .getElementById("memory-form")
            .reset();


        closeMemoryForm();


        // ALBÜMÜ YENİLE

        await loadMemories();


    } catch (error) {

        console.error(
            "Gönderme hatası:",
            error
        );


        alert(
            "Anınız gönderilemedi.\n\n" +
            "Lütfen tekrar deneyin."
        );

    }


    submitButton.disabled = false;


    submitButton.textContent =
        "Anımı Gönder ❤️";

}


// =========================
// KLAVYE KONTROLLERİ
// =========================

document.addEventListener(
    "keydown",
    function(event) {

        const lightbox =
            document.getElementById(
                "lightbox"
            );


        if (
            lightbox.classList.contains(
                "active"
            )
        ) {

            if (
                event.key === "Escape"
            ) {

                lightbox.classList.remove(
                    "active"
                );

            }


            if (
                event.key === "ArrowRight"
            ) {

                nextPhoto(event);

            }


            if (
                event.key === "ArrowLeft"
            ) {

                previousPhoto(event);

            }

        }


        const modal =
            document.getElementById(
                "memory-modal"
            );


        if (
            modal.classList.contains(
                "active"
            ) &&
            event.key === "Escape"
        ) {

            closeMemoryForm();

        }

    }
);


// =========================
// HTML BUTONLARI
// =========================

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


// =========================
// SAYFA AÇILINCA ANILARI GETİR
// =========================

loadMemories();
