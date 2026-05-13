const BG_IMAGE = "https://www.caravan.kz/wp-content/uploads/2025/05/6ec4fecc-7e61-4dfe-8c50-288d1c5c2ed8-1024x683.png";

export default function BackgroundLayout({ children, overlayOpacity = "bg-black/60" }) {
  return (
    <div className="fixed inset-0 overflow-auto">
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${BG_IMAGE})` }}
      />
      <div className={`fixed inset-0 ${overlayOpacity}`} />
      <div className="relative z-10 min-h-screen flex flex-col">
        {children}
      </div>
    </div>
  );
}
