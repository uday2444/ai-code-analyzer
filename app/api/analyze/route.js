export async function POST(request) {
  const body = await request.json();
  const code = body.code;

  console.log("recieved code:", code);

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
            content: `You are a senior JavaScript engineer.

            Analyze the following code and provide:
            
            1. Any syntax errors
            2. Runtime problems
            3. Explanation of what the code tries to do
            4. Corrected version of the code
            
            Code:
            \n\n${code}`,
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
