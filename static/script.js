/* ===============================
   ISSUE CREATION
================================ */

const form = document.getElementById("issueForm");

if (form) {
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const body = {
            title: document.getElementById("title").value.trim(),
            description: document.getElementById("description").value.trim(),
            target_amount: parseInt(document.getElementById("amount").value)
        };

        const res = await fetch("/api/issues", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });

        if (!res.ok) return;

        showSuccess(
            "Issue Created 🌱",
            "Your community issue was added successfully."
        );
    });
}


/* ===============================
   TAKE ISSUE
================================ */

let currentIssueId = null;
let contributeIssueId = null;

function takeIssue(id) {
    currentIssueId = id;

    const modal = document.getElementById("takeModal");
    const input = document.getElementById("workerName");

    if (!modal || !input) return;

    input.value = "";
    modal.classList.remove("hidden");
    input.focus();
}

function closeTakeModal() {
    document.getElementById("takeModal")?.classList.add("hidden");
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

    showSuccess(
        "Issue Taken 🤝",
        "Thank you for stepping up to help!"
    );
}


/* ===============================
   COMPLETE ISSUE
================================ */

function completeIssue(id) {
    currentIssueId = id;
    document.getElementById("completeModal")?.classList.remove("hidden");
}

function closeCompleteModal() {
    document.getElementById("completeModal")?.classList.add("hidden");
}

async function confirmCompleteIssue() {
    const res = await fetch(`/api/issues/${currentIssueId}/complete`, {
        method: "POST"
    });

    if (!res.ok) return;

    closeCompleteModal();

    showSuccess(
        "Issue Completed ✅",
        "Great work! You made real impact today."
    );
}


/* ===============================
   CONTRIBUTE (OPTIONAL / DEMO)
================================ */

function openContribute(id) {
    contributeIssueId = id;

    const modal = document.getElementById("contributeModal");
    const input = document.getElementById("contributeAmount");

    if (!modal || !input) return;

    input.value = "";
    modal.classList.remove("hidden");
    input.focus();
}

function closeContribute() {
    document.getElementById("contributeModal")?.classList.add("hidden");
}

async function confirmContribute() {
    const amount = parseInt(
        document.getElementById("contributeAmount").value
    );

    if (!amount || amount <= 0) return;

    await fetch(`/api/issues/${contributeIssueId}/contribute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount })
    });

    closeContribute();

    showSuccess(
        "Contribution Successful 💚",
        `₹${amount} was added to this issue (demo)`
    );
}


/* ===============================
   SUCCESS MODAL (GLOBAL)
================================ */

function showSuccess(title, message) {
    const titleEl = document.getElementById("successTitle");
    const msgEl = document.getElementById("successMessage");
    const modal = document.getElementById("successModal");

    if (!titleEl || !msgEl || !modal) return;

    titleEl.innerText = title;
    msgEl.innerText = message;
    modal.classList.remove("hidden");
}

function closeSuccessModal() {
    document.getElementById("successModal")?.classList.add("hidden");
    location.reload();
}


/* ===============================
   ESC KEY HANDLING
================================ */

document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;

    closeTakeModal();
    closeCompleteModal();
    closeContribute();
    document.getElementById("successModal")?.classList.add("hidden");
});

