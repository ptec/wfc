export const GOOGLE_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyGmJixUhR37PobcVK3HgOrrFDTdBO8uht-kKF0v_ptjnUD2QbFLtm8g6xqwNiOidc4/exec"

export async function GET (q: any) {
  const url = `${GOOGLE_APPS_SCRIPT_URL}?q=${encodeURIComponent(JSON.stringify(q))}`;

  return await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    }
  })
  .then(response => response.json())
  .then(response => {
    if (!!response.error)
      throw new Error(response.error);
    return response.content;
  })
  .then(data => {
    console.log("GET"     , url );
    console.log("RESPONSE", data);
    return data;
  })
}

export async function POST(q: any) {
  const url = `${GOOGLE_APPS_SCRIPT_URL}?q=${encodeURIComponent(JSON.stringify(q))}`;

  return await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    }
  })
  .then(response => response.json())
  .then(response => {
    if (!!response.error)
      throw new Error(response.error);
    return response.content;
  })
  .then(data => {
    console.log("POST"    , url );
    console.log("RESPONSE", data);
    return data;
  })
}