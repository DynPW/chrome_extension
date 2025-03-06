function generatePassword(domain, password) {
  const hashInput = domain + password;
  const hashBuffer = new TextEncoder().encode(hashInput);
  
  return crypto.subtle.digest("SHA-256", hashBuffer).then(hashArrayBuffer => {
      const hashArray = Array.from(new Uint8Array(hashArrayBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

      const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      const lowercase = "abcdefghijklmnopqrstuvwxyz";
      const digits = "0123456789";
      const specialChars = "!@#$%^&*()-_+=<>?/";

      const seedValue = parseInt(hashHex.slice(0, 8), 16);
      const random = new Math.seedrandom(seedValue);

      function getRandomChar(set) {
          return set[Math.floor(random() * set.length)];
      }

      const upper = getRandomChar(uppercase);
      const lower = getRandomChar(lowercase);
      const digit = getRandomChar(digits);
      const special = getRandomChar(specialChars);
      const remainingChars = Array.from({ length: 8 }, () => getRandomChar(uppercase + lowercase + digits + specialChars));

      const passwordChars = [upper, lower, digit, special, ...remainingChars];

      const shuffleSeed = parseInt(hashHex.slice(8, 16), 16);
      const shuffleRandom = new Math.seedrandom(shuffleSeed);
      passwordChars.sort(() => shuffleRandom() - 0.5);

      return passwordChars.join("");
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "generatePassword") {
      try {
          const url = new URL(request.url);
          const domainParts = url.hostname.split(".");
          const domain = domainParts.slice(-2).join(".");

          // 1️⃣ Django 서버에 요청
          fetch("http://127.0.0.1:8000/api/generate-password/", {
              method: "POST",
              headers: {
                  "Content-Type": "application/json"
              },
              body: JSON.stringify({ url: request.url, password: request.password })
          })
          .then(response => response.json())
          .then(data => {
              if (data.generated_password) {
                  sendResponse({ password: data.generated_password });
              } else {
                  throw new Error("Invalid response from server");
              }
          })
          .catch(() => {
              // 2️⃣ 서버 요청 실패 시 로컬에서 생성
              generatePassword(domain, request.password).then(localPassword => {
                  sendResponse({ password: localPassword });
              });
          });

          return true; // 비동기 응답을 위해 true 반환
      } catch (error) {
          sendResponse({ error: error.toString() });
          return true;
      }
  }
});
