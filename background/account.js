
export async function getAccount() {
  let account = null;
  let authCode = localStorage.getItem("authCode");
  if (authCode) {
    // Get account
    await fetch("http://localhost:3000/account/get", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ "authCode": authCode }),
    })
      .then((response) => response.json())
      .then((data) => {
        account = JSON.parse(data);
      })
      .catch((error) => {
        console.error("Error getting account: ", error);
      });
  } else {
    // Create account
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    authCode = "";
    for (let i = 0; i < 32; i++) {
      authCode += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    await fetch("http://localhost:3000/account/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ "username": "Interloper", "authCode": authCode }),
    }).then((response) => response.json())
      .then((data) => {
        account = JSON.parse(data);
      })
      .catch((error) => {
        console.error("Error creating account: ", error);
      });
  }

  localStorage.setItem("authCode", authCode);
  return account;
}
