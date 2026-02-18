export type User = {
    id: string;
    email: string;
    created_at: string;
};

export type Profile = {
    id: string;
    user_id: string;
    full_name: string | null;
    headline: string | null;
    summary: string | null;
    phone: string | null;
    email: string | null;
    linkedin_url: string | null;
    created_at: string;
};

export type Experience = {
    id: string;
    user_id: string;
    company_name: string;
    role_title: string;
    start_date: string | null;
    end_date: string | null;
    location: string | null;
    vertical: string | null;
    avg_deal_size: string | null;
    sales_cycle: string | null;
    seat_range: string | null;
    decision_makers: string | null;
    summary: string | null;
    display_order: number;
    created_at: string;
    // Joined relations
    achievements?: Achievement[];
    quota_records?: QuotaRecord[];
    deals?: Deal[];
};

export type Achievement = {
    id: string;
    experience_id: string;
    description: string;
    metric_value: string | null;
    metric_type: string | null;
    display_order: number;
    created_at: string;
};

export type QuotaRecord = {
    id: string;
    experience_id: string;
    period_label: string | null;
    quota_target: number | null;
    attainment_percentage: number | null;
    pipeline_generated: number | null;
    notes: string | null;
    created_at: string;
};

export type Deal = {
    id: string;
    experience_id: string;
    company_name: string | null;
    deal_size: number | null;
    deal_type: string | null;
    industry: string | null;
    notes: string | null;
    created_at: string;
};

export type PublicProfile = {
    id: string;
    user_id: string;
    slug: string;
    is_active: boolean;
    created_at: string;
};
