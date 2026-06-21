import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const API_KEY = "ik_06e656bc56fe047fc1d4b1f6d0657ad0"; // From MCP.JSON
const API_BASE_URL = "https://vrthxj7q.eu-central.insforge.app";
const USER_ID = "981ca0f2-5b4f-4674-80dd-538dd2a7d529";

async function main() {
  console.log("Verifying data for User ID:", USER_ID);
  
  try {
    // 1. Get Profile Data
    console.log("\n--- Profile Data ---");
    const profileSql = `SELECT * FROM public.profiles WHERE id = '${USER_ID}';`;
    const profileResponse = await fetch(`${API_BASE_URL}/api/database/advance/rawsql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY
      },
      body: JSON.stringify({ query: profileSql })
    });

    if (profileResponse.ok) {
      const result = await profileResponse.json();
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.error("Failed to fetch profile:", await profileResponse.text());
    }

    // 2. List Storage Files
    console.log("\n--- Storage Files ---");
    // The bucket is 'resumes'
    // Let's try to list files using GET /api/storage/resumes/list?prefix=resumes/${USER_ID}/
    const storageResponse = await fetch(`${API_BASE_URL}/api/storage/resumes/list?prefix=resumes/${USER_ID}/`, {
      method: 'GET',
      headers: {
        'x-api-key': API_KEY
      }
    });

    if (storageResponse.ok) {
      const files = await storageResponse.json();
      console.log("Files with prefix resumes/${USER_ID}/:", JSON.stringify(files, null, 2));
    } else {
      console.error("Failed to list files with prefix resumes/${USER_ID}/:", await storageResponse.text());
      
      // Try listing without prefix
       const allFilesResponse = await fetch(`${API_BASE_URL}/api/storage/resumes/list`, {
        method: 'GET',
        headers: {
          'x-api-key': API_KEY
        }
      });
      if (allFilesResponse.ok) {
          const files = await allFilesResponse.json();
          console.log("All files in resumes bucket:", JSON.stringify(files, null, 2));
      } else {
           console.error("Failed to list all files in resumes:", await allFilesResponse.text());
      }
    }

  } catch (error) {
    console.error("Error verifying data:", error);
  }
}

main();
