# 🔧 Fix Supabase MCP Connection

## The Problem
The Supabase MCP server in Cursor isn't working because it needs proper authentication.

## ✅ Solution: Use PostgreSQL Direct Connection

### Option 1: Get Your Database Password

1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/vpqxigieedjwqmxducku/settings/database
2. Scroll to "Connection string"
3. Select "Connection pooling" → "Session mode"
4. Copy the password (it's hidden)

### Option 2: Reset Database Password

1. Go to: https://supabase.com/dashboard/project/vpqxigieedjwqmxducku/settings/database
2. Click "Reset database password"
3. Copy the new password
4. **SAVE IT SOMEWHERE SAFE!**

---

## Update MCP Configuration

### Step 1: Open Cursor Settings
- Mac: `Cmd + ,`
- Then search for "MCP" or go to Settings → MCP Servers

### Step 2: Edit Supabase Config

Replace the supabase section in `~/.cursor/mcp.json` with:

```json
"supabase": {
  "command": "npx",
  "args": [
    "-y",
    "@modelcontextprotocol/server-postgres",
    "postgresql://postgres.vpqxigieedjwqmxducku:YOUR_PASSWORD_HERE@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
  ]
}
```

**Replace `YOUR_PASSWORD_HERE` with your actual database password!**

### Step 3: Restart Cursor
Close and reopen Cursor completely.

---

## Alternative: Use Supabase REST API Directly

If PostgreSQL connection doesn't work, you can use the REST API:

### Create a custom MCP server script:

**File: `~/mcp-servers/supabase-mcp.js`**

```javascript
#!/usr/bin/env node

const SUPABASE_URL = 'https://vpqxigieedjwqmxducku.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwcXhpZ2llZWRqd3FteGR1Y2t1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzIxOTAzMiwiZXhwIjoyMDc4Nzk1MDMyfQ.j2NZCzVhdykXLSJXLVetJwOZZ1SAqANIb5S-N2U4UNM';

// MCP server implementation
console.error('Supabase MCP Server ready');

process.stdin.on('data', async (chunk) => {
  try {
    const request = JSON.parse(chunk.toString());
    
    if (request.method === 'tools/list') {
      process.stdout.write(JSON.stringify({
        tools: [
          {
            name: 'execute_sql',
            description: 'Execute SQL in Supabase',
            inputSchema: {
              type: 'object',
              properties: {
                query: { type: 'string', description: 'SQL query to execute' }
              },
              required: ['query']
            }
          }
        ]
      }) + '\n');
    } else if (request.method === 'tools/call' && request.params.name === 'execute_sql') {
      const { query } = request.params.arguments;
      
      // Execute via Supabase REST API
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        },
        body: JSON.stringify({ query })
      });
      
      const result = await response.json();
      
      process.stdout.write(JSON.stringify({
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
      }) + '\n');
    }
  } catch (error) {
    console.error('Error:', error);
  }
});
```

Then in `~/.cursor/mcp.json`:

```json
"supabase": {
  "command": "node",
  "args": ["/Users/idant/mcp-servers/supabase-mcp.js"]
}
```

---

## Verify It Works

After restarting Cursor, try running this SQL through me:

```sql
SELECT version();
```

If I can execute it successfully, the MCP is working!

---

## Quick Test

Once MCP is configured, ask me:
> "Can you run: SELECT COUNT(*) FROM auth.users"

If I return a number, it's working! 🎉

---

## Why This Matters

Once MCP works, I can:
- ✅ Create tables directly
- ✅ Run migrations
- ✅ Insert data
- ✅ Fix RLS policies
- ✅ Verify database state
- ✅ No more manual SQL copying!

---

## Troubleshooting

### "Connection refused"
- Check that you're using the correct password
- Make sure you're using the Connection Pooler URL (port 6543)
- Try resetting your database password

### "npx not found"
Install Node.js: https://nodejs.org/

### "Permission denied"
Make the script executable:
```bash
chmod +x ~/mcp-servers/supabase-mcp.js
```

### Still not working?
For now, just run the SQL manually in Supabase Dashboard. The app works perfectly once the database is set up!

---

**Let me know your database password and I'll update the MCP config for you!** 🔧

