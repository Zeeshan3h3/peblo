const NoteSkeleton = () => {
  return (
    <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9' }}>
      <style>
        {`
          @keyframes skeleton-pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.4; }
          }
        `}
      </style>
      <div style={{ animation: 'skeleton-pulse 1.5s ease-in-out infinite' }}>
        <div style={{ height: '14px', width: '70%', background: '#e2e8f0', borderRadius: '4px', marginBottom: '8px' }}></div>
        <div style={{ height: '12px', width: '90%', background: '#f1f5f9', borderRadius: '4px', marginBottom: '4px' }}></div>
        <div style={{ height: '12px', width: '60%', background: '#f1f5f9', borderRadius: '4px', marginBottom: '8px' }}></div>
        <div style={{ height: '10px', width: '40%', background: '#f1f5f9', borderRadius: '4px' }}></div>
      </div>
    </div>
  );
};

export default NoteSkeleton;
