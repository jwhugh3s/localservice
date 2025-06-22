document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contact-form');
    const formSubmissionNote = document.querySelector('.form-submission-note');

    if (contactForm) {
        contactForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Prevent default form submission

            const formData = new FormData(contactForm);
            const data = {};
            formData.forEach((value, key) => {
                data[key] = value;
            });

            // Clear previous messages
            if (formSubmissionNote) {
                formSubmissionNote.textContent = 'Submitting...';
                formSubmissionNote.className = 'form-submission-note'; // Reset classes
            }

            try {
                const response = await fetch('/send-contact-form', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                });

                const result = await response.json();

                if (formSubmissionNote) {
                    formSubmissionNote.textContent = result.message;
                    if (result.success) {
                        formSubmissionNote.classList.add('success');
                        contactForm.reset(); // Reset form on success
                    } else {
                        formSubmissionNote.classList.add('error');
                    }
                } else {
                    // Fallback if the note element isn't found for some reason
                    alert(result.message);
                    if (result.success) {
                        contactForm.reset();
                    }
                }

            } catch (error) {
                console.error('Form submission error:', error);
                if (formSubmissionNote) {
                    formSubmissionNote.textContent = 'An error occurred. Please try again.';
                    formSubmissionNote.className = 'form-submission-note error';
                } else {
                    alert('An error occurred. Please try again.');
                }
            }
        });
    }

    // Smooth scrolling for navigation links
    document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
});
