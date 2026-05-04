import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  ShieldCheck,
  Map as MapIcon,
  ShoppingBag,
  Store,
} from "lucide-react";
import { motion } from "motion/react";
import { useAuth } from "../context/AuthContext";
import { Logo } from "../components/Logo";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";

// Fix Leaflet marker icon issue
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIconRetina from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIconRetina,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

const LocationPicker = ({
  position,
  setPosition,
  setAddress,
}: {
  position: [number, number];
  setPosition: (pos: [number, number]) => void;
  setAddress: (addr: string) => void;
}) => {
  useMapEvents({
    async click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=ar`,
        );
        const data = await response.json();
        if (data.display_name) {
          setAddress(data.display_name);
        }
      } catch (error) {
        console.error("Error reverse geocoding:", error);
      }
    },
  });

  return <Marker position={position} />;
};

import { isEgyptianPhone, cn } from "../lib/utils";

export const AuthPage = ({ type }: { type: "login" | "signup" }) => {
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    password: "",
    phone: "",
    role: "buyer",
    location: {
      address: "",
      lat: 0,
      lng: 0,
    },
  });

  const [showMap, setShowMap] = useState(false);
  const [position, setPosition] = useState<[number, number]>([
    24.7136, 46.6753,
  ]);

  const setAddress = (addr: string) => {
    setFormData((prev) => ({
      ...prev,
      location: { ...prev.location, address: addr },
    }));
  };

  const setMapPosition = (pos: [number, number]) => {
    setPosition(pos);
    setFormData((prev) => ({
      ...prev,
      location: { ...prev.location, lat: pos[0], lng: pos[1] },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (type === "login") {
        if (!isEgyptianPhone(formData.phone)) {
          setError("يرجى إدخال رقم هاتف مصري صحيح (مثال: 01012345678)");
          setLoading(false);
          return;
        }
        await login({ phone: formData.phone, password: formData.password });
      } else {
        if (!isEgyptianPhone(formData.phone)) {
          setError("يرجى إدخال رقم هاتف مصري صحيح (مثال: 01012345678)");
          setLoading(false);
          return;
        }
        await signup(formData);
      }
      navigate("/");
    } catch (err: any) {
      setError(
        err.response?.data?.message || "حدث خطأ ما، يرجى المحاولة مرة أخرى",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 bg-slate-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-slate-200 border border-slate-100"
      >
        <div className="text-center mb-10">
          <Logo showText={true} className="mx-auto mb-6 scale-125" />
          <h1 className="text-3xl font-black text-slate-900 mb-2">
            {type === "login" ? "مرحباً بعودتك" : "إنشاء حساب جديد"}
          </h1>
          <p className="text-secondary text-sm">
            {type === "login"
              ? "سجل دخولك للوصول إلى حسابك"
              : "انضم إلينا وابدأ التسوق اليوم"}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-2xl border border-red-100 text-center font-bold">
            {error}
          </div>
        )}

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {type === "signup" && (
            <>
              <div className="relative">
                <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary" />
                <input
                  type="text"
                  placeholder="الاسم الكامل"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full bg-slate-50 border-none rounded-2xl pr-12 pl-4 py-4 text-sm focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="relative">
                <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary" />
                <input
                  type="text"
                  placeholder="العنوان"
                  required
                  value={formData.location?.address || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      location: {
                        ...formData.location,
                        address: e.target.value,
                      },
                    })
                  }
                  className="w-full bg-slate-50 border-none rounded-2xl pr-12 pl-4 py-4 text-sm focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setShowMap(!showMap)}
                  className="text-primary hover:underline flex items-center gap-1 text-xs font-bold px-2"
                >
                  <MapIcon className="w-3 h-3" />
                  {showMap ? "إخفاء الخريطة" : "تحديد الموقع على الخريطة"}
                </button>

                {showMap && (
                  <div className="h-48 w-full rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
                    <MapContainer
                      center={position}
                      zoom={13}
                      style={{ height: "100%", width: "100%" }}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      />
                      <LocationPicker
                        position={position}
                        setPosition={setMapPosition}
                        setAddress={setAddress}
                      />
                    </MapContainer>
                  </div>
                )}
              </div>
              <div className="px-1 mb-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block mb-2">
                  نوع الحساب
                </label>
                <div className="grid grid-cols-2 gap-3 mb-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: "buyer" })}
                    className={cn(
                      "flex flex-col items-center justify-center p-4 rounded-3xl border-2 transition-all gap-2 group",
                      formData.role === "buyer"
                        ? "border-primary bg-primary/5 text-primary shadow-lg shadow-primary/10"
                        : "border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200",
                    )}
                  >
                    <div
                      className={cn(
                        "p-3 rounded-2xl transition-colors",
                        formData.role === "buyer"
                          ? "bg-primary text-white"
                          : "bg-white text-slate-400 group-hover:bg-slate-100",
                      )}
                    >
                      <ShoppingBag className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-black">مشتري</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: "seller" })}
                    className={cn(
                      "flex flex-col items-center justify-center p-4 rounded-3xl border-2 transition-all gap-2 group",
                      formData.role === "seller"
                        ? "border-primary bg-primary/5 text-primary shadow-lg shadow-primary/10"
                        : "border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200",
                    )}
                  >
                    <div
                      className={cn(
                        "p-3 rounded-2xl transition-colors",
                        formData.role === "seller"
                          ? "bg-primary text-white"
                          : "bg-white text-slate-400 group-hover:bg-slate-100",
                      )}
                    >
                      <Store className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-black">بائع</span>
                  </button>
                </div>
              </div>
            </>
          )}

          <div className="relative">
            <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary" />
            <input
              type="tel"
              placeholder="رقم الهاتف"
              required
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              dir="ltr"
              className="w-full bg-slate-50 border-none rounded-2xl pr-12 pl-4 py-4 text-sm focus:ring-2 focus:ring-primary/20 text-right"
            />
          </div>

          <div className="relative">
            <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary" />
            <input
              type="password"
              placeholder="كلمة المرور"
              required
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full bg-slate-50 border-none rounded-2xl pr-12 pl-4 py-4 text-sm focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {type === "login" && (
            <div className="text-left">
              <Link
                to="#"
                className="text-xs font-bold text-primary hover:underline"
              >
                نسيت كلمة المرور؟
              </Link>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-white py-4 rounded-2xl font-bold hover:bg-blue-600 transition-all shadow-lg shadow-primary/20 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? "جاري التحميل..."
              : type === "login"
                ? "تسجيل الدخول"
                : "إنشاء الحساب"}
          </button>
        </form>

        <div className="text-center mt-10 text-sm">
          <span className="text-secondary">
            {type === "login" ? "ليس لديك حساب؟" : "لديك حساب بالفعل؟"}
          </span>{" "}
          <Link
            to={type === "login" ? "/signup" : "/login"}
            className="text-primary font-bold hover:underline"
          >
            {type === "login" ? "سجل الآن" : "سجل دخولك"}
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
