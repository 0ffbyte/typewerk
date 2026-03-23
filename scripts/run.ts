import crypto from "crypto";
const USER_ID = "12deaf45-7e0a-41b3-8d82-35c6c4442c85";

// General word struct
type Entry = {
  _id: string;
  word: string;
  meaning: string;
  example: string;
};

// Number of POST requests to send (100k)
const n = 100000;
const randomWords = [
  "zaza",
  "foo",
  "bar",
  "baz",
  "lorem",
  "ipsum",
  "alpha",
  "bravo",
  "charlie kirk",
  "leon kennedy",
  "melon mask",
  "salah ougrout aka dead man",
  "delta",
  "echo",
];

// Utility functions
function randomWord() {
  return randomWords[Math.floor(Math.random() * randomWords.length)];
}

function generateId() {
  // unique id using timestamp and random string
  return Date.now() + "-" + crypto.randomBytes(6).toString("base64url");
}

// Generates random word entries
function generateEntries(n: number): Entry[] {
  const entries: Entry[] = [];
  for (let i = 0; i < n; i++) {
    const word = randomWord();
    entries.push({
      _id: generateId(),
      word,
      meaning: "fuck if i know",
      example: "giant enemy spider",
    });
  }
  return entries;
}

// Main Call
async function BULK_INSERT() {
  const body = JSON.stringify({
    user_id: USER_ID,
    vocabulary: {
      general: generateEntries(n),
      listening: [],
      reading: [],
      writing: [],
      speaking: [],
    },
    mistakes: {
      general: [],
      listening: [],
      reading: [],
      writing: [],
      speaking: [],
    },
    notes: {
      general: [],
      listening: [],
      reading: [],
      writing: [],
      speaking: [],
    },
    updated_at: new Date().toISOString(),
  });

  try {
    await fetch(
      "https://fjekxmtjfimgbdlmljfz.supabase.co/rest/v1/notebook?on_conflict=user_id",
      {
        headers: {
          accept: "*/*",
          "accept-language": "en-US,en;q=0.9",
          apikey:
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqZWt4bXRqZmltZ2JkbG1samZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4MTQ4MTMsImV4cCI6MjA4ODM5MDgxM30.aBWGpqNK7EqIzzCP4DUZJ_4SXPSc-WvNhUUTFi2Zrco",
          authorization:
            "Bearer eyJhbGciOiJFUzI1NiIsImtpZCI6IjhiMDZjOWUzLTk4NzMtNDZlNy1iNzEwLTU2NzhkMWJjZTljOSIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2ZqZWt4bXRqZmltZ2JkbG1samZ6LnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiIxMmRlYWY0NS03ZTBhLTQxYjMtOGQ4Mi0zNWM2YzQ0NDJjODUiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzc0MjY4NzA1LCJpYXQiOjE3NzQyNjUxMDUsImVtYWlsIjoiaGRpc2xhbTQyQGdtYWlsLmNvbSIsInBob25lIjoiIiwiYXBwX21ldGFkYXRhIjp7InByb3ZpZGVyIjoiZ2l0aHViIiwicHJvdmlkZXJzIjpbImdpdGh1YiJdfSwidXNlcl9tZXRhZGF0YSI6eyJhdmF0YXJfdXJsIjoiaHR0cHM6Ly9hdmF0YXJzLmdpdGh1YnVzZXJjb250ZW50LmNvbS91LzI4MjY4NzQ5P3Y9NCIsImVtYWlsIjoiaGRpc2xhbTQyQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJmdWxsX25hbWUiOiJTYW0iLCJpc3MiOiJodHRwczovL2FwaS5naXRodWIuY29tIiwibmFtZSI6IlNhbSIsInBob25lX3ZlcmlmaWVkIjpmYWxzZSwicHJlZmVycmVkX3VzZXJuYW1lIjoiMGZmYnl0ZSIsInByb3ZpZGVyX2lkIjoiMjgyNjg3NDkiLCJzdWIiOiIyODI2ODc0OSIsInVzZXJfbmFtZSI6IjBmZmJ5dGUifSwicm9sZSI6ImF1dGhlbnRpY2F0ZWQiLCJhYWwiOiJhYWwxIiwiYW1yIjpbeyJtZXRob2QiOiJvYXV0aCIsInRpbWVzdGFtcCI6MTc3NDE3NjIxMX1dLCJzZXNzaW9uX2lkIjoiMWRiZjdkZGItNWY0Yi00NDFiLThiN2EtMDc3Y2UwMDYzNjI2IiwiaXNfYW5vbnltb3VzIjpmYWxzZX0.M4pP9582dnFTIB9fThUmvMKDsRg667pav2WEb1tqWpUmEGF5vtP0jw7q4ykAjMXksmuSl2unznMVBQpaPMfbqg",
          "content-profile": "public",
          "content-type": "application/json",
          prefer: "resolution=merge-duplicates",
          priority: "u=1, i",
          "sec-ch-ua":
            '"Chromium";v="146", "Not-A.Brand";v="24", "Google Chrome";v="146"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"Windows"',
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "cross-site",
          "x-client-info": "supabase-js-web/2.98.0",
          Referer: "https://ielts-prep-ctscf.vercel.app/",
        },
        body,
        method: "POST",
      }
    );
    console.log("Bulk insert successful.", n, "Entries sent.");
  } catch (error) {
    console.error("Bulk insert failed:", error);
  }
}

BULK_INSERT();
