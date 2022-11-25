/* eslint-disable no-unused-vars */
const toggleMobileNave = (open) => {
  const menu = document.getElementById("sidebar");
  if (open) {
    menu.style.marginLeft = "0px";
  } else {
    menu.style.marginLeft = "-250px";
  }
};

// image upload preview
document.getElementById("profile").onchange = function () {
  const src = URL.createObjectURL(this.files[0]);
  document.getElementById("profile-preview").src = src;
};

// pattern validation
function validateName(input) {
  if (/^[A-Za-z ]+$/.test(input.value)) {
    // input is valid -- reset the error message
    input.setCustomValidity("");
  } else {
    input.setCustomValidity(`Enter a valid name`);
  }
}

function validatePhone(input) {
  if (/^[0]?[6789]\d{9}$/.test(input.value)) {
    // input is valid -- reset the error message
    input.setCustomValidity("");
  } else {
    input.setCustomValidity(`Enter a valid phone number`);
  }
}

function validateEmail(input) {
  if (
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
      input.value
    )
  ) {
    // input is valid -- reset the error message
    input.setCustomValidity("");
  } else {
    input.setCustomValidity(`Enter a valid email`);
  }
}

function validatePinCode(input) {
  if (/^[1-9]{1}[0-9]{2}\s{0,1}[0-9]{3}$/.test(input.value)) {
    // input is valid -- reset the error message
    input.setCustomValidity("");
  } else {
    input.setCustomValidity(`Enter a valid pin code`);
  }
}
