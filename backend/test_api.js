const jwt = require("jsonwebtoken");

async function main() {
  const secret = process.env.JWT_SECRET || "8990c6f1a141822e7134e035c207676f358071fc668fd16099dd0bacf1328a417f0fb3627f77f8084b924d6494796711ce28af5ed3955983d3d6841c82a40ed9";
  // The professional user id we got earlier
  const userId = "6ff70c17-c436-46f2-92fc-e570ae0b8a6a"; 
  
  const token = jwt.sign({ sub: userId }, secret, { expiresIn: '1h' });
  
  console.log("Token:", token);

  try {
    const res = await fetch("http://localhost:3000/api/appointments?page=1&limit=10", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    const data = await res.json();
    console.log("Status:", res.status);
    console.log("Data:", JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Fetch Error:", error);
  }
}

main();
