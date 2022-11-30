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
  if (/^[A-Za-z ]+$/.test(input.value)) input.setCustomValidity("");
  else input.setCustomValidity(`Enter a valid name`);
}

function validatePhone(input) {
  if (/^[0]?[6789]\d{9}$/.test(input.value)) input.setCustomValidity("");
  else input.setCustomValidity(`Enter a valid phone number`);
}

function validateEmail(input) {
  if (
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
      input.value
    )
  )
    input.setCustomValidity("");
  else input.setCustomValidity(`Enter a valid email`);
}

function validatePinCode(input) {
  if (/^[1-9]{1}[0-9]{2}\s{0,1}[0-9]{3}$/.test(input.value))
    input.setCustomValidity("");
  else input.setCustomValidity(`Enter a valid pin code`);
}

function checkConfirmPass(input) {
  if (input.value !== document.getElementById("password").value)
    input.setCustomValidity("Password Must be Matching.");
  else input.setCustomValidity("");
}

function validatePassword(input) {
  if (
    /((?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W])(?!.*\s).{8,16})/.test(
      input.value
    )
  )
    input.setCustomValidity("");
  else
    input.setCustomValidity(
      "Password must contain : \n Atleast One uppper case letter and lower case letter \nAtleast one digit and special charecter \nCan not contain white spaces \nAnd must be 8 to 16 charecters long"
    );
}

function superfix(index, inc = false) {
  if (inc) {
    if (index === 0 || index === "0") return "1<sup>st</sup>";
    if (index === 1 || index === "1") return "2<sup>nd</sup>";
    if (index === 2 || index === "2") return "3<sup>rd</sup>";
    return `${index + 1}<sup>th</sup>`;
  }
  if (index === 1 || index === "1") return "1<sup>st</sup>";
  if (index === 2 || index === "2") return "2<sup>nd</sup>";
  if (index === 3 || index === "3") return "3<sup>rd</sup>";
  return `${index}<sup>th</sup>`;
}

// student monthly data
function monthlyData(total, attended, id, index) {
  const head = document.getElementById("staticBackdropLabel");
  head.innerHTML = `${superfix(index, true)} Month Data`;

  const addon = document.getElementById("basic-addon2");
  addon.innerText = `/${total}`;

  const attendance = document.getElementById("attendance");
  attendance.setAttribute("max", total);

  const monthId = document.getElementById("month-id");
  monthId.value = id;
}
