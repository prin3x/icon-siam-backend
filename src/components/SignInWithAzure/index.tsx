import Link from 'next/link'
import React from 'react'

export const CustomLoginButton: React.FC = () => (
  <div style={{ marginTop: 24, textAlign: 'center' }}>
    <Link
      href="/api/auth/signin/azure-ad?callbackUrl=%2Fapi%2Fauth%2Fbridge"
      style={{
        display: 'inline-block',
        padding: '10px 24px',
        background: '#2F2F2F',
        color: '#fff',
        borderRadius: 4,
        textDecoration: 'none',
        fontWeight: 600,
        fontSize: 16,
      }}
    >
      Sign in with Microsoft
    </Link>
  </div>
)

export default CustomLoginButton
