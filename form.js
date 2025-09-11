document.addEventListener("DOMContentLoaded", function () {
  const registerForm = document.getElementById("registerForm");
  const membershipForm = document.getElementById("membershipForm");
  const formMessage = document.getElementById("formMessage");

  let regEmail = "";
  let regPhone = "";

  // Step 1: Registration + Payment
  registerForm.addEventListener("submit", function (e) {
    e.preventDefault();

    regEmail = document.getElementById("regEmail").value;
    regPhone = document.getElementById("regPhone").value;

    const amount = 2000 * 100; // ₦2000

    const handler = PaystackPop.setup({
      key: "pk_test_xxxxxxxxxxxxx", // replace with your public key
      email: regEmail,
      amount: amount,
      currency: "NGN",
      callback: function (response) {
        // Payment successful → show form
        document.getElementById("registerSection").style.display = "none";
        document.getElementById("apply").style.display = "block";

        // Auto-fill email + phone
        document.getElementById("formEmail").value = regEmail;
        document.getElementById("formPhone").value = regPhone;

        alert("Payment successful! You can now complete your membership form.");
      },
      onClose: function () {
        alert("Payment cancelled.");
      }
    });

    handler.openIframe();
  });

  // Step 3: Handle Membership Form Submission
  membershipForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const formData = new FormData(membershipForm);

    formMessage.textContent = "Submitting...";
    formMessage.style.color = "blue";

    fetch("/.netlify/functions/sendEmail", {
      method: "POST",
      body: formData,
    })
      .then(async (res) => {
        let data;
        try { data = await res.json(); } catch { throw new Error("Server response not JSON"); }
        if (data.success) {
          formMessage.style.color = "green";
          formMessage.textContent = "Application submitted successfully! Check your email.";
          membershipForm.reset();
        } else {
          throw new Error(data.error || "Submission failed.");
        }
      })
      .catch(err => {
        formMessage.style.color = "red";
        formMessage.textContent = "Error submitting form: " + err.message;
      });
  });
});
