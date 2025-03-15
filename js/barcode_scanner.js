document.addEventListener("DOMContentLoaded", function () {
  Quagga.init(
    {
      inputStream: {
        name: "Live",
        type: "LiveStream",
        target: document.querySelector("#interactive"),
        constraints: {
          width: 640,
          height: 480,
          facingMode: "environment", // Use the rear camera
        },
      },
      decoder: {
        readers: ["code_128_reader"], // Focus on Code 128 format
      },
      locator: {
        halfSample: true,
        patchSize: "medium", // Adjust for better detection
      },
      numOfWorkers: 4, // Use multiple workers for better performance
      frequency: 10, // Check for barcodes 10 times per second
    },
    function (err) {
      if (err) {
        console.error("Failed to initialize QuaggaJS:", err);
        document.getElementById("result").innerText = "Failed to initialize scanner. Please reload the page.";
        return;
      }
      console.log("QuaggaJS initialized successfully");
      Quagga.start();
    }
  );

  Quagga.onDetected(function (result) {
    const code = result.codeResult.code;
    console.log("Scanned barcode:", code); // Debugging: Log the scanned barcode

    if (!code) {
      document.getElementById("result").innerText = "No barcode detected. Please try again.";
      return;
    }

    // Trim any extra spaces or unexpected characters
    const trimmedCode = code.trim();
    const prefix = "988"; // Define the required prefix for the 20-digit barcode

    // Check if the barcode is a 20-digit number starting with 988
    if (/^988\d{17}$/.test(trimmedCode)) {
      document.getElementById("result").innerText = `Valid 20-digit barcode detected: ${trimmedCode} (starts with 988)`;
      Quagga.stop(); // Stop scanning after valid detection
    }
    // Check if the barcode is an 8-digit number
    else if (/^\d{8}$/.test(trimmedCode)) {
      document.getElementById("result").innerText = `Valid 8-digit barcode detected: ${trimmedCode}`;
      Quagga.stop(); // Stop scanning after valid detection
    }
    // Invalid barcode
    else {
      document.getElementById("result").innerText = `Invalid barcode: ${trimmedCode} (must be a 20-digit number starting with 988 or an 8-digit number)`;
    }
  });

  // Rescan button
  document.getElementById("rescan-button").addEventListener("click", function () {
    document.getElementById("result").innerText = "Scan a barcode...";
    Quagga.start(); // Restart the scanner
  });
});