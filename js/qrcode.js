// Payment.js
const generateButton = document.getElementById("generate-btn");
const statusText = document.getElementById("status");

let amount = "";
let merchantTxId = ""; // Store the merchant_tx_id for status checking
let statusInterval = null; // Store the status check interval

const MERCHANT_USERNAME_PASSWORD = process.env.MERCHANT_USERNAME_PASSWORD;

// Function to add a number to the amount
function addNumber(num) {
  amount += num;
  document.getElementById("amount").value =
    "NGN " + (parseFloat(amount) / 100).toFixed(2);
}

// Function to clear the amount
function clearAmount() {
  amount = "";
  document.getElementById("amount").value = amount;
}

// Function to delete the last number from the amount
function deleteNumber() {
  amount = amount.slice(0, -1);
  if (amount === "") {
    document.getElementById("amount").value = "NGN .00";
  } else {
    document.getElementById("amount").value =
      "NGN " + (parseFloat(amount) / 100).toFixed(2);
  }
}

// Function to generate a random merchant_tx_id
function generateRandomId() {
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "id_";
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

// Function to generate the QR code using emv_content
const generateQR = (emvContent) => {
  const imgBox = document.getElementById("imgBox");
  const qrImage = document.getElementById("qrImage");

  qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${emvContent}`;
  imgBox.classList.add("show-img");
};

// Function to display payment status in the HTML
const displayStatus = (status) => {
  const statusText = document.getElementById("status");
  statusText.textContent = `Payment Status: ${status}`; // Update the status text in the HTML
};

// reloads the page
function refreshPage() {
  location.reload();
}

// Function to fetch payment status
const fetchPaymentStatus = async (merchantTxId) => {
  const bluecodeDomain = "int.bluecode.ng";

  try {
    const response = await fetch(
      `https://merchant-api.acq.${bluecodeDomain}/v4/status/?merchant_tx_id=${merchantTxId}`,
      {
        method: "POST",
        headers: {
          Authorization: "Basic " + btoa(MERCHANT_USERNAME_PASSWORD),
          "Content-Type": "application/json",
        },
      }
    );

    if (response.ok) {
      const result = await response.json();
      return result.payment.state; // Assuming the status is in result.payment.state
    } else {
      console.error("API Error:", response.statusText);
      return null;
    }
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
};

// Function to periodically check payment status and update the HTML
const startStatusCheck = (merchantTxId) => {
  statusInterval = setInterval(async () => {
    const status = await fetchPaymentStatus(merchantTxId);
    if (status) {
      displayStatus(status); // Update the status in the HTML
      if (
        status === "SUCCESS" ||
        status === "FAILURE" ||
        status === "CANCELLED"
      ) {
        clearInterval(statusInterval); // Stop checking if the payment is finalized
      }
    }
  }, 5000); // Check every 5 seconds
};

// Modify the generateButton event listener
generateButton.addEventListener("click", async () => {
  const paymentAmount = parseInt(amount);

  // Validate input
  if (isNaN(paymentAmount) || paymentAmount <= 0) {
    alert("Please enter a valid amount.");
    return;
  }

  // Reset intervals
  if (statusInterval) {
    clearInterval(statusInterval);
  }

  const bluecodeDomain = "int.bluecode.ng";
  const merchantAccess = "TEAM_RENISIDE";
  const merchantSecret = "061f3831-34bb-43b4-8d7e-c70b3b087a42";
  const branchExtId = "TEAM RENISIDE";

  // Prepare the request body
  const requestBody = {
    branch_ext_id: branchExtId,
    merchant_tx_id: generateRandomId(),
    requested_amount: paymentAmount,
    currency: "NGN",
    scheme: "blue_code",
    merchant_callback_url: "https://www.merchant.com/transaction-callback",
    return_url_cancel: "https://www.merchant.com/cancel",
    return_url_failure: "https://www.merchant.com/failure",
    return_url_success: "https://www.bluecode.com",
    terminal: "terminal-1234",
    source: "pos",
  };

  merchantTxId = requestBody.merchant_tx_id; // Store the merchant_tx_id for status checking

  try {
    // Send the POST request to the Register endpoint
    const response = await fetch(
      `https://merchant-api.acq.${bluecodeDomain}/v4/register`,
      {
        method: "POST",
        headers: {
          Authorization: "Basic " + btoa(MERCHANT_USERNAME_PASSWORD),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (response.ok) {
      const result = await response.json();
      console.log("API Response:", result);

      let emvContent = result.payment.emv_content; // Use emv_content instead of checkin_code
      console.log(emvContent); // Inspect the value

      // Generate the QR code using emv_content
      generateQR(emvContent);

      // Display initial payment status
      displayStatus(result.payment.state);

      // Show "Scan the QR Code" text
      document.getElementById("scan-text").style.display = "block";

      // Start checking the payment status and update the HTML
      startStatusCheck(merchantTxId);
    } else {
      console.error("API Error:", response.statusText);
      alert("Failed to register. Please try again.");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("An error occurred. Please check the console for details.");
  }
});
