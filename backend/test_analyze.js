import axios from "axios";

async function run() {
  try {
    console.log("Calling /api/repo/analyze...");
    const res = await axios.post("http://localhost:8000/api/repo/analyze", {
      repoUrl: "https://github.com/vignesh-programmer3269/User-Management-Dashboard"
    });
    console.log("Success!", JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error("Request failed!");
    if (err.response) {
      console.error("Status:", err.response.status);
      console.error("Data:", JSON.stringify(err.response.data, null, 2));
    } else {
      console.error(err);
    }
  }
}

run();
