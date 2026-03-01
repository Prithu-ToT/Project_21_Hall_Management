// <Header title = "MyTitle" />

export default function Header(props) {
  return (
    <div className="text-center mb-5">
      <div style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "10px",
        marginBottom: "6px"
      }}>
        {/* Simple building icon */}
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" style={{ color: "var(--navy)" }}>
          <rect x="3" y="10" width="18" height="11" rx="1" stroke="currentColor" strokeWidth="1.8" fill="none"/>
          <path d="M9 21V15h6v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          <path d="M3 10l9-7 9 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <h1 style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: "1.75rem",
          fontWeight: 700,
          color: "var(--navy)",
          letterSpacing: "-0.02em",
          margin: 0,
        }}>
          {props.title}
        </h1>
      </div>
      <div style={{
        width: "40px",
        height: "3px",
        background: "var(--accent)",
        borderRadius: "2px",
        margin: "8px auto 0",
      }} />
    </div>
  );
}
