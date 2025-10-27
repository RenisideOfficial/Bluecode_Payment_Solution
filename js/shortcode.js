// shortcode.js
let amount = "";
let currentMerchantTxId = "";

const MERCHANT_USERNAME_PASSWORD = process.env.MERCHANT_USERNAME_PASSWORD;

function addNumber(num) {
  amount += num;
  document.getElementById("amount").value =
    "NGN " + (parseFloat(amount) / 100).toFixed(2);
}

function clearAmount() {
  amount = "";
  document.getElementById("amount").value = amount;
  document.getElementById("qrcode").innerHTML = ""; // Clear the QR code
}

function deleteNumber() {
  amount = amount.slice(0, -1);
  if (amount === "") {
    document.getElementById("amount").value = "NGN .00";
  } else {
    document.getElementById("amount").value =
      "NGN " + (parseFloat(amount) / 100).toFixed(2);
  }
}

// reloads the page
function refreshPage() {
  location.reload();
}

function generateRandomId() {
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "id_";
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

async function processPayment() {
  const paymentAmount = parseInt(amount);
  const barcode = document.getElementById("barcode").value.trim();

  // Validate inputs
  if (isNaN(paymentAmount) || paymentAmount <= 0) {
    alert("Please enter a valid amount.");
    return;
  }
  if (barcode === "") {
    alert("Please enter a barcode.");
    return;
  }

  // Prepare the payment data
  currentMerchantTxId = generateRandomId();
  const paymentData = {
    branch_ext_id: "TEAM RENISIDE",
    merchant_tx_id: currentMerchantTxId,
    scheme: "AUTO",
    barcode: barcode,
    total_amount: paymentAmount,
    requested_amount: paymentAmount,
    consumer_tip_amount: 0,
    currency: "NGN",
    slip: "Thanks for shopping with us!",
  };

  // Clear any existing QR code
  document.getElementById("qrcode").innerHTML = "";

  // Generate QR code
  const qrCodeData = `Payment Amount: ${paymentAmount} NGN, Barcode: ${barcode}`;
  new QRCode(document.getElementById("qrcode"), {
    text: qrCodeData,
    width: 128,
    height: 128,
    colorDark: "#000000",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H,
  });

  // Send the payment data to the Bluecode API
  try {
    const response = await fetch(
      "https://merchant-api.acq.int.bluecode.ng/v4/payment",
      {
        method: "POST",
        headers: {
          Authorization: "Basic " + btoa(MERCHANT_USERNAME_PASSWORD),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentData),
      }
    );

    if (response.ok) {
      const result = await response.json();
      console.log("API Response:", result);
      document.getElementById(
        "payment-status"
      ).innerText = `Payment Status: ${result.result}`;
      console.log("Payment Status:", result);
      document.getElementById("barcode").value = "";
      startStatusPolling(currentMerchantTxId); // Start polling for payment status
    } else {
      alert("Payment failed. Please try again.");
      console.error("API Error:", response.statusText);
      document.getElementById("barcode").value = "";
    }
  } catch (error) {
    alert("An error occurred while processing the payment.");
    console.error("Error:", error);
  }

  clearAmount();
}

async function checkPaymentStatus(merchantTxId) {
  try {
    const response = await fetch(
      `https://merchant-api.acq.int.bluecode.ng/v4/status/?merchant_tx_id=${merchantTxId}`,
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
      console.log("Payment Status:", result);
      document.getElementById(
        "payment-status"
      ).innerText = `Payment Status: ${result.payment.state}`;
      if (
        result.payment.state === "APPROVED" ||
        result.payment.state === "DECLINED"
      ) {
        clearInterval(statusInterval); // Stop polling if payment is approved or declined
      }
    } else {
      document.getElementById("payment-status").innerText =
        "Failed to fetch payment status.";
      console.error("Failed to fetch payment status:", response.statusText);
    }
  } catch (error) {
    document.getElementById("payment-status").innerText =
      "Error checking payment status.";
    console.error("Error checking payment status:", error);
  }
}

let statusInterval;

function startStatusPolling(merchantTxId) {
  statusInterval = setInterval(() => {
    checkPaymentStatus(merchantTxId);
  }, 5000); // Check status every 5 seconds
}
