import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config();

const sql = postgres(process.env.DATABASE_URL);

async function fixLoanId() {
  try {
    console.log('🔧 Fixing loans table defaults...');
    
    // First, check the column types
    const columnTypes = await sql`
      SELECT column_name, data_type, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'loans' AND column_name IN ('id', 'created_at')
      ORDER BY column_name;
    `;
    console.log('📋 Current column info:', columnTypes);
    
    // Set the default for the id column
    await sql`ALTER TABLE loans ALTER COLUMN id SET DEFAULT gen_random_uuid();`;
    console.log('✅ ID default set successfully');
    
    // Set the default for the created_at column based on its type
    const createdAtCol = columnTypes.find(c => c.column_name === 'created_at');
    if (createdAtCol.data_type === 'timestamp without time zone' || createdAtCol.data_type === 'timestamp with time zone') {
      await sql`ALTER TABLE loans ALTER COLUMN created_at SET DEFAULT now();`;
      console.log('✅ created_at default set successfully (timestamp)');
    } else if (createdAtCol.data_type === 'bigint') {
      await sql`ALTER TABLE loans ALTER COLUMN created_at SET DEFAULT extract(epoch from now())::bigint;`;
      console.log('✅ created_at default set successfully (bigint)');
    }
    
    // Verify the changes
    const result = await sql`
      SELECT column_name, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'loans' AND column_name IN ('id', 'created_at')
      ORDER BY column_name;
    `;
    
    console.log('📋 Updated column definitions:', result);
    
    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    await sql.end();
    process.exit(1);
  }
}

fixLoanId();
