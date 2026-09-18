/* =========================================================
   RBT DATA GIFT
   COMPLETE FRONTEND SCRIPT
========================================================= */


/* =========================================================
   PAYSTACK PUBLIC KEY
   TEST PUBLIC KEY ONLY
========================================================= */

const PAYSTACK_PUBLIC_KEY =
    "pk_test_7218fde42292f6642bb6fc435d7377781a6db591";


/* =========================================================
   DATA PACKAGES
========================================================= */

const packages = [
    {
        id: 1,
        price: 999,
        data: "7GB",
        duration: "Monthly",
        icon: "📶",
        badge: "STARTER"
    },

    {
        id: 2,
        price: 4999,
        data: "35GB",
        duration: "Monthly",
        icon: "⚡",
        badge: "POPULAR"
    },

    {
        id: 3,
        price: 9999,
        data: "65GB",
        duration: "Monthly",
        icon: "🚀",
        badge: "VALUE"
    },

    {
        id: 4,
        price: 14999,
        data: "100GB",
        duration: "2 Months",
        icon: "💎",
        badge: "HOT"
    },

    {
        id: 5,
        price: 19999,
        data: "140GB",
        duration: "2 Months",
        icon: "🔥",
        badge: "HOT"
    },

    {
        id: 6,
        price: 24999,
        data: "180GB",
        duration: "2 Months",
        icon: "⚡",
        badge: "VALUE"
    },

    {
        id: 7,
        price: 29999,
        data: "220GB",
        duration: "3 Months",
        icon: "🚀",
        badge: "POPULAR"
    },

    {
        id: 8,
        price: 34999,
        data: "260GB",
        duration: "6 Months",
        icon: "💎",
        badge: "PREMIUM"
    },

    {
        id: 9,
        price: 39999,
        data: "299GB",
        duration: "10 Months",
        icon: "🔥",
        badge: "MEGA"
    },

    {
        id: 10,
        price: 49999,
        data: "350GB",
        duration: "Yearly",
        icon: "👑",
        badge: "ULTIMATE"
    }
];


/* =========================================================
   REFERRAL SETTINGS
========================================================= */

const REFERRAL_TARGET = 10;
const REFERRAL_REWARD = "111GB";


/* =========================================================
   APP STATE
========================================================= */

let selectedPackage = null;
let selectedNetwork = "";

let referralCount =
    Number(localStorage.getItem("rbtReferralCount")) || 0;

let referralCode =
    localStorage.getItem("rbtReferralCode");

let notificationTimer;


/* =========================================================
   GENERATE REFERRAL CODE
========================================================= */

function createReferralCode() {

    if (!referralCode) {

        const random =
            Math.random()
                .toString(36)
                .substring(2, 8)
                .toUpperCase();

        referralCode = "RBT-" + random;

        localStorage.setItem(
            "rbtReferralCode",
            referralCode
        );
    }

    return referralCode;
}


/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        renderHomePackages();

        renderAllPackages();

        setupReferral();

        setupNetworkButtons();

        setupModalClose();

        animateUsage();

        updateReferralUI();

    }
);


/* =========================================================
   PAGE NAVIGATION
========================================================= */

function showPage(pageId) {

    const pages =
        document.querySelectorAll(".page");

    pages.forEach(page => {

        page.classList.remove(
            "active-page"
        );

    });


    const target =
        document.getElementById(pageId);

    if (target) {

        target.classList.add(
            "active-page"
        );

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }


    updateNavigation(pageId);
}


/* =========================================================
   NAVIGATION ACTIVE STATE
========================================================= */

function updateNavigation(pageId) {

    const navItems =
        document.querySelectorAll(
            ".nav-item"
        );

    navItems.forEach(item => {

        item.classList.remove(
            "active"
        );

    });


    const activeNav =
        document.querySelector(
            `.nav-item[data-page="${pageId}"]`
        );

    if (activeNav) {

        activeNav.classList.add(
            "active"
        );

        return;
    }


    const navMap = {

        home: 0,
        packages: 1,
        referral: 2,
        profile: 3

    };


    if (
        navMap[pageId] !== undefined &&
        navItems[navMap[pageId]]
    ) {

        navItems[
            navMap[pageId]
        ].classList.add("active");

    }
}


