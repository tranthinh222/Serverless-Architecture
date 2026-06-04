const COGNITO_URL = `https://cognito-idp.${CONFIG.COGNITO_REGION}.amazonaws.com/`;
// add mock test
function showSpinner() {
  document.getElementById("spinner")?.classList.remove("hidden");
}

function hideSpinner() {
  document.getElementById("spinner")?.classList.add("hidden");
}

function showToast(message) {
  const container = document.getElementById("toast");
  const toast = document.createElement("div");

  toast.className = "toast";
  toast.textContent = message;

  container.appendChild(toast);

  setTimeout(() => toast.remove(), 3000);
}

async function cognitoRequest(target, body) {
  const res = await fetch(COGNITO_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-amz-json-1.1",
      "X-Amz-Target": target,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || data.__type || "Cognito error");
  }

  return data;
}

const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    showSpinner();

    try {
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;
      // add mock test
      const data = await cognitoRequest(
        "AWSCognitoIdentityProviderService.InitiateAuth",
        {
          AuthFlow: "USER_PASSWORD_AUTH",
          ClientId: CONFIG.COGNITO_CLIENT_ID,
          AuthParameters: {
            USERNAME: email,
            PASSWORD: password,
          },
        },
      );

      localStorage.setItem("idToken", data.AuthenticationResult.IdToken);
      localStorage.setItem(
        "accessToken",
        data.AuthenticationResult.AccessToken,
      );

      window.location.href = "./dashboard.html";
    } catch (err) {
      showToast(err.message);
    } finally {
      hideSpinner();
    }
  });
}

if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    showSpinner();

    try {
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;
      // add mocktest
      await cognitoRequest("AWSCognitoIdentityProviderService.SignUp", {
        ClientId: CONFIG.COGNITO_CLIENT_ID,
        Username: email,
        Password: password,
        UserAttributes: [
          {
            Name: "email",
            Value: email,
          },
        ],
      });

      showToast("Sign up successful. Please confirm your email, then login.");

      setTimeout(() => {
        window.location.href = "./login.html";
      }, 1800);
    } catch (err) {
      showToast(err.message);
    } finally {
      hideSpinner();
    }
  });
}
