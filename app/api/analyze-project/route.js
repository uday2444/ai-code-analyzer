import AdmZip from "adm-zip";

export async function POST(request) {
  const formData = await request.formData();
  const file = formData.get("file");

  const arrayBuffer = await file.arrayBuffer();

  const buffer = Buffer.from(arrayBuffer);

  const zip = new AdmZip(buffer);

  const entries = zip.getEntries();

  let combinedEntries = "";

  entries.forEach((entry) => {
    if (
      entry.entryName.endsWith(".js") ||
      entry.entryName.endsWith(".ts") ||
      entry.entryName.endsWith(".jsx") ||
      entry.entryName.endsWith(".tsx")
    ) {
      combinedEntries += `\n\n file:${entry.entryName}\n`;
      combinedEntries += entry.getData().toString("utf8");
    }
  });

  const response = await fetch(
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

                Analyze this project and explain:
                
                1. Project purpose
                2. Main modules
                3. Architecture
                4. Important files
                5. Possible improvements
                
                Project files:\n\n${combinedEntries}`,
          },
        ],
      }),
    }
  );

  const data = await response.json();

  return Response.json({
    message: data.choices[0].message.content,
  });
}
