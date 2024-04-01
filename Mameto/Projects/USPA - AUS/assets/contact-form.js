//the below functions checks for the empty inputs in contact form
document.addEventListener('DOMContentLoaded', function() {
    const contactElement = document.querySelector("#contactFormElement");
    const errorMessage = contactElement.querySelector(".form__error-message");
    const submitButton = contactElement.querySelector(".contact-submit-button");
    if(submitButton){
        submitButton.addEventListener("click", function(event){
            errorMessage.innerText = ""
            const inputElements = Array.from(contactElement.querySelectorAll("input"));
            let isValid = true;
          
            inputElements.forEach(function(input) {
              if (input.value.trim() === "") {
                isValid = false;
                return;
              }
            });
//if any empty input is found, displays a message to user else continues the submit action
            if (!isValid) {
              event.preventDefault();
              errorMessage.innerText = "Please complete the form. All form fields are mandatory.";
              errorMessage.style.display = "block";
            } else {
              errorMessage.style.display = "none"; // Hides the error message if form is valid
            }
          });
    }
  });
  