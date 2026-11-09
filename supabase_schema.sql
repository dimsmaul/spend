-- ==============================================================================
-- BUDGGT / SPEND - SUPABASE DATABASE SCHEMA
-- Compatible with PostgreSQL 15+ / Supabase
-- ==============================================================================

-- 1. PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL DEFAULT 'User Budggt',
    email TEXT,
    phone TEXT,
    currency TEXT NOT NULL DEFAULT 'IDR',
    language TEXT NOT NULL DEFAULT 'ID',
    use_decimals BOOLEAN NOT NULL DEFAULT false,
    pin_enabled BOOLEAN NOT NULL DEFAULT false,
    pin_hash TEXT,
    budget_config JSONB DEFAULT '{}'::jsonb,
    theme TEXT DEFAULT 'zinc',
    dark_mode BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. WALLETS (Dompet / Rekening / E-Wallet / Cash)
CREATE TABLE IF NOT EXISTS public.wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'BANK', -- 'BANK' | 'E_WALLET' | 'CASH' | 'INVESTMENT'
    balance NUMERIC(15, 2) NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'IDR',
    icon TEXT,
    brand_code TEXT,
    position INTEGER DEFAULT 0,
    is_archived BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. TRANSACTIONS (Pemasukan, Pengeluaran, Transfer)
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    wallet_id UUID REFERENCES public.wallets(id) ON DELETE SET NULL,
    to_wallet_id UUID REFERENCES public.wallets(id) ON DELETE SET NULL,
    type TEXT NOT NULL DEFAULT 'EXPENSE', -- 'INCOME' | 'EXPENSE' | 'TRANSFER'
    amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    category TEXT NOT NULL DEFAULT 'Lainnya',
    description TEXT NOT NULL DEFAULT '',
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    receipt_url TEXT,
    notes TEXT,
    admin_fee NUMERIC(15, 2) DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. BUDGETS (Target Anggaran Bulanan per Kategori)
CREATE TABLE IF NOT EXISTS public.budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    target_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    spent_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    period TEXT NOT NULL, -- e.g. '2026-11'
    color TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. INVESTMENT HOLDINGS (Portofolio Saham, Crypto, Emas, Reksadana)
CREATE TABLE IF NOT EXISTS public.investment_holdings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    symbol TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'STOCK', -- 'STOCK' | 'CRYPTO' | 'GOLD' | 'MUTUAL_FUND' | 'DEPOSITO'
    units NUMERIC(18, 6) NOT NULL DEFAULT 0,
    avg_buy_price NUMERIC(15, 2) NOT NULL DEFAULT 0,
    current_price NUMERIC(15, 2) NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'IDR',
    last_synced_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. DEBTS (Utang & Piutang)
