// Zoom API Integration - Server-to-Server OAuth

interface ZoomTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface ZoomMeetingResponse {
  id: number;
  join_url: string;
  password: string;
  start_url: string;
}

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getZoomAccessToken(): Promise<string> {
  // Check if we have a valid cached token
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  const accountId = process.env.ZOOM_ACCOUNT_ID;
  const clientId = process.env.ZOOM_CLIENT_ID;
  const clientSecret = process.env.ZOOM_CLIENT_SECRET;

  if (!accountId || !clientId || !clientSecret) {
    throw new Error('Zoom credentials not configured');
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await fetch(
    `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${accountId}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error('Zoom token error:', error);
    throw new Error('Failed to get Zoom access token');
  }

  const data: ZoomTokenResponse = await response.json();

  // Cache the token (expires_in is in seconds, subtract 60s for safety)
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };

  return data.access_token;
}

export async function createZoomMeeting(
  topic: string,
  startTime: Date,
  durationMinutes: number = 60
): Promise<{ joinUrl: string; meetingId: number; password: string }> {
  const accessToken = await getZoomAccessToken();

  // Format date for Zoom API (ISO 8601)
  const startTimeISO = startTime.toISOString();

  const response = await fetch('https://api.zoom.us/v2/users/me/meetings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      topic,
      type: 2, // Scheduled meeting
      start_time: startTimeISO,
      duration: durationMinutes,
      timezone: 'Europe/Stockholm',
      settings: {
        join_before_host: true,
        waiting_room: false,
        mute_upon_entry: true,
        auto_recording: 'none',
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Zoom meeting creation error:', error);
    throw new Error('Failed to create Zoom meeting');
  }

  const meeting: ZoomMeetingResponse = await response.json();

  return {
    joinUrl: meeting.join_url,
    meetingId: meeting.id,
    password: meeting.password,
  };
}

