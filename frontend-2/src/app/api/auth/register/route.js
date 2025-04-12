export async function POST(req) {
    const body = await req.json();
    // handle user registration logic
    return new Response(JSON.stringify({ message: 'User registered!' }), {
      status: 200,
    });
  }