document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("testButton").addEventListener("click", function () {
        let password = document.getElementById("passwordInput").value; // 사용자가 입력한 비밀번호

        if (!password) {
            alert("Please enter a password.");
            return;
        }

        // 현재 활성화된 탭의 URL 가져오기
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            let siteUrl = ""; // 기본값 (URL이 없는 경우를 대비)

            if (tabs.length > 0 && tabs[0].url) {
                try {
                    let url = new URL(tabs[0].url);
                    siteUrl = url.origin; // 도메인만 추출
                } catch (error) {
                    console.error("Invalid URL:", error);
                }
            }

            // 백그라운드 스크립트에 메시지 전달 (URL 없이도 가능)
            chrome.runtime.sendMessage(
                { action: "generatePassword", url: siteUrl, password: password }, 
                (response) => {
                    if (response.password) {
                        document.getElementById("result").innerText = response.password;
                        copyToClipboard(response.password); // 비밀번호 클립보드 복사
                    } else {
                        document.getElementById("result").innerText = response.error;
                    }
                }
            );
        });
    });

    // 클립보드에 복사하는 함수 추가
    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            alert("Password copied to clipboard!"); // 알림 표시
        }).catch(err => {
            console.error("Clipboard copy failed: ", err);
        });
    }
});
