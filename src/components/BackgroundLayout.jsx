const BG_IMAGE = "https://media.base44.com/images/public/69d21c4242b48b94ff5afa5f/2455fd508_generated_image.png";

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