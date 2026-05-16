"use client";

import Footer from "@/app/componets/Footer";
import { useMemo, useState } from "react";

export default function QRPulsePage() {
  const [activeTab, setActiveTab] = useState("url");
  const [url, setUrl] = useState("https://example.com");
  const [email, setEmail] = useState("hello@example.com");
  const [wifiName, setWifiName] = useState("MyWifi");
  const [wifiPassword, setWifiPassword] = useState("12345678");
  const [brandColor, setBrandColor] = useState("#61dbb4");
  const [customColor, setCustomColor] = useState("#61dbb4");
  const [downloadType, setDownloadType] = useState("PNG");

  const qrData = useMemo(() => {
    if (activeTab === "email") {
      return `mailto:${email}`;
    }

    if (activeTab === "wifi") {
      return `WIFI:T:WPA;S:${wifiName};P:${wifiPassword};;`;
    }

    if (activeTab === "vcard") {
      return `BEGIN:VCARD
FN:Ravi Jadav
TEL:+910000000000
EMAIL:ravi@example.com
END:VCARD`;
    }

    return url;
  }, [activeTab, url, email, wifiName, wifiPassword]);

  const ActiveIcon = () => {
    if (activeTab === "email") {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="w-9 h-9 text-white"
        >
          <path d="M4 4h16v16H4z" stroke="none" />
          <path d="M4 6l8 7 8-7" />
        </svg>
      );
    }

    if (activeTab === "wifi") {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="w-9 h-9 text-white"
        >
          <path d="M5 13a10 10 0 0 1 14 0" />
          <path d="M8.5 16.5a5 5 0 0 1 7 0" />
          <path d="M12 20h.01" />
        </svg>
      );
    }

    if (activeTab === "vcard") {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="w-9 h-9 text-white"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      );
    }

    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="w-9 h-9 text-white"
      >
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07L11.8 5" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07L12.2 19" />
      </svg>
    );
  };

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&color=${brandColor.replace(
    "#",
    ""
  )}&data=${encodeURIComponent(qrData)}`;

  const downloadQR = async () => {
    const response = await fetch(qrUrl);
    const blob = await response.blob();

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `qr-code.${downloadType.toLowerCase()}`;
    link.click();
  };

  return (
    <div className="bg-[#0f1512] text-[#dee4df] min-h-screen">
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#1b211e]/40 backdrop-blur-xl">
        <div className="flex justify-between items-center px-6 py-4">
          <div className="flex items-center gap-10">
            <h1 className="text-3xl font-bold text-[#61dbb4]">
              QR.Pulse
            </h1>

            <nav className="hidden md:flex items-center gap-6">
              <button className="text-gray-300 hover:text-[#61dbb4]">
                Dashboard
              </button>
              <button className="text-gray-300 hover:text-[#61dbb4]">
                History
              </button>
              <button className="text-gray-300 hover:text-[#61dbb4]">
                Templates
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <button className="bg-[#12a480] px-4 py-2 rounded-xl text-black font-semibold hover:scale-105 transition-all">
              Upgrade Pro
            </button>

            <div className="w-10 h-10 rounded-full bg-[#252b28] flex items-center justify-center">
              👨
            </div>
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-72px)]">
        <aside className="hidden md:flex w-[300px] border-r border-white/5 bg-[#171d1a]/50 flex-col p-5">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 rounded-xl bg-[#61dbb4]/10 flex items-center justify-center text-[#61dbb4] text-2xl">
              ⚡
            </div>

            <div>
              <h2 className="font-bold">Premium Workspace</h2>
              <p className="text-sm text-gray-400">Enterprise Plan</p>
            </div>
          </div>

          <div className="space-y-2">
            {[
              "Generator",
              "Analytics",
              "Bulk Create",
              "API Keys",
              "Billing",
            ].map((item) => (
              <button
                key={item}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                  item === "Generator"
                    ? "bg-[#12a480]/20 text-[#61dbb4] border border-[#61dbb4]/20"
                    : "hover:bg-[#252b28] text-gray-300"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </aside>

        <main className="flex-1 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 space-y-6">
              <div>
                <h1 className="text-5xl font-bold mb-3">
                  QR Code Generator
                </h1>
                <p className="text-gray-400 text-lg">
                  Create modern high quality QR codes instantly.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-[#171d1a]/50 p-2 rounded-2xl border border-white/5">
                {[
                  { key: "url", label: "URL" },
                  { key: "email", label: "Email" },
                  { key: "vcard", label: "VCard" },
                  { key: "wifi", label: "WiFi" },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`py-4 rounded-xl font-semibold transition-all ${
                      activeTab === tab.key
                        ? "bg-[#12a480] text-black"
                        : "text-gray-300 hover:bg-[#252b28]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="bg-[#1b211e]/50 border border-white/5 rounded-3xl p-6 space-y-5">
                {activeTab === "url" && (
                  <input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full bg-[#090f0d] border border-white/10 rounded-2xl px-5 py-4 outline-none"
                  />
                )}

                {activeTab === "email" && (
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="hello@example.com"
                    className="w-full bg-[#090f0d] border border-white/10 rounded-2xl px-5 py-4 outline-none"
                  />
                )}

                {activeTab === "wifi" && (
                  <div className="space-y-4">
                    <input
                      value={wifiName}
                      onChange={(e) => setWifiName(e.target.value)}
                      placeholder="Wifi Name"
                      className="w-full bg-[#090f0d] border border-white/10 rounded-2xl px-5 py-4 outline-none"
                    />

                    <input
                      value={wifiPassword}
                      onChange={(e) => setWifiPassword(e.target.value)}
                      placeholder="Wifi Password"
                      className="w-full bg-[#090f0d] border border-white/10 rounded-2xl px-5 py-4 outline-none"
                    />
                  </div>
                )}

                {activeTab === "vcard" && (
                  <div className="bg-[#090f0d] rounded-2xl p-5 border border-white/10">
                    <p className="text-gray-300">
                      Default vCard contact will be generated.
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-[#1b211e]/50 border border-white/5 rounded-3xl p-6">
                  <div className="flex justify-between items-center mb-5">
                    <h3 className="font-bold text-lg">Brand Color</h3>
                    <span className="text-sm text-[#61dbb4] font-mono">
                      {brandColor}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap mb-5">
                    {[
                      "#61dbb4",
                      "#00a6e0",
                      "#c0c1ff",
                      "#ffb4ab",
                      "#ffffff",
                      "#ff0000",
                      "#ff9900",
                      "#8b5cf6",
                    ].map((color) => (
                      <button
                        key={color}
                        onClick={() => {
                          setBrandColor(color);
                          setCustomColor(color);
                        }}
                        style={{ backgroundColor: color }}
                        className="w-10 h-10 rounded-full border-4 border-black hover:scale-110 transition-all"
                      />
                    ))}
                  </div>

                  <div className="flex items-center gap-4">
                    <input
                      type="color"
                      value={customColor}
                      onChange={(e) => {
                        setCustomColor(e.target.value);
                        setBrandColor(e.target.value);
                      }}
                      className="w-16 h-16 rounded-2xl bg-transparent border-none cursor-pointer"
                    />

                    <div>
                      <p className="text-sm text-gray-400 mb-1">
                        Custom Color
                      </p>
                      <p className="font-mono text-[#61dbb4]">
                        {brandColor}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-[#1b211e]/50 border border-white/5 rounded-3xl p-6">
                  <h3 className="font-bold text-lg mb-5">Download Type</h3>

                  <div className="grid grid-cols-3 gap-3">
                    {["PNG", "SVG", "PDF"].map((type) => (
                      <button
                        key={type}
                        onClick={() => setDownloadType(type)}
                        className={`py-3 rounded-xl transition-all ${
                          downloadType === type
                            ? "bg-[#12a480] text-black"
                            : "bg-[#252b28]"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="sticky top-24 bg-[#1b211e]/50 border border-white/5 rounded-[32px] p-8 text-center">
                <h2 className="uppercase tracking-[0.3em] text-sm text-gray-400 mb-8">
                  Live Preview
                </h2>

                <div className="bg-white rounded-[32px] p-6 mb-8 inline-block shadow-2xl relative">
                  <img
                    src={qrUrl}
                    alt="QR Preview"
                    className="w-[320px] h-[320px] rounded-2xl"
                  />

                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-24 h-24 rounded-[28px] bg-gradient-to-br from-[#ffffff] to-[#e5e7eb] shadow-[0_20px_60px_rgba(0,0,0,0.35)] flex items-center justify-center border border-white/80 backdrop-blur-xl">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#61dbb4] to-[#00a6e0] flex items-center justify-center shadow-lg">
                        <ActiveIcon />
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={downloadQR}
                  className="w-full py-5 rounded-2xl bg-[#61dbb4] text-black font-bold text-lg hover:scale-[1.02] transition-all"
                >
                  Download High-Res
                </button>

                <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-400">
                  <span>⚡</span>
                  <span>Auto-saved to history</span>
                </div>
              </div>
            </div>
          </div>
        </main>

        <Footer/>
      </div>
    </div>
  );
}