/* =========================================================
   PACKAGE FORMAT
========================================================= */

function formatNaira(amount) {

    return "₦" +
        Number(amount)
            .toLocaleString("en-NG");
}


/* =========================================================
   PACKAGE CARD
========================================================= */

function createPackageCard(pkg) {

    return `
        <div class="package-card">

            <div class="package-top">

                <div class="package-icon">
                    ${pkg.icon}
                </div>

                <span class="package-badge">
                    ${pkg.badge}
                </span>

            </div>


            <div class="package-data">
                ${pkg.data}
            </div>


            <div class="package-duration">
                ${pkg.duration}
            </div>


            <div class="package-bottom">

                <div class="package-price">
                    ${formatNaira(pkg.price)}
                </div>

                <button
                    class="package-buy"
                    onclick="openOrder(${pkg.id})"
                >
                    BUY
                </button>

            </div>

        </div>
    `;
}


/* =========================================================
   HOME PACKAGE PREVIEW
========================================================= */

function renderHomePackages() {

    const container =
        document.getElementById(
            "homePackages"
        );

    if (!container) return;


    const preview =
        packages.slice(0, 4);


    container.innerHTML =
        preview
            .map(createPackageCard)
            .join("");
}


/* =========================================================
   ALL PACKAGES
========================================================= */

function renderAllPackages() {

    const container =
        document.getElementById(
            "packageContainer"
        );

    if (!container) return;


    container.innerHTML =
        packages
            .map(createPackageCard)
            .join("");
}


/* =========================================================
   OPEN ORDER MODAL
========================================================= */

function openOrder(packageId) {

    const pkg =
        packages.find(
            item => item.id === Number(packageId)
        );


    if (!pkg) {

        showNotification(
            "Package not found"
        );

        return;
    }


    selectedPackage = pkg;


    const modal =
        document.getElementById(
            "orderModal"
        );

    const selected =
        document.getElementById(
            "selectedPackage"
        );


    if (selected) {

        selected.innerHTML = `

            <div class="selected-package-content">

                <div class="selected-package-icon">
                    ${pkg.icon}
                </div>

                <div>

                    <strong>
                        ${pkg.data}
                    </strong>

                    <span>
                        ${pkg.duration} •
                        ${formatNaira(pkg.price)}
                    </span>

                </div>

            </div>
        `;
    }


    resetOrderForm();

    if (modal) {

        modal.classList.add("show");

        document.body.style.overflow =
            "hidden";
    }
}


/* =========================================================
   RESET ORDER FORM
========================================================= */

function resetOrderForm() {

    selectedNetwork = "";


    const name =
        document.getElementById(
            "fullName"
        );

    const phone =
        document.getElementById(
            "phoneNumber"
        );

    const network =
        document.getElementById(
            "network"
        );


    if (name) name.value = "";

    if (phone) phone.value = "";

    if (network) network.value = "";


    document
        .querySelectorAll(
            ".network-option"
        )
        .forEach(button => {

            button.classList.remove(
                "selected"
            );

        });
}


/* =========================================================
   CLOSE ORDER MODAL
========================================================= */

function closeOrder() {

    const modal =
        document.getElementById(
            "orderModal"
        );


    if (modal) {

        modal.classList.remove(
            "show"
        );

    }


    document.body.style.overflow =
        "";
}


/* =========================================================
   MODAL CLOSE EVENTS
========================================================= */

function setupModalClose() {

    const modal =
        document.getElementById(
            "orderModal"
        );


    if (!modal) return;


    modal.addEventListener(
        "click",
        event => {

            if (
                event.target.classList.contains(
                    "modal-overlay"
                )
            ) {

                closeOrder();

            }

        }
    );


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape"
            ) {

                closeOrder();

            }

        }
    );
}


/* =========================================================
   NETWORK SELECTION
========================================================= */

