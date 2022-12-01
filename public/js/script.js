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

  const totalInput = document.getElementById("total-days");
  totalInput.value = total;

  const attendance = document.getElementById("attendance");
  attendance.setAttribute("max", total);

  const monthId = document.getElementById("month-id");
  monthId.value = id;
}

// fetch fee info of student
function fetchInvoice(option = 0) {
  const payoutModal = document.getElementById("payout-body");

  fetch(`/student/get-invoice/${option}`)
    .then((response) => response.json())
    .then((response) => {
      if (response.success) {
        const { feeOptions, amount, tax, taxAmount, total, balance } =
          response.data;
        payoutModal.innerHTML = `
          <div>
            <form action="" class="px-3">
            ${feeOptions &&
          `
              <div class="row border rounded align-items-center py-2 px-1">
                <p class="col-5 my-auto">Payment Options</p>
                <div class="form-check col">
                  <input
                    class="form-check-input"
                    name="fee_type"
                    type="radio"
                    value="One time"
                    id="one-time"
                    onChange= "fetchInvoice(0)"
                    ${option === 0 && `checked`}
                    required
                  />
                  <label class="form-check-label" for="one-time">One-time</label>
                </div>
                <div class="form-check col">
                  <input
                    class="form-check-input"
                    name="fee_type"
                    type="radio"
                    value="Installment"
                    id="installment"
                    ${option === 1 && `checked`}
                    onChange= "fetchInvoice(1)"
                  />
                  <label
                    class="form-check-label"
                    for="installment"
                  >Installment</label>
                </div>
              </div>
            `
          }
              
              <!-- Billing details -->
              <div class="mt-4 mb-4">
                <div class="d-flex justify-content-between">
                  <span class="fs-5">Amount</span>
                  <span class="fs-5" id="fee-amount">₹${amount}</span>
                </div>
                <div class="d-flex justify-content-between">
                  <span class="fs-5">Tax (${tax}%)</span>
                  <span class="fs-5">₹${taxAmount}</span>
                </div>
                <hr>
                <div class="d-flex justify-content-between">
                  <span class="fs-5 fw-bolder">Total</span>
                  <span class="fs-5 fw-bolder" id="fee-total">₹${total}</span>
                </div>
                <div class="d-flex justify-content-between">
                  <span class="fs-6">Balance</span>
                  <span class="fs-6" id="fee-balance">- ₹${balance}</span>
                </div>
              </div>
              <div class="mt-3 d-flex justify-content-end">
                <button
                  type="submit"
                  class="btn btn-outline-success"
                >Pay Now</button>
              </div>
            </form>
          </div>
        `;
      } else {
        payoutModal.innerHTML = `<p class="mt-5">${response.message}</p>`;
      }
    })
    .catch((err) => {
      payoutModal.innerHTML = `<p class="mt-5">Can't fetch your invoice, please try again later</p>`;
    });
}
