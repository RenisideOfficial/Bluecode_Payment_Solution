// script.js

// Function to generate a random ID
function generateRandomId() {
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "id_";
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

// Base URL for API requests
/* NB: The localhost listens for requests from the webbrowser and 
sends those requests to the api thereby bypass the CORS webbrowser policy */
const API_BASE_URL = "http://localhost:8080/api/v2"; // Proxy server URL
const ACQUIBASE_USERNAME_PASSWORD = process.env.ACQUIBASE_USERNAME_PASSWORD;
const MEMBER_ID = process.env.MEMBER_ID;

// Function to create a merchant
async function createMerchant(merchantData) {
  const url = `${API_BASE_URL}/merchants`;
  const generatedExtId = generateRandomId(); // Generate the ext_id

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + btoa(ACQUIBASE_USERNAME_PASSWORD),
      },
      body: JSON.stringify({
        merchant: {
          fees: {
            bluecode: {
              instant: [
                {
                  tier: 1,
                  variable_fee: 0.005,
                  fixed_fee: 0.005,
                  from: 0,
                },
                {
                  tier: 2,
                  variable_fee: 0.0,
                  fixed_fee: 700,
                  from: 140000,
                },
              ],
            },
          },
          address: {
            zip: merchantData.zip,
            line_1: merchantData.address,
            country: merchantData.country,
            line_2: "",
            city: merchantData.city,
          },
          ext_id: generatedExtId, // Use the generated ext_id
          category_code: merchantData.category_code,
          group_id: "12345",
          contact: {
            emails: [merchantData.contact_email],
            gender: "MALE",
            phone: merchantData.contact_phone,
            name: merchantData.contact_name,
          },
          transaction_settings: {
            default_source: "POS",
            bluecode: {
              member_id: MEMBER_ID,
              instant_ng: "bluecode",
              blue_code: { enabled: true }, // ✅ NEW FIELD
              alipay: { enabled: false }, // ✅ optional
              wechat: { enabled: false }, // ✅ optional
            },
            booking_reference_prefix: "... We remain the best",
            instant: {
              networks: ["NIP"],
              beneficiary_reference: "000004/0123456987",
              beneficiary_name: "Usman Bukar",
            },
          },
          name: merchantData.name,
          state: "ACTIVE",
          billing: {
            period: "MONTHLY",
            delay: 1,
            active: true,
          },
        },
      }),
    });

    if (response.ok) {
      // Display the generated ext_id to the user
      document.getElementById("generatedExtId").textContent = generatedExtId;
      document.getElementById("extIdDisplay").style.display = "block"; // Show the ext_id section
      alert("Merchant created successfully!");
    } else {
      const errorText = await response.text();
      console.error("Raw Error Response:", errorText);
      try {
        const parsed = JSON.parse(errorText);
        console.error("Parsed Error Details:", parsed);
      } catch {
        console.warn("Error body was not JSON");
      }
      alert("Failed to create merchant. Check console for details.");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("An error occurred while creating the merchant.");
  }
}

// Function to fetch merchant details
async function fetchMerchant(merchantExtId) {
  const url = `${API_BASE_URL}/merchants/${merchantExtId}`;
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: "Basic " + btoa(ACQUIBASE_USERNAME_PASSWORD),
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log("Merchant Details:", data);
      return data;
    } else {
      console.error("Failed to fetch merchant details.");
      return null;
    }
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}