function selectNetwork(networkName) {

    selectedNetwork =
        networkName;


    const hiddenInput =
        document.getElementById(
            "network"
        );


    if (hiddenInput) {

        hiddenInput.value =
            networkName;

    }


    document
        .querySelectorAll(
            ".network-option"
        )
        .forEach(button => {

            button.classList.remove(
                "selected"
            );


            if (
                button.dataset.network ===
                networkName
            ) {

                button.classList.add(
                    "selected"
                );

            }

        });


    showNotification(
        networkName +
        " selected"
    );
}


/* =========================================================
   NETWORK BUTTON SETUP
========================================================= */

function setupNetworkButtons() {

    document
        .querySelectorAll(
            ".network-option"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const network =
                        button.dataset.network;

                    if (network) {

                        selectNetwork(
                            network
                        );

                    }

                }
            );

        });
}


/* =========================================================
   START PAYMENT
   FRONTEND DEMO ONLY
========================================================= */

function startPayment() {

    if (!selectedPackage) {

        showNotification(
            "Please select a package"
        );

        return;
    }


    const fullName =
        document.getElementById(
            "fullName"
        )?.value.trim();


    const phone =
        document.getElementById(
            "phoneNumber"
        )?.value.trim();


    if (!fullName) {

        showNotification(
            "Enter your full name"
        );

        return;
    }


    if (!phone) {

        showNotification(
            "Enter your phone number"
        );

        return;
    }


    if (
        phone.length < 10 ||
        phone.length > 15
    ) {

        showNotification(
            "Enter a valid phone number"
        );

        return;
    }


    if (!selectedNetwork) {

        showNotification(
            "Select your network"
        );

        return;
    }


    /*
       IMPORTANT:

       Real Paystack payment will be
       connected later through the secure
       backend.

       Do NOT put the Paystack Secret Key
       inside this file.
    */


    showNotification(
        "Payment system will be connected next"
    );


    console.log(
        "ORDER PREVIEW",
        {
            package: selectedPackage,
            fullName: fullName,
            phone: phone,
            network: selectedNetwork
        }
    );
}


/* =========================================================
   REFERRAL SETUP
========================================================= */

function setupReferral() {

    const codeElement =
        document.getElementById(
            "referralCode"
        );


    if (codeElement) {

        codeElement.textContent =
            createReferralCode();

    }


    const countElement =
        document.getElementById(
            "referralCount"
        );


    if (countElement) {

        countElement.textContent =
            referralCount;
    }
}


/* =========================================================
   REFERRAL UI
========================================================= */

function updateReferralUI() {

    const count =
        Math.min(
            referralCount,
            REFERRAL_TARGET
        );


    const countElement =
        document.getElementById(
            "referralCount"
        );


    if (countElement) {

        countElement.textContent =
            count;

    }


    const progress =
        (count / REFERRAL_TARGET) *
        100;


    const progressFill =
        document.getElementById(
            "progressFill"
        );


    if (progressFill) {

        progressFill.style.width =
            progress + "%";

    }


    const progressText =
        document.querySelector(
            ".progress-header strong"
        );


    if (progressText) {

        progressText.textContent =
            count +
            " / " +
            REFERRAL_TARGET;
    }


    const claimButton =
        document.getElementById(
            "claimButton"
        );


    if (!claimButton) return;


    if (
        referralCount >=
        REFERRAL_TARGET
    ) {

        claimButton.disabled =
            false;

        claimButton.textContent =
            "CLAIM 111GB 🎁";

        claimButton.classList.add(
            "ready"
        );

    } else {

        claimButton.disabled =
            true;

        claimButton.textContent =
            "Complete 10 Referrals";

        claimButton.classList.remove(
            "ready"
        );

    }
}


/* =========================================================
   COPY REFERRAL CODE
========================================================= */

function copyReferralCode() {

    const code =
        createReferralCode();


    if (
        navigator.clipboard &&
        window.isSecureContext
    ) {

        navigator.clipboard
            .writeText(code)
            .then(() => {

                showNotification(
                    "Referral code copied"
                );

            })
            .catch(() => {

                fallbackCopy(code);

            });

    } else {

        fallbackCopy(code);

    }
}


