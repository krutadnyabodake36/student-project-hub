export default function Test() {
  return (
    <div style={{ padding: '20px', textAlign: 'center', backgroundColor: '#f0f4ff', minHeight: '100vh' }}>
      <h1 style={{ color: '#667eea', fontSize: '32px', marginBottom: '20px' }}>Test Page</h1>
      <p style={{ color: '#333', fontSize: '18px', marginBottom: '20px' }}>App is rendering correctly!</p>
      <p style={{ color: '#666', marginBottom: '20px' }}>If you see this, the routing and components are working.</p>
      <a href="/login" style={{ color: '#667eea', textDecoration: 'none', fontSize: '16px', fontWeight: 'bold' }}>
        Go to Login
      </a>
    </div>
  );
}