// Function to create a branch
async function createBranch(merchantExtId, branchData) {
  const url = `${API_BASE_URL}/merchants/${merchantExtId}/branches`;
  const generatedBranchExtId = generateRandomId(); // Generate a unique ext_id
  const generatedMerchantBranchId = generateRandomId(); // Generate a unique merchant_branch_id

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + btoa(ACQUIBASE_USERNAME_PASSWORD),
      },
      body: JSON.stringify({
        branch: {
          name: branchData.name,
          merchant_branch_id: generatedMerchantBranchId, // Use the generated merchant_branch_id
          ext_id: generatedBranchExtId, // Use the generated ext_id
          address: {
            city: branchData.city,
            line_1: branchData.address,
            zip: branchData.zip,
            country: branchData.country,
          },
          contact: {
            name: branchData.contact.name,
            gender: "MALE", // Hardcoded as per Postman example
            emails: branchData.contact.emails,
            phone: branchData.contact.phone,
          },
          booking_reference_prefix: "Test Outlet 1", // Hardcoded as per Postman example
          state: "ACTIVE", // Hardcoded as per Postman example
          virtual_terminal: {}, // Hardcoded as per Postman example
        },
      }),
    });

    if (response.ok) {
      // Display the generated ext_id and merchant_branch_id to the user
      document.getElementById("generatedBranchExtId").textContent =
        generatedBranchExtId;
      document.getElementById("generatedMerchantBranchId").textContent =
        generatedMerchantBranchId;
      document.getElementById("branchExtIdDisplay").style.display = "block"; // Show the IDs section
      console.log("Status: 200", response);
      alert("Branch created successfully!");
    } else {
      const errorData = await response.json();
      console.error("Error Details:", errorData);
      alert("Failed to create branch. Check console for details.");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("An error occurred while creating the branch.");
  }
}

// Function to fetch branch details
async function fetchBranch(merchantExtId, branchExtId) {
  const url = `${API_BASE_URL}/merchants/${merchantExtId}/branches/${branchExtId}`;
  console.log("Fetching branch details from:", url); // Log the URL

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: "Basic " + btoa(ACQUIBASE_USERNAME_PASSWORD),
      },
    });

    console.log("Response status:", response.status); // Log the response status

    if (response.ok) {
      const data = await response.json();
      console.log("Branch details:", data); // Log the response data
      return data;
    } else {
      console.error("Failed to fetch branch details. Status:", response.status);
      return null;
    }
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}

// Function to update branch details
async function updateBranch(merchantExtId, branchExtId, branchData) {
  const url = `${API_BASE_URL}/merchants/${merchantExtId}/branches/${branchExtId}`;
  try {
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + btoa(ACQUIBASE_USERNAME_PASSWORD),
      },
      body: JSON.stringify({
        branch: {
          ...branchData,
          ext_id: branchExtId, // branch_ext_id
          merchant_ext_id: merchantExtId, // merchant_ext_id
          // API insists merchant_branch_id isn't needed...
        },
      }),
    });

    if (response.ok) {
      alert("Branch updated successfully!");
      return true;
    } else {
      const errorData = await response.json();
      console.error("Error Details:", errorData);
      alert("Failed to update branch. Check console for details.");
      return false;
    }
  } catch (error) {
    console.error("Error:", error);
    alert("An error occurred while updating the branch.");
    return false;
  }
}

// Event listener for merchant form
document
  .getElementById("merchantForm")
  ?.addEventListener("submit", function (event) {
    event.preventDefault();
    const merchantData = {
      name: document.getElementById("name").value,
      category_code: document.getElementById("category_code").value,
      address: document.getElementById("address").value,
      city: document.getElementById("city").value,
      country: document.getElementById("country").value.toUpperCase(),
      zip: document.getElementById("zip").value,
      contact_name: document.getElementById("contact_name").value,
      contact_email: document.getElementById("contact_email").value,
      contact_phone: document.getElementById("contact_phone").value,
    };
    createMerchant(merchantData);
  });

// Event listener for branch form
document
  .getElementById("branchForm")
  ?.addEventListener("submit", function (event) {
    event.preventDefault();
    const branchData = {
      name: document.getElementById("branch_name").value,
      address: document.getElementById("branch_address").value, // Address line 1
      city: document.getElementById("branch_city").value,
      country: document.getElementById("branch_country").value,
      zip: document.getElementById("branch_zip").value,
      contact: {
        name: document.getElementById("contact_name").value,
        emails: [document.getElementById("contact_email").value],
        phone: document.getElementById("contact_phone").value,
      },
    };
    const merchantExtId = document.getElementById("merchant_ext_id").value;
    createBranch(merchantExtId, branchData);
  });

// Event listener for fetch merchant form
document
  .getElementById("fetchMerchantForm")
  ?.addEventListener("submit", async function (event) {
    event.preventDefault();
    const merchantExtId = document.getElementById("merchant_ext_id").value;

    if (merchantExtId) {
      const merchantDetails = await fetchMerchant(merchantExtId);

      if (merchantDetails) {
        displayMerchantDetails(merchantDetails);
      } else {
        alert(
          "Failed to fetch merchant details. Please check the external ID and try again."
        );
      }
    } else {
      alert("Please enter a valid Merchant External ID.");
    }
  });