/* =========================================================
   FALLBACK COPY
========================================================= */

function fallbackCopy(text) {

    const input =
        document.createElement(
            "textarea"
        );

    input.value = text;

    input.style.position =
        "fixed";

    input.style.opacity = "0";

    document.body.appendChild(input);

    input.focus();

    input.select();


    try {

        document.execCommand(
            "copy"
        );

        showNotification(
            "Referral code copied"
        );

    } catch (error) {

        showNotification(
            "Copy failed"
        );

    }


    input.remove();
}


/* =========================================================
   CLAIM REFERRAL REWARD
========================================================= */

function claimReward() {

    if (
        referralCount <
        REFERRAL_TARGET
    ) {

        showNotification(
            "You need 10 verified referrals"
        );

        return;
    }


    showNotification(
        "111GB reward claim created"
    );


    console.log(
        "REFERRAL REWARD CLAIM",
        {
            reward: REFERRAL_REWARD,
            code: referralCode
        }
    );
}


/* =========================================================
   DEMO REFERRAL FUNCTION
   FOR UI TESTING ONLY
========================================================= */

function addDemoReferral() {

    if (
        referralCount >=
        REFERRAL_TARGET
    ) {

        showNotification(
            "Referral target already reached"
        );

        return;
    }


    referralCount++;

    localStorage.setItem(
        "rbtReferralCount",
        referralCount
    );


    updateReferralUI();


    showNotification(
        "Demo referral added"
    );
}


/* =========================================================
   DATA USAGE ANIMATION
========================================================= */

function animateUsage() {

    const ring =
        document.querySelector(
            ".meter-ring"
        );


    if (!ring) return;


    ring.style.transform =
        "scale(.94)";


    setTimeout(() => {

        ring.style.transition =
            "transform .8s ease";

        ring.style.transform =
            "scale(1)";

    }, 300);
}


/* =========================================================
   NOTIFICATION
========================================================= */

function showNotification(message) {

    const notification =
        document.getElementById(
            "notification"
        );


    if (!notification) {

        alert(message);

        return;
    }


    notification.textContent =
        message;


    notification.classList.add(
        "show"
    );


    clearTimeout(
        notificationTimer
    );


    notificationTimer =
        setTimeout(() => {

            notification.classList.remove(
                "show"
            );

        }, 2600);
}


/* =========================================================
   PACKAGE SEARCH / FILTER
   OPTIONAL SUPPORT
========================================================= */

function filterPackages(searchText) {

    const container =
        document.getElementById(
            "packageContainer"
        );


    if (!container) return;


    const value =
        String(searchText)
            .toLowerCase()
            .trim();


    const filtered =
        packages.filter(pkg => {

            return (
                pkg.data
                    .toLowerCase()
                    .includes(value) ||

                pkg.duration
                    .toLowerCase()
                    .includes(value) ||

                String(pkg.price)
                    .includes(value)
            );

        });


    container.innerHTML =
        filtered.length
            ? filtered
                .map(createPackageCard)
                .join("")
            : `
                <div
                    style="
                        grid-column:1/-1;
                        padding:40px;
                        text-align:center;
                        color:#777;
                    "
                >
                    No package found
                </div>
            `;
}


/* =========================================================
   GLOBAL CLICK PROTECTION
========================================================= */

document.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                "button"
            );


        if (!button) return;


        if (
            button.classList.contains(
                "package-buy"
            )
        ) {

            button.style.transform =
                "scale(.96)";


            setTimeout(() => {

                button.style.transform =
                    "";

            }, 120);

        }

    }
);


/* =========================================================
   PREVENT EMPTY PHONE SUBMIT
========================================================= */

document.addEventListener(
    "input",
    event => {

        if (
            event.target.id ===
            "phoneNumber"
        ) {

            event.target.value =
                event.target.value
                    .replace(
                        /[^0-9+]/g,
                        ""
                    );

        }

    }
);


/* =========================================================
   INITIAL ACTIVE PAGE
========================================================= */

setTimeout(() => {

    updateNavigation("home");

}, 100);


/* =========================================================
   END
========================================================= */