export async function POST(request) {
  const formData = await request.formData();
  const file = formData.get("file");

  const fileContent = await file.text();

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
            content: `Analyze this JavaScript file and explain the code:\n${fileContent}`,
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
