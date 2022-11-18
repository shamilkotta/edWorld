/* eslint-disable no-unused-vars */
const toggleMobileNave = (open) => {
  const menu = document.getElementById("sidebar");
  if (open) {
    menu.style.marginLeft = "0px";
  } else {
    menu.style.marginLeft = "-250px";
  }
};
