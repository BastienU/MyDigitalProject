document.addEventListener("DOMContentLoaded", function () {
    const infoButtons = document.querySelectorAll(".info");
    const modal = document.querySelector(".modal");
    const modalContent = document.querySelector(".modal-content");
    const closeModal = document.querySelector(".close-modal");

    infoButtons.forEach(button => {
        button.addEventListener("click", function () {
            const card = this.closest(".card");
            const title = card.querySelector("h3").textContent;
            const description = card.querySelector("p:first-of-type").textContent;
            const price = card.querySelector(".price").textContent;
            const imageSrc = card.querySelector("img").src;

            modalContent.innerHTML = `
                <span class="close-modal">&times;</span>
                <h2>${title}</h2>
                <img src="${imageSrc}" alt="${title}">
                <p>${description}</p>
                <p class="price">${price}</p>
            `;

            modal.style.display = "block";

            document.querySelector(".close-modal").addEventListener("click", function () {
                modal.style.display = "none";
            });
        });
    });

    // Fermer la modal en cliquant en dehors du contenu
    window.addEventListener("click", function (event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });
});