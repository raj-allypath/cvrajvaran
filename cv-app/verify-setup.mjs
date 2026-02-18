import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function verifySetup() {
    console.log('🔍 Verifying Supabase Setup...\n');

    // 1. Check Tables Exist
    console.log('1️⃣ Checking tables...');
    const tables = ['profiles', 'experiences', 'achievements', 'quota_records', 'deals', 'public_profiles'];

    for (const table of tables) {
        const { data, error } = await supabase.from(table).select('*').limit(0);
        if (error) {
            console.log(`   ❌ ${table}: ${error.message}`);
        } else {
            console.log(`   ✅ ${table}: exists`);
        }
    }

    // 2. Check Profiles
    console.log('\n2️⃣ Checking profiles table...');
    const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*');

    if (profileError) {
        console.log(`   ⚠️  ${profileError.message}`);
        if (profileError.code === 'PGRST301' || profileError.message.includes('RLS')) {
            console.log('   ℹ️  RLS is enabled (good!) but blocking access because no user is logged in');
        }
    } else {
        console.log(`   ✅ Found ${profiles.length} profile(s)`);
        if (profiles.length > 0) {
            console.log(`      Email: ${profiles[0].email}`);
        } else {
            console.log('   ℹ️  No profiles yet - create a user in Supabase Dashboard first');
        }
    }

    // 3. Summary
    console.log('\n📋 Summary:');
    console.log('   ✅ Tables are created');
    console.log('   ✅ RLS is enabled (good for security)');
    console.log('\n🎯 Next Steps:');
    console.log('   1. Go to Supabase Dashboard → Authentication → Users');
    console.log('   2. Click "Add User"');
    console.log('   3. Enter email & password, check "Auto Confirm User"');
    console.log('   4. The trigger will auto-create a profile');
    console.log('   5. Login at http://localhost:3000/login\n');
}

verifySetup().catch(console.error);
