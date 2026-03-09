import AdmZip from "adm-zip";

export async function POST(request) {
  const body = await request.json();
  const repoURL = body.repoURL;

  const parts = repoURL.split("/");

  const owner = parts[3];
  const repo = parts[4];

  let zipURL = `https://codeload.github.com/${owner}/${repo}/zip/refs/heads/main`;

  let response = await fetch(zipURL);

  if (!response.ok) {
    zipURL = `https://codeload.github.com/${owner}/${repo}/zip/refs/heads/master`;
    response = await fetch(zipURL);
  }

  if (!response.ok) {
    return Response.json({
      message: "Repository is too large to analyze.",
    });
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const zip = new AdmZip(buffer);
  const entries = zip.getEntries();

  const limitedEntries = entries.slice(0, 20);

  let combinedCode = "";

  limitedEntries.forEach((entry) => {
    if (
      entry.entryName.endsWith(".js") ||
      entry.entryName.endsWith(".jsx") ||
      entry.entryName.endsWith(".ts") ||
      entry.entryName.endsWith(".tsx")
    ) {
      const content = entry.getData().toString("utf8");

      const trimmedContent = content.slice(0, 1500);

      combinedCode += `\n\nfile:${entry.entryName}\n`;
      combinedCode += trimmedContent;
    }
  });

  const fetchData = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "user",
            content: `You are a senior software architect.

Analyze this GitHub repository and explain:

1. Project purpose
2. Main modules
3. Architecture
4. Important files
5. Possible improvements

Repository files:\n${combinedCode}`,
          },
        ],
      }),
    }
  );

  const resData = await fetchData.json();
  console.log("AI Response:", resData);

  return Response.json({
    message: resData.choices[0].message.content,
  });
}