// Event listener for fetch branch form
document
  .getElementById("fetchBranchForm")
  ?.addEventListener("submit", async function (event) {
    event.preventDefault();
    const merchantExtId = document.getElementById("merchant_ext_id").value;
    const branchExtId = document.getElementById("branch_ext_id").value;

    if (merchantExtId && branchExtId) {
      console.log("Fetching branch details for:", merchantExtId, branchExtId); // Log the IDs
      const branchDetails = await fetchBranch(merchantExtId, branchExtId);

      if (branchDetails) {
        displayBranchDetails(branchDetails);
      } else {
        alert(
          "Failed to fetch branch details. Please check the external IDs and try again."
        );
      }
    } else {
      alert("Please enter valid Merchant and Branch External IDs.");
    }
  });

// Function to display merchant details
function displayMerchantDetails(merchantDetails) {
  const merchantData = merchantDetails.data;

  document.getElementById("merchantName").textContent = merchantData.name;
  document.getElementById("merchantState").textContent = merchantData.state;
  document.getElementById(
    "merchantAddress"
  ).textContent = `${merchantData.address.line_1}, ${merchantData.address.city}, ${merchantData.address.country}, ${merchantData.address.zip}`;
  document.getElementById("contactName").textContent =
    merchantData.contact.name;
  document.getElementById("contactEmail").textContent =
    merchantData.contact.emails.join(", ");
  document.getElementById("contactPhone").textContent =
    merchantData.contact.phone;
  document.getElementById("categoryCode").textContent =
    merchantData.category_code;
  document.getElementById("extId").textContent = merchantData.ext_id;
  document.getElementById("billingPeriod").textContent =
    merchantData.billing.period;
  document.getElementById("transactionSettings").textContent = JSON.stringify(
    merchantData.transaction_settings,
    null,
    2
  );

  // Show the merchant details section
  document.getElementById("merchantDetails").style.display = "block";
}

// Function to display branch details
function displayBranchDetails(branchDetails) {
  const branchData = branchDetails.data;

  document.getElementById("branchName").textContent = branchData.name;
  document.getElementById("branchState").textContent = branchData.state;
  document.getElementById(
    "branchAddress"
  ).textContent = `${branchData.address.line_1}, ${branchData.address.city}, ${branchData.address.country}`;
  document.getElementById("contactName").textContent = branchData.contact.name;
  document.getElementById("contactEmail").textContent =
    branchData.contact.emails.join(", ");
  document.getElementById("contactPhone").textContent =
    branchData.contact.phone;
  document.getElementById("merchantExtId").textContent =
    branchData.merchant_ext_id;

  // Show the branch details section
  document.getElementById("branchDetails").style.display = "block";
}

// Event listener for update branch form
document
  .getElementById("updateBranchForm")
  ?.addEventListener("submit", async function (event) {
    event.preventDefault();

    // Collect form data
    const merchantExtId = document.getElementById("merchant_ext_id").value;
    const branchExtId = document.getElementById("branch_ext_id").value;

    const branchData = {
      name: document.getElementById("name").value,
      address: {
        city: document.getElementById("city").value,
        line_1: document.getElementById("line_1").value,
        line_2: document.getElementById("line_2").value,
        zip: document.getElementById("zip").value,
        country: document.getElementById("country").value,
      },
      contact: {
        name: document.getElementById("contact_name").value,
        emails: [document.getElementById("contact_email").value],
        gender: document.getElementById("gender").value,
        phone: document.getElementById("contact_phone").value,
      },
      booking_reference_prefix: document.getElementById(
        "booking_reference_prefix"
      ).value,
      state: document.getElementById("state").value,
      virtual_terminal: JSON.parse(
        document.getElementById("virtual_terminal").value
      ),
    };

    // Call the updateBranch function
    const success = await updateBranch(merchantExtId, branchExtId, branchData);

    if (success) {
      // Show the update status section
      document.getElementById("updateStatus").style.display = "block";
    }
  });
