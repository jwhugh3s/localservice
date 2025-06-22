document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contact-form');
    const formSubmissionNote = document.querySelector('.form-submission-note');
    const serviceTypeSelect = document.getElementById('service-type');
    const vehicleInfoDiv = document.getElementById('vehicle-info');

    if (serviceTypeSelect && vehicleInfoDiv) {
        serviceTypeSelect.addEventListener('change', () => {
            if (serviceTypeSelect.value === 'oil-change') {
                vehicleInfoDiv.style.display = 'block';
            } else {
                vehicleInfoDiv.style.display = 'none';
            }
        });
    }

    if (contactForm) {
        contactForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Prevent default form submission

            // Client-side validation
            if (!validateForm()) {
                return; // Stop submission if validation fails
            }

            const formData = new FormData(contactForm);
            const data = {};
            formData.forEach((value, key) => {
                data[key] = value;
            });

            // Clear previous messages and set to submitting
            if (formSubmissionNote) {
                formSubmissionNote.textContent = 'Submitting...';
                formSubmissionNote.className = 'form-submission-note'; // Reset classes, remove 'error' or 'success'
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

    function validateForm() {
        // Clear previous error messages
        clearErrorMessages();

        let isValid = true;
        const name = document.getElementById('name').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const location = document.getElementById('location').value.trim();
        const serviceType = document.getElementById('service-type').value;

        if (!name) {
            displayErrorMessage('name', 'Name is required.');
            isValid = false;
        }

        if (!phone) {
            displayErrorMessage('phone', 'Phone number is required.');
            isValid = false;
        } else if (!/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(phone)) {
            displayErrorMessage('phone', 'Invalid phone number format.');
            isValid = false;
        }

        if (!location) {
            displayErrorMessage('location', 'Location is required.');
            isValid = false;
        }

        if (!serviceType) {
            displayErrorMessage('service-type', 'Service type is required.');
            isValid = false;
        }

        if (serviceType === 'oil-change') {
            const vehicleMake = document.getElementById('vehicle-make').value.trim();
            const vehicleModel = document.getElementById('vehicle-model').value.trim();
            const vehicleYear = document.getElementById('vehicle-year').value.trim();
            const licensePlate = document.getElementById('license-plate').value.trim();

            if (!vehicleMake) {
                displayErrorMessage('vehicle-make', 'Vehicle make is required for oil change.');
                isValid = false;
            }
            if (!vehicleModel) {
                displayErrorMessage('vehicle-model', 'Vehicle model is required for oil change.');
                isValid = false;
            }
            if (!vehicleYear) {
                displayErrorMessage('vehicle-year', 'Vehicle year is required for oil change.');
                isValid = false;
            } else if (!/^\d{4}$/.test(vehicleYear) || parseInt(vehicleYear) < 1900 || parseInt(vehicleYear) > new Date().getFullYear() + 1) {
                displayErrorMessage('vehicle-year', 'Invalid vehicle year.');
                isValid = false;
            }
            if (!licensePlate) {
                displayErrorMessage('license-plate', 'License plate number is required for oil change.');
                isValid = false;
            }
        }

        // Update submission note if errors exist
        const formSubmissionNote = document.querySelector('.form-submission-note');
        if (!isValid && formSubmissionNote) {
            formSubmissionNote.textContent = 'Please correct the errors above.';
            formSubmissionNote.className = 'form-submission-note error';
        } else if (formSubmissionNote) {
            // Clear note if form is now valid or before submitting
            formSubmissionNote.textContent = '';
            formSubmissionNote.className = 'form-submission-note';
        }

        return isValid;
    }

    function displayErrorMessage(fieldId, message) {
        const field = document.getElementById(fieldId);
        if (field) {
            let errorElement = document.getElementById(fieldId + '-error');
            if (!errorElement) {
                errorElement = document.createElement('p');
                errorElement.id = fieldId + '-error';
                errorElement.className = 'error-message'; // Add class for styling
                // Insert after the field or its parent if it's a select/complex input
                const parentGroup = field.closest('.form-group');
                if (parentGroup) {
                    parentGroup.appendChild(errorElement);
                } else {
                    field.parentNode.insertBefore(errorElement, field.nextSibling);
                }
            }
            errorElement.textContent = message;
            errorElement.style.display = 'block'; // Ensure it's visible
        }
    }

    function clearErrorMessages() {
        const errorMessages = document.querySelectorAll('.error-message');
        errorMessages.forEach(msg => {
            // msg.textContent = ''; // Clear message content
            msg.style.display = 'none'; // Hide message element
        });
        // Also clear the general submission note if it was showing an error summary
        const formSubmissionNote = document.querySelector('.form-submission-note');
        if (formSubmissionNote && formSubmissionNote.classList.contains('error')) {
             formSubmissionNote.textContent = '';
             formSubmissionNote.className = 'form-submission-note';
        }
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
