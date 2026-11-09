export interface CategoryItem {
  id: string;
  name: string;
  emoji: string;
  subcategories: string[];
}

export const EXPENSE_CATEGORIES: CategoryItem[] = [
  {
    id: "food",
    name: "Makanan & Minuman",
    emoji: "🍔",
    subcategories: ["Makan Siang/Malam", "Kopi & Nongkrong", "Restoran/Cafe", "Cemilan & Jajan", "Bahan Makanan/Pasar"],
  },
  {
    id: "transport",
    name: "Transportasi",
    emoji: "🚗",
    subcategories: ["Bensin / BBM", "Ojek Online (Gojek/Grab)", "Tol & Parkir", "Transportasi Umum (KRL/MRT)", "Servis & Cuci Kendaraan"],
  },
  {
    id: "groceries",
    name: "Belanja & Kebutuhan Rumah",
    emoji: "🛒",
    subcategories: ["Supermarket / Minimarket", "Pakaian & Sepatu", "Elektronik & Gadget", "Perabotan Rumah", "Perawatan Tubuh"],
  },
  {
    id: "bills",
    name: "Tagihan & Utilitas",
    emoji: "⚡",
    subcategories: ["Listrik PLN", "Internet / Wifi Rumah", "Pulsa & Paket Data", "Air PDAM", "Langganan Streaming (Netflix/Spotify)"],
  },
  {
    id: "entertainment",
    name: "Hiburan & Hobi",
    emoji: "🎬",
    subcategories: ["Bioskop & Film", "Gaming & Top-up Game", "Liburan & Tiket Wisata", "Konser / Acara", "Olahraga & Gym"],
  },
  {
    id: "health",
    name: "Kesehatan & Medis",
    emoji: "💊",
    subcategories: ["Obat & Vitamin", "Konsultasi Dokter / RS", "Asuransi Kesehatan", "Pemeriksaan Lab"],
  },
  {
    id: "social",
    name: "Sosial & Keluarga",
    emoji: "🎁",
    subcategories: ["Keluarga & Orang Tua", "Sedekah & Zakat", "Hadiah / Kado Teman", "Kondangan / Angpao"],
  },
  {
    id: "invest_transfer",
    name: "Investasi & Tabungan",
    emoji: "📈",
    subcategories: ["Beli Saham", "Beli Kripto", "Tabungan Emas", "Top up Reksadana", "Setoran Deposito"],
  },
];

export const INCOME_CATEGORIES = [
  { id: "salary", name: "Gaji Pokok", emoji: "💼" },
  { id: "thr_bonus", name: "Bonus & THR", emoji: "🎉" },
  { id: "freelance", name: "Freelance / Side Project", emoji: "💻" },
  { id: "investment_return", name: "Dividen & Bunga Investasi", emoji: "💰" },
  { id: "reimbursement", name: "Reimbursement Kantor", emoji: "🧾" },
  { id: "gift", name: "Hadiah / Pemberian", emoji: "🎁" },
  { id: "other", name: "Pendapatan Lain-lain", emoji: "✨" },
];
