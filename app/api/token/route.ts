import { AccessToken } from "livekit-server-sdk";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const room = searchParams.get("room");
  const username = searchParams.get("username");

  if (!room || !username) {
    return Response.json(
      {
        error: "Missing room",
      },
      {
        status: 400,
      }
    );
  }

  const token = new AccessToken(
    process.env.LIVEKIT_API_KEY!,
    process.env.LIVEKIT_API_SECRET!,
    {
      identity: username,
    }
  );

  token.addGrant({
    roomJoin: true,
    room,
    canPublish: true,
    canSubscribe: true,
  });

  return Response.json({
    token: await token.toJwt(),
  });
}