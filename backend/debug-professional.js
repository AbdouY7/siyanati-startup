async function testProfessionalRegistration() {
  try {
    const response = await fetch(
      "http://localhost:3000/api/auth/register/professional",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "professional@example.com",
          password: "password123",
          phone: "1234567890",
          specialty_type: "mechanic",
          experience_years: 5,
          wilaya: "Algiers",
          location_address: "123 Main St",
          shop_images: ["http://example.com/image1.jpg"],
          documents: ["http://example.com/doc1.pdf"],
          bio: "Experienced mechanic",
          hourly_rate_dzd: 1000,
        }),
      },
    );

    const data = await response.json();
    console.log("Status:", response.status);
    console.log("Full response:", JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error:", error.message);
  }
}

testProfessionalRegistration();
