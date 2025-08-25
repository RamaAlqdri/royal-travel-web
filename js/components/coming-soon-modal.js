document.addEventListener("DOMContentLoaded", function () {
    console.log("Document is ready");

    // Load the jet modal content
    fetch('coming-soon-jet.html')
        .then(response => response.text())
        .then(data => {
            // Insert the jet modal HTML into the body
            document.body.insertAdjacentHTML('beforeend', data);

            const jetPopup = document.querySelector('.popup_wrapper_coming_soon_jet');
            const jetTriggerBtn = document.getElementById('viewJetScheduleBtn');

            // Hide jet popup initially
            if (jetPopup) jetPopup.style.display = 'none';

            if (jetTriggerBtn && jetPopup) {
                jetTriggerBtn.addEventListener('click', function (e) {
                    e.preventDefault();
                    console.log("Jet Button clicked");
                    jetPopup.style.display = 'block';
                    jetPopup.style.opacity = 0;
                    jetPopup.style.transition = 'opacity 0.3s ease';
                    requestAnimationFrame(() => {
                        jetPopup.style.opacity = 1;
                    });
                });
            }

            // Optional: Close jet popup when clicking the close icon
            const jetCloseBtn = jetPopup.querySelector('.popup_close');
            if (jetCloseBtn) {
                jetCloseBtn.addEventListener('click', function () {
                    if (jetPopup) {
                        jetPopup.style.opacity = 0;
                        setTimeout(() => {
                            jetPopup.style.display = 'none';
                        }, 300);
                    }
                });
            }
        })
        .catch(error => console.error('Error loading jet modal:', error));

    // Load the yacht modal content
    fetch('coming-soon-yacht.html')
        .then(response => response.text())
        .then(data => {
            // Insert the yacht modal HTML into the body
            document.body.insertAdjacentHTML('beforeend', data);

            const yachtPopup = document.querySelector('.popup_wrapper_coming_soon_yacht');
            const yachtTriggerBtn = document.getElementById('viewYachtScheduleBtn');

            // Hide yacht popup initially
            if (yachtPopup) yachtPopup.style.display = 'none';

            if (yachtTriggerBtn && yachtPopup) {
                yachtTriggerBtn.addEventListener('click', function (e) {
                    e.preventDefault();
                    console.log("Yacht Button clicked");
                    yachtPopup.style.display = 'block';
                    yachtPopup.style.opacity = 0;
                    yachtPopup.style.transition = 'opacity 0.3s ease';
                    requestAnimationFrame(() => {
                        yachtPopup.style.opacity = 1;
                    });
                });
            }

            // Optional: Close yacht popup when clicking the close icon
            const yachtCloseBtn = yachtPopup.querySelector('.popup_close');
            if (yachtCloseBtn) {
                yachtCloseBtn.addEventListener('click', function () {
                    if (yachtPopup) {
                        yachtPopup.style.opacity = 0;
                        setTimeout(() => {
                            yachtPopup.style.display = 'none';
                        }, 300);
                    }
                });
            }
        })
        .catch(error => console.error('Error loading yacht modal:', error));
}); 