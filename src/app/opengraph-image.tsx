import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Path To Rehab - Find Addiction & Mental Health Treatment Centers';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0d9488 100%)',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Logo/Icon */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 100,
            height: 100,
            background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
            borderRadius: 20,
            marginBottom: 32,
          }}
        >
          <svg
            width="60"
            height="60"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </div>

        {/* Site Name */}
        <h1
          style={{
            fontSize: 72,
            fontWeight: 700,
            color: 'white',
            margin: 0,
            marginBottom: 16,
            letterSpacing: '-0.02em',
          }}
        >
          Path To Rehab
        </h1>

        {/* Tagline */}
        <p
          style={{
            fontSize: 28,
            color: '#94a3b8',
            margin: 0,
            marginBottom: 48,
            textAlign: 'center',
            maxWidth: 800,
          }}
        >
          Find Addiction & Mental Health Treatment Centers Near You
        </p>

        {/* Stats */}
        <div
          style={{
            display: 'flex',
            gap: 64,
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <span
              style={{
                fontSize: 48,
                fontWeight: 700,
                color: '#14b8a6',
              }}
            >
              98,000+
            </span>
            <span
              style={{
                fontSize: 18,
                color: '#94a3b8',
              }}
            >
              Treatment Facilities
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <span
              style={{
                fontSize: 48,
                fontWeight: 700,
                color: '#a78bfa',
              }}
            >
              50+
            </span>
            <span
              style={{
                fontSize: 18,
                color: '#94a3b8',
              }}
            >
              States Covered
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <span
              style={{
                fontSize: 48,
                fontWeight: 700,
                color: '#fbbf24',
              }}
            >
              Free
            </span>
            <span
              style={{
                fontSize: 18,
                color: '#94a3b8',
              }}
            >
              SAMHSA Data
            </span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
