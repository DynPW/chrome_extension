// content.js
document.addEventListener("DOMContentLoaded", function () {
  const passwordField = document.querySelector("input[name='memberPassword']");
  if (passwordField) {
    passwordField.addEventListener("change", function () {
      const rawPassword = passwordField.value;
      const siteUrl = window.location.origin;
      
      chrome.runtime.sendMessage({ action: "generatePassword", url: siteUrl, password: rawPassword }, (response) => {
        if (response && response.password) {
          passwordField.value = response.password;
        }
      });
    });
  }
});