/* ===============================
   MAP + LOCATION (RAISE ISSUE)
================================ */

let selectedLat = null;
let selectedLng = null;
let map = null;
let marker = null;

const mapDiv = document.getElementById("map");

if (mapDiv) {
    map = L.map("map").setView([20.5937, 78.9629], 5);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap"
    }).addTo(map);

    map.on("click", (e) => {
        setMarker(e.latlng.lat, e.latlng.lng);
    });
}

function setMarker(lat, lng) {
    selectedLat = lat;
    selectedLng = lng;

    if (marker) {
        marker.setLatLng([lat, lng]);
    } else {
        marker = L.marker([lat, lng]).addTo(map);
    }

    map.setView([lat, lng], 15);
}


/* ===============================
   CURRENT LOCATION BUTTON
================================ */

const locateBtn = document.getElementById("locateBtn");

if (locateBtn) {
    locateBtn.onclick = () => {
        if (!navigator.geolocation) {
            alert("Geolocation not supported");
            return;
        }

        locateBtn.innerText = "Locating…";

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setMarker(
                    pos.coords.latitude,
                    pos.coords.longitude
                );
                locateBtn.innerText = "📍 Location Selected";
            },
            () => {
                alert("Permission denied or error");
                locateBtn.innerText = "📍 Use My Current Location";
            },
            { enableHighAccuracy: true }
        );
    };
}


/* ===============================
   FORM SUBMIT (RAISE ISSUE)
================================ */

const form = document.getElementById("issueForm");

if (form) {
    form.onsubmit = async (e) => {
        e.preventDefault();

        if (selectedLat === null || selectedLng === null) {
            alert("Select a location on the map");
            return;
        }

        const body = {
            title: title.value.trim(),
            description: description.value.trim(),
            target_amount: parseInt(amount.value),
            lat: selectedLat,
            lng: selectedLng
        };

        const res = await fetch("/api/issues", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });

        if (!res.ok) {
            alert("Error creating issue");
            return;
        }

        showSuccess(
            "Issue Created 🌱",
            "Your community issue was added successfully."
        );
    };
}


/* ===============================
   CONTRIBUTE MODAL
================================ */

let contributeIssueId = null;

function openContribute(id) {
    contributeIssueId = id;
    document.getElementById("contributeModal").classList.remove("hidden");
}

function closeContribute() {
    document.getElementById("contributeModal").classList.add("hidden");
}

async function confirmContribute() {
    const amount = parseInt(
        document.getElementById("contributeAmount").value
    );

    if (!amount || amount <= 0) return;

    const res = await fetch(`/api/issues/${contributeIssueId}/contribute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount })
    });

    if (!res.ok) return;

    closeContribute();

    showSuccess(
        "Contribution Successful 💚",
        `₹${amount} was added to this issue (demo)`
    );
}


/* ===============================
   TAKE ISSUE MODAL (🔥 FIXED)
================================ */

let currentIssueId = null;

function takeIssue(id) {
    currentIssueId = id;
    document.getElementById("takeModal").classList.remove("hidden");
}

function closeTakeModal() {
    document.getElementById("takeModal").classList.add("hidden");
}

async function confirmTakeIssue() {
    const worker = document.getElementById("workerName").value.trim();
    if (!worker) return;

    const res = await fetch(`/api/issues/${currentIssueId}/take`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ worker })
    });

    if (!res.ok) return;

    closeTakeModal();

    // 🔥 REQUIRED: re-render server-side UI
    location.reload();
}


/* ===============================
   COMPLETE ISSUE (🔥 FIXED)
================================ */

function completeIssue(id) {
    currentIssueId = id;
    document.getElementById("completeModal").classList.remove("hidden");
}

function closeCompleteModal() {
    document.getElementById("completeModal").classList.add("hidden");
}

async function confirmCompleteIssue() {
    const res = await fetch(`/api/issues/${currentIssueId}/complete`, {
        method: "POST"
    });

    if (!res.ok) return;

    closeCompleteModal();

    // 🔥 REQUIRED: re-render server-side UI
    location.reload();
}


/* ===============================
   SUCCESS MODAL (RELOAD POINT)
================================ */

function showSuccess(title, message) {
    document.getElementById("successTitle").innerText = title;
    document.getElementById("successMessage").innerText = message;
    document.getElementById("successModal").classList.remove("hidden");
}

function closeSuccessModal() {
    document.getElementById("successModal").classList.add("hidden");
    location.reload();
}


/* ===============================
   ESC KEY HANDLING
================================ */

document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;

    closeContribute();
    closeTakeModal();
    closeCompleteModal();
    document.getElementById("successModal")?.classList.add("hidden");
});

