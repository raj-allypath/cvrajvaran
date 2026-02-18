import { supabase } from './supabase';

export const SEED_PROFILE = {
    full_name: 'Raj Varan',
    headline: 'Account Executive',
    summary: 'Process-focused Account Executive with a consistent record exceeding targets across multiple SaaS verticals (HR, Payroll, POS), demonstrating mastery in outbound prospecting and proven success in SMB and mid-market sales cycles ($10K–$120K ACV).',
    phone: '+61 435 444 143',
    email: 'rvaran1066@gmail.com',
    linkedin_url: null
};

export const SEED_EXPERIENCES = [
    {
        company_name: 'Knocknoc',
        role_title: 'Founding Account Executive · Commercial Lead',
        start_date: '2025-05-01',
        end_date: '2026-09-01',
        location: 'Melbourne, AU',
        vertical: 'Cybersecurity',
        avg_deal_size: '$50K–$200K',
        sales_cycle: '3–6 Months',
        summary: 'Cybersecurity SaaS — Zero-Trust orchestration platform',
        display_order: 1,
        achievements: [
            { description: 'Spearheaded go-to-market strategy targeting Critical Infrastructure, Financial Services, and Federal sectors across AU, APAC, and U.S.', metric_value: null, metric_type: null, display_order: 1 },
            { description: 'Drove multi-six-figure pipeline through outbound/inbound and partner motions', metric_value: '$300K', metric_type: 'Pipeline', display_order: 2 },
            { description: 'Led enterprise demos and POCs with Jefferies, OFX, BNY Mellon, AARNET, Ports Victoria, SA Water', metric_value: null, metric_type: null, display_order: 3 },
            { description: 'Built complete GTM system including messaging frameworks and sales collateral for Critical Infrastructure ICP', metric_value: null, metric_type: null, display_order: 4 }
        ],
        quota_records: [
            { period_label: '2025 YTD (Q3)', quota_target: null, attainment_percentage: 34.5, pipeline_generated: 300000, notes: null }
        ]
    },
    {
        company_name: 'Happen Business',
        role_title: 'Business Development Manager',
        start_date: '2024-06-01',
        end_date: '2025-05-01',
        location: 'Melbourne, AU',
        vertical: 'ERP',
        avg_deal_size: '$120K+',
        sales_cycle: '3–6 Months',
        summary: 'Jim2 ERP (Constellation Software) — mid-market inventory-oriented ERP',
        display_order: 2,
        achievements: [
            { description: 'Closed record ACV deal including B2B Web Portal add-on', metric_value: '$177,000', metric_type: 'ACV', display_order: 1 },
            { description: 'Established new GTM motion for new verticals; created cold-calling scripts, demo flows, and positioning talk tracks', metric_value: null, metric_type: null, display_order: 2 },
            { description: 'Rebooted Partner Program — organised Partner Events', metric_value: null, metric_type: null, display_order: 3 }
        ],
        quota_records: []
    },
    {
        company_name: 'Employment Hero',
        role_title: 'Account Executive',
        start_date: '2022-07-01',
        end_date: '2024-05-01',
        location: 'Melbourne, AU',
        vertical: 'HR & Payroll',
        avg_deal_size: '$5K–$120K',
        sales_cycle: '1–3 Months',
        summary: 'HR & Payroll SaaS — Net New Business and UpSells',
        display_order: 3,
        achievements: [
            { description: 'Held record for highest Outbound AE opportunity closed and prospected across NZ, SG, and AU', metric_value: null, metric_type: null, display_order: 1 },
            { description: 'Initiated referral partnership with Shiftcare (NDIS Sector)', metric_value: '$20K+', metric_type: 'ARR', display_order: 2 },
            { description: 'Led outbound training webinars and provided mentorship to SDR team', metric_value: null, metric_type: null, display_order: 3 }
        ],
        quota_records: [
            { period_label: '2024 H1', quota_target: null, attainment_percentage: 100, pipeline_generated: 200000, notes: null },
            { period_label: '2023 H1', quota_target: null, attainment_percentage: 120, pipeline_generated: null, notes: 'Presidents Club' },
            { period_label: '2023 H2', quota_target: null, attainment_percentage: 123, pipeline_generated: null, notes: 'Presidents Club' },
            { period_label: '2022 H2 (Ramp)', quota_target: null, attainment_percentage: 125, pipeline_generated: null, notes: null }
        ]
    },
    {
        company_name: 'Employment Hero',
        role_title: 'Outbound SDR',
        start_date: '2021-06-01',
        end_date: '2022-06-01',
        location: 'Melbourne, AU',
        vertical: 'HR & Payroll',
        summary: 'High-volume outbound prospecting across HR, Payroll, and EOR',
        display_order: 4,
        achievements: [
            { description: '#1 SDR by meetings set for Employer of Record — 25% of all meetings (Pure-Hunting)', metric_value: '25%', metric_type: '%', display_order: 1 },
            { description: 'Only SDR globally to attain target in Dec 2020', metric_value: null, metric_type: null, display_order: 2 }
        ],
        quota_records: [
            { period_label: 'Jul–Sep (Ramp)', quota_target: null, attainment_percentage: 100, pipeline_generated: null, notes: null },
            { period_label: 'Sep–Dec', quota_target: null, attainment_percentage: 110, pipeline_generated: null, notes: null },
            { period_label: 'Jan–Mar', quota_target: null, attainment_percentage: 120, pipeline_generated: null, notes: null },
            { period_label: 'Apr–May', quota_target: null, attainment_percentage: 100, pipeline_generated: null, notes: null }
        ]
    },
    {
        company_name: 'SparkHire',
        role_title: 'Outbound + Inbound SDR',
        start_date: '2020-02-01',
        end_date: '2021-06-01',
        location: 'Melbourne, AU',
        vertical: 'HR Tech',
        summary: 'Video Interview Software — 2nd Sales-Hire in APAC expansion team',
        display_order: 5,
        achievements: [
            { description: '2nd Highest Outbound ARR Pipeline globally in 2020–21 across APAC / EMEA / US', metric_value: null, metric_type: null, display_order: 1 },
            { description: 'Developed GTM strategy with USA Leadership to navigate COVID-19', metric_value: null, metric_type: null, display_order: 2 }
        ],
        quota_records: [
            { period_label: 'Mar–Jun (Ramp)', quota_target: null, attainment_percentage: 120, pipeline_generated: null, notes: null },
            { period_label: 'Jul–Dec', quota_target: null, attainment_percentage: 110, pipeline_generated: null, notes: null }
        ]
    },
    {
        company_name: 'Vend (LightSpeed)',
        role_title: 'Outbound + Inbound SDR',
        start_date: '2019-05-01',
        end_date: '2020-02-01',
        location: 'Melbourne, AU',
        vertical: 'POS / Retail',
        summary: 'POS + Inventory Management SaaS',
        display_order: 6,
        achievements: [
            { description: 'Selected for Win-back Campaign for churned customers by AE Team Leaders', metric_value: null, metric_type: null, display_order: 1 },
            { description: 'Consistent Quota Attainment + Over-achievement', metric_value: null, metric_type: null, display_order: 2 }
        ],
        quota_records: [
            { period_label: 'Jun–Aug (Ramp)', quota_target: null, attainment_percentage: 95, pipeline_generated: null, notes: null },
            { period_label: 'Sep', quota_target: null, attainment_percentage: 160, pipeline_generated: null, notes: null },
            { period_label: 'Oct', quota_target: null, attainment_percentage: 130, pipeline_generated: null, notes: null },
            { period_label: 'Nov', quota_target: null, attainment_percentage: 100, pipeline_generated: null, notes: null },
            { period_label: 'Dec', quota_target: null, attainment_percentage: 100, pipeline_generated: null, notes: null }
        ]
    }
];

/**
 * Seeds the database with initial career data.
 * Must be called AFTER a user and profile exist.
 */
export async function seedExperiences(userId: string) {
    for (const exp of SEED_EXPERIENCES) {
        const { achievements, quota_records, ...expData } = exp;

        const { data: inserted, error: expErr } = await supabase
            .from('experiences')
            .insert({ ...expData, user_id: userId })
            .select('id')
            .single();

        if (expErr || !inserted) throw expErr;

        if (achievements.length > 0) {
            const { error: achErr } = await supabase
                .from('achievements')
                .insert(achievements.map(a => ({ ...a, experience_id: inserted.id })));
            if (achErr) throw achErr;
        }

        if (quota_records.length > 0) {
            const { error: qErr } = await supabase
                .from('quota_records')
                .insert(quota_records.map(q => ({ ...q, experience_id: inserted.id })));
            if (qErr) throw qErr;
        }
    }

    return true;
}
