<!-- Membership -->
<section id="membership" class="section membership">
  <div class="wrap">
    <h3 class="section-title">📝 Membership</h3>
    <p>
      Register as a member of HRVF and stand with us against oppression and injustice. 
      Membership form will only be available after payment of <strong>₦2,000</strong>.
    </p>

    <!-- Step 1: Registration (Email + Phone before Paystack) -->
    <section id="registerSection" class="form-section">
      <form id="registerForm">
        <label>Email <input type="email" id="regEmail" required></label>
        <label>Phone <input type="tel" id="regPhone" required></label>
        <button type="submit" class="btn">Proceed to Payment</button>
      </form>
    </section>

    <!-- Step 2: Membership Form (hidden until payment success) -->
    <section id="apply" class="form-section" style="display:none; margin-top:20px;">
      <form id="membershipForm" enctype="multipart/form-data">
        <label>Full Name <input type="text" name="fullname" required></label>
        <label>Email <input type="email" name="email" id="memberEmail" readonly></label>
        <label>Phone <input type="tel" name="phone" id="memberPhone" readonly></label>
        <label>Address <input type="text" name="address" required></label>
        <label>Upload Passport <input type="file" name="passport" accept=".jpg,.jpeg,.png" required></label>
        <label class="checkbox">
          <input type="checkbox" name="confirm" required> 
          I confirm that all information provided is correct
        </label>
        <button type="submit" class="btn">Submit Application</button>
        <div id="formMessage" class="form-message"></div>
      </form>
    </section>
  </div>
</section>

<!-- Paystack -->
<script src="https://js.paystack.co/v1/inline.js"></script>
<script>
  // Step 1: Handle registration + payment
  document.getElementById("registerForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const email = document.getElementById("regEmail").value;
    const phone = document.getElementById("regPhone").value;

    let handler = PaystackPop.setup({
      key: "pk_test_xxxxxxxxxxxxxxxxxxxxx", // replace with your Paystack public key
      email: email,
      amount: 200000, // 2000 NGN in kobo
      currency: "NGN",
      ref: "HRVF_" + Math.floor(Math.random() * 1000000000),

      callback: function(response) {
        alert("Payment successful! Ref: " + response.reference);

        // Autofill membership form with email & phone
        document.getElementById("memberEmail").value = email;
        document.getElementById("memberPhone").value = phone;

        // Hide registration form, show membership form
        document.getElementById("registerSection").style.display = "none";
        document.getElementById("apply").style.display = "block";
      },

      onClose: function() {
        alert("Payment window closed.");
      }
    });

    handler.openIframe();
  });

  // Step 2: Handle membership form submission
  document.getElementById("membershipForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const formMessage = document.getElementById("formMessage");
    formMessage.textContent = "Submitting application...";

    // Here you would normally send the form data to your backend
    setTimeout(() => {
      formMessage.textContent = "✅ Application submitted successfully!";
    }, 1500);
  });
</script>