CREATE TABLE IF NOT EXISTS public.debts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL DEFAULT 'PAYABLE', -- 'PAYABLE' (Utang Saya) | 'RECEIVABLE' (Piutang Teman)
    person_name TEXT NOT NULL,
    amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    remaining_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    due_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'UNPAID', -- 'UNPAID' | 'PARTIALLY_PAID' | 'PAID'
    wallet_id UUID REFERENCES public.wallets(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. DEBT PAYMENTS (Histori Cicilan / Pelunasan Utang)
CREATE TABLE IF NOT EXISTS public.debt_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    debt_id UUID NOT NULL REFERENCES public.debts(id) ON DELETE CASCADE,
    wallet_id UUID REFERENCES public.wallets(id) ON DELETE SET NULL,
    amount NUMERIC(15, 2) NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. GOALS (Target Tabungan / Celengan Impian)
CREATE TABLE IF NOT EXISTS public.goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    target_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    current_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    deadline DATE,
    wallet_id UUID REFERENCES public.wallets(id) ON DELETE SET NULL,
    icon TEXT,
    is_emergency_fund BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. GOAL TRANSACTIONS (Riwayat Setoran ke Goals)
CREATE TABLE IF NOT EXISTS public.goal_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
    transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL,
    amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    direction TEXT NOT NULL DEFAULT 'DEPOSIT',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 10. RECURRING RULES (Langganan & Tagihan Berulang)
CREATE TABLE IF NOT EXISTS public.recurring_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    type TEXT NOT NULL DEFAULT 'EXPENSE',
    interval TEXT NOT NULL DEFAULT 'MONTHLY', -- 'WEEKLY' | 'MONTHLY' | 'YEARLY'
    next_due_date DATE NOT NULL,
    wallet_id UUID REFERENCES public.wallets(id) ON DELETE SET NULL,
    category TEXT NOT NULL DEFAULT 'Tagihan',
    is_paused BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 11. TRANSACTION INBOX (Staging Transaksi Scan Struk / CSV Bank Importer)
CREATE TABLE IF NOT EXISTS public.transaction_inbox (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    source TEXT NOT NULL DEFAULT 'RECEIPT', -- 'RECEIPT' | 'BANK_CSV' | 'RECURRING' | 'MANUAL'
    description TEXT NOT NULL,
    amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    category TEXT NOT NULL DEFAULT 'Lainnya',
    wallet_id UUID REFERENCES public.wallets(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'PENDING', -- 'PENDING' | 'APPROVED' | 'DISCARDED'
    confidence_score NUMERIC(5, 2),
    raw_data JSONB,
    posted_at TIMESTAMPTZ,
    discarded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 12. AI ADVISOR SESSIONS & MESSAGES
CREATE TABLE IF NOT EXISTS public.ai_advisor_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT DEFAULT 'Konsultasi Keuangan',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.ai_advisor_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.ai_advisor_sessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'user', -- 'user' | 'model'
    text TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 13. FINANCIAL HEALTH SNAPSHOTS
CREATE TABLE IF NOT EXISTS public.financial_health_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    overall_score INTEGER NOT NULL DEFAULT 0,
    savings_rate_score INTEGER DEFAULT 0,
    debt_ratio_score INTEGER DEFAULT 0,
    emergency_fund_score INTEGER DEFAULT 0,
    recorded_at DATE NOT NULL DEFAULT CURRENT_DATE
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Enables both authenticated users and public access (for personal/guest use)
-- ==============================================================================

DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
          AND table_name IN (
            'profiles', 'wallets', 'transactions', 'budgets', 'investment_holdings',
            'debts', 'debt_payments', 'goals', 'goal_transactions', 'recurring_rules',
            'transaction_inbox', 'ai_advisor_sessions', 'ai_advisor_messages',
            'financial_health_snapshots'
          )
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);
        EXECUTE format('DROP POLICY IF EXISTS "Public access for personal dev" ON public.%I;', t);
        EXECUTE format('CREATE POLICY "Public access for personal dev" ON public.%I FOR ALL USING (true) WITH CHECK (true);', t);
    END LOOP;
END $$;

-- ==============================================================================
-- INITIAL SEED DATA (Default Wallets & Categories for immediate use)
-- ==============================================================================

INSERT INTO public.profiles (id, name, email, currency)
VALUES ('00000000-0000-0000-0000-000000000001', 'Dimas Maulana', 'user@budggt.local', 'IDR')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.wallets (id, user_id, name, type, balance, icon)
VALUES 
    ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'BCA', 'BANK', 14500000, 'Landmark'),
    ('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000001', 'Mandiri', 'BANK', 8250000, 'Landmark'),
    ('33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000001', 'GoPay', 'E_WALLET', 750000, 'Smartphone'),
    ('44444444-4444-4444-4444-444444444444', '00000000-0000-0000-0000-000000000001', 'Tunai / Dompet', 'CASH', 500000, 'Banknote')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.budgets (id, user_id, category, target_amount, spent_amount, period)
VALUES
    (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Kuliner', 2500000, 1650000, to_char(CURRENT_DATE, 'YYYY-MM')),
    (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Belanja', 1500000, 950000, to_char(CURRENT_DATE, 'YYYY-MM')),
    (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Transport', 1000000, 720000, to_char(CURRENT_DATE, 'YYYY-MM')),
    (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Tagihan', 1200000, 1200000, to_char(CURRENT_DATE, 'YYYY-MM')),
    (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Investasi', 3000000, 3000000, to_char(CURRENT_DATE, 'YYYY-MM'))
ON CONFLICT DO NOTHING;

INSERT INTO public.investment_holdings (id, user_id, symbol, name, type, units, avg_buy_price, current_price)
VALUES
    (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'BBCA', 'Bank Central Asia', 'STOCK', 15, 9600, 10250),
    (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'BBRI', 'Bank Rakyat Indonesia', 'STOCK', 20, 4800, 4650),
    (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'BTC', 'Bitcoin', 'CRYPTO', 0.015, 980000000, 1150000000),
    (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'ANTAM', 'Emas Antam', 'GOLD', 10, 1250000, 1420000)
ON CONFLICT DO NOTHING;

INSERT INTO public.debts (id, user_id, type, person_name, amount, remaining_amount, due_date, status, wallet_id, notes)
VALUES
    (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'RECEIVABLE', 'Budi Santoso', 500000, 500000, CURRENT_DATE + interval '7 days', 'UNPAID', '11111111-1111-1111-1111-111111111111', 'Pinjam makan bareng'),
    (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'PAYABLE', 'Cicilan Laptop', 4500000, 1500000, CURRENT_DATE + interval '14 days', 'PARTIALLY_PAID', '11111111-1111-1111-1111-111111111111', 'Sisa 1 bulan terakhir')
ON CONFLICT DO NOTHING;

INSERT INTO public.goals (id, user_id, name, target_amount, current_amount, deadline, is_emergency_fund)
VALUES
    (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Dana Darurat 6 Bulan', 30000000, 18500000, CURRENT_DATE + interval '180 days', true),
    (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Liburan Akhir Tahun', 10000000, 4200000, CURRENT_DATE + interval '60 days', false)
ON CONFLICT DO NOTHING;

INSERT INTO public.recurring_rules (id, user_id, name, amount, type, interval, next_due_date, category)
VALUES
    (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Internet IndiHome / Biznet', 450000, 'EXPENSE', 'MONTHLY', CURRENT_DATE + interval '5 days', 'Tagihan'),
    (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Netflix Premium', 186000, 'EXPENSE', 'MONTHLY', CURRENT_DATE + interval '12 days', 'Tagihan'),
    (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Spotify Family', 86000, 'EXPENSE', 'MONTHLY', CURRENT_DATE + interval '20 days', 'Tagihan')
ON CONFLICT DO NOTHING;

-- ==============================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER FOR SUPABASE AUTH
-- Automatically creates a profile & starter wallets whenever a user signs up
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name, currency)
    VALUES (
        new.id,
        new.email,
        coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
        'IDR'
    )
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email, name = EXCLUDED.name;

    -- Add default starter wallets for the new user
    INSERT INTO public.wallets (user_id, name, type, balance, icon)
    VALUES 
        (new.id, 'BCA', 'BANK', 0, 'Landmark'),
        (new.id, 'Dompet Tunai', 'CASH', 0, 'Banknote')
    ON CONFLICT DO NOTHING;

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

