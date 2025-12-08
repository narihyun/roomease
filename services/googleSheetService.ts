
const ADDR_SCRIPT = 'https://script.google.com/macros/s/AKfycbzXjSvUCJLXQ8PWJGuHSMH4Z0f-KuWGbvKrSfyVVe2wjZSlM6xHRg6o8oz3bNqsOfOung/exec';

// Helper: Pad numbers with leading zero
function padValue(value: number) {
  return (value < 10) ? "0" + value : value;
}

// Helper: Get formatted timestamp
function getTimeStamp() {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  return `${year}-${padValue(month)}-${padValue(day)} ${padValue(hours)}:${padValue(minutes)}:${padValue(seconds)}`;
}

// Helper: Get Cookie
function getCookieValue(name: string) {
  const value = "; " + document.cookie;
  const parts = value.split("; " + name + "=");
  if (parts.length === 2) {
    return parts.pop()?.split(";").shift();
  }
}

// Helper: Set Cookie
function setCookieValue(name: string, value: string, days: number) {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

// Helper: Get or Generate Unique Visitor ID
function getUVfromCookie() {
  // 6 char random hash
  const hash = Math.random().toString(36).substring(2, 8).toUpperCase();
  const existingHash = getCookieValue("user");
  
  if (!existingHash) {
    setCookieValue("user", hash, 180); // 6 months
    return hash;
  } else {
    return existingHash;
  }
}

// Helper: Fetch IP Address
async function getIpAddress() {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (e) {
    return 'unknown';
  }
}

// Function: Log Visitor
export const logVisitor = async () => {
  const ip = await getIpAddress();
  
  // Mobile detection
  let mobile = 'desktop';
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    mobile = 'mobile';
  }

  // URL Params
  const urlParams = new URLSearchParams(window.location.search);
  const utm = urlParams.get("utm");

  const data = JSON.stringify({
    "id": getUVfromCookie(),
    "landingUrl": window.location.href,
    "ip": ip,
    "referer": document.referrer,
    "time_stamp": getTimeStamp(),
    "utm": utm,
    "device": mobile
  });

  const url = `${ADDR_SCRIPT}?action=insert&table=visitors&data=${encodeURIComponent(data)}`;

  try {
    await fetch(url, { method: 'GET', mode: 'no-cors' });
    console.log("Visitor logged successfully");
  } catch (error) {
    console.error("Error logging visitor", error);
  }
};

// Function: Submit Email Form
export const submitToGoogleSheet = async (email: string, advice: string) => {
  const data = JSON.stringify({
    "id": getUVfromCookie(),
    "email": email,
    "advice": advice,
    "timestamp": getTimeStamp(), // Legacy timestamp field for this table if needed
    "source": "react-web-app"
  });

  const url = `${ADDR_SCRIPT}?action=insert&table=tab_final&data=${encodeURIComponent(data)}`;

  try {
    await fetch(url, {
      method: 'GET',
      mode: 'no-cors', 
    });
    return true;
  } catch (error) {
    console.error("Submission error", error);
    return false;
  }
};
