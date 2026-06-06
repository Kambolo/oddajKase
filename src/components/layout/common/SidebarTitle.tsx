import WalletIcon from "../../icons/WalletIcon";

export default function SideBarTitle() {
  return (
    <div className="flex items-center gap-3 px-5 pt-6 pb-4">
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: 14,
          background: "#6b9e8a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <WalletIcon />
      </div>
      <div>
        <div
          style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontWeight: 700,
            fontSize: 17,
            color: "#2d4a3e",
            letterSpacing: "-0.3px",
            lineHeight: 1.1,
          }}
        >
          OddajKase
        </div>
        <div
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 9.5,
            color: "#8aab9a",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            marginTop: 2,
          }}
        >
          Calm Finance
        </div>
      </div>
    </div>
  );
}
