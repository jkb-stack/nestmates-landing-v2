export const metadata = {
  title: 'NestMates - Rediscover Love After Kids Leave Home',
  description: 'AI-powered app helping empty nester couples reconnect through local activities and relationship insights.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        {children}
      </body>
    </html>
  )
}
